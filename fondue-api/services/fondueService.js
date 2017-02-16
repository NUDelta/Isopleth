var fondue = require("../fondue/fondue");
var crypto = require("crypto");
var redis = require('redis');
var redisClient = redis.createClient();
var util = require("../util/util");
var _ = require("underscore");

redisClient.on('connect', function () {
  console.log('Redis Connected.');
});

module.exports = {
  /**
   Returns instrumented JavaScript. From the cache, if it's there.
   */
  instrumentJavaScript: function (src, fondueOptions, callback, passedSource, i, iterLoc) {
    // TODO ISOPLETH caching is off!
    // var md5 = crypto.createHash("md5");
    // var store = {
    //   passedSource: passedSource,
    //   path: fondueOptions.path,
    //   include_prefix: fondueOptions.include_prefix,
    //   i: i,
    //   iterLoc: iterLoc
    // };
    // var phrase = JSON.stringify(store);
    // md5.update(phrase);
    // var digest = md5.digest("hex");

    // redisClient.get(digest, function (err, foundSrc) {
    var errOpt = {};
    //   if (foundSrc != null) {
    //     console.log("Retrieved instrumentation for", fondueOptions.path);
    //     callback(foundSrc, passedSource, i, iterLoc, errOpt);
    //   } else {
    console.log("Instrument Start:\t", fondueOptions.path);

    fondue.instrument(src, fondueOptions, errOpt, function (src) {
      var instrumentedSrc = src.toString();
      if (!errOpt.beautifyErr) {
        console.log("Instrument Finish:\t", fondueOptions.path);
      }

      callback(instrumentedSrc, passedSource, i, iterLoc, errOpt);
    });

    //     redisClient.set(digest, instrumentedSrc, function (err, reply) {
    //       if (err) {
    //         console.log("Error on saving source!");
    //       } else {
    //
    //       }
    //     });
    //   }
    // });
  },

  /**
   Returns the given HTML after instrumenting all JavaScript found in <script> tags.
   */
  instrumentHTML: function (src, fondueOptions, callback) {
    var scriptLocs = [];
    var scriptBeginRegexp = /<\s*script[^>]*>/ig;
    var scriptEndRegexp = /<\s*\/\s*script/i;
    var lastScriptEnd = 0;

    var match;
    while (match = scriptBeginRegexp.exec(src)) {
      var scriptBegin = match.index + match[0].length;
      if (scriptBegin < lastScriptEnd) {
        continue;
      }
      var endMatch = scriptEndRegexp.exec(src.slice(scriptBegin));
      if (endMatch) {
        var scriptEnd = scriptBegin + endMatch.index;
        scriptLocs.push({start: scriptBegin, end: scriptEnd});
        lastScriptEnd = scriptEnd;
      }
    }

    var hits = 0;
    var retSrc = [];
    var unTracedSources = [];
    var instCallback = function (instSrc, passedSrc, preI, iterLoc, passedOpts) {
      hits++;
      retSrc[preI] = instSrc;
      if (passedOpts.beautifyErr && passedOpts.path) {
        unTracedSources.push(passedOpts.path);
      }

      if (hits === scriptLocs.length || scriptLocs.length < 1) {
        for (var i = scriptLocs.length - 1; i >= 0; i--) {
          //retSrc is just source only, the other parts are dom
          passedSrc = passedSrc.slice(0, scriptLocs[i].start) + retSrc[i] + passedSrc.slice(scriptLocs[i].end);
        }

        // remove the doctype if there was one (it gets put back below)
        var doctype = "";
        var doctypeMatch = /^(<!doctype[^\n]+\n)/i.exec(passedSrc);
        if (doctypeMatch) {
          doctype = doctypeMatch[1];
          passedSrc = passedSrc.slice(doctypeMatch[1].length);
        }

        var untraced = "<script id='unravelUntraced'>\n(function(){ window.unravelAgent.skipSources = " + JSON.stringify(unTracedSources) + " })();\n</script>\n";

        // assemble!
        passedSrc = doctype + "<script>\n" + fondue.instrumentationPrefix(fondueOptions) + "\n</script>\n" + untraced + passedSrc;

        callback(passedSrc, true);
      }
    };

    if (scriptLocs.length < 1) {
      instCallback(null, src, 0);
    } else {
      // process the scripts in reverse order
      for (var i = scriptLocs.length - 1; i >= 0; i--) {
        var loc = scriptLocs[i];
        var script = src.slice(loc.start, loc.end);
        var options = util.mergeInto(fondueOptions, {});
        options.path = options.path + "-script-" + i;
        var prefix = src.slice(0, loc.start).replace(/[^\n]/g, " "); // padding it out so line numbers make sense
        this.instrumentJavaScript(prefix + script, options, instCallback, src.valueOf(), i, loc);
      }
    }
  }

};