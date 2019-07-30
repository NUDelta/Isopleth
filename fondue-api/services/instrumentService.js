var cheerio = require('cheerio');
var _ = require('underscore');
var URI = require('URIjs');
var request = require("request");
var util = require("../util/util");
var routes = require("../routes/routes");
var fondueService = require("./fondueService");

var blockedDomains = [
  "https://www.zillow.com/-script-",
  "https://s.zillowstatic.com/homepage/_next/static/runtime/webpack-37c7117ec1e5094e1e66.js",
  "https://s.zillowstatic.com/homepage/_next/static/gqGL9hLZq4aKEK1b1kRRL/pages/buy.js",
  "https://s.zillowstatic.com/homepage/_next/static/runtime/main-1d0215c1a32fc3bfc2d7.js",
  "https://s.zillowstatic.com/homepage/_next/static/chunks/styles.dd3d8ccc3e131127ed83.js",
  // "https://s.zillowstatic.com/homepage/_next/static/gqGL9hLZq4aKEK1b1kRRL/pages/_app.js",
  "https://s.zillowstatic.com/homepage/_next/static/chunks/commons.c228028fd9b6a8638a2f.js",
  "https://s.zillowstatic.com/pfs/core-dd77a03e72d9f22e2b33.js",
  "static.chartbeat.com",
  "scorecardresearch.com",
  "connect.facebook.net",
  "google-analytics.com",
  "analytics",
  "beacon.krxd.net",
  "googletagservices.com",
  "cdn.districtm.ca/merge/merge",
  "api.filepicker.io/v1/filepicker.js",
  // "trackingTags_v1.1",
  // "html5shiv",
  "advertisement",
  "swfobject",
  // "ac-globalnav.built",
  "global/scripts/lib/prototype",
  // "browserdetect",
  "feedstatistics",
  // "search_decorator",
  // "redirect",
  "scriptaculous",
  // "ac-globalfooter.built",
  // "ac_retina",
  // "ac_base",
  // "s_code_h",
  // "apple_core",
  // "sizzle",
  "secure.assets.tumblr.com/languages/strings/en_US",
  "assets/scripts/tumblr/utils/exceptions.js",
  "assets/scripts/vendor/yahoo/rapid/rapidworker",
  "rapidworker-1.2.js",
  "rapid-3.36.1.js",
  "plugins.js?v=0.1",
  // "modernizr.custom",
  "cedexis",
  "gstatic",
  "strings/en_US.js",
  // "https://assets.tumblr.com/client/prod/app/header.build.js",
  "https://assets.tumblr.com/assets/scripts/vendor/yahoo/rapid/rapid-3.42.1.js",
  "https://assets.tumblr.com/assets/scripts/tumblr/utils/popover.js",
  "https://assets.tumblr.com/assets/scripts/registration/registration.js",
  "https://assets.tumblr.com/assets/scripts/dashboard.js",
  "https://assets.tumblr.com/client/prod/app/vendor.build.js",
  "https://assets.tumblr.com/client/prod/app/global.build.js",
  "gd-core-bottom",
  "gd-home",
];


module.exports = {
  getInlineScriptSources: function (url, callback) {
    request({
      url: url,
      method: "GET",
      rejectUnauthorized: false,
      headers: {
        "Cache-Control": "no-cache",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.8"
      }
    }, function (err, subRes, body) {
      if (err) throw err;

      console.log("Fetching inline scripts for JSBin", url);

      var arrJS = [];
      var $ = cheerio.load(body);
      var scripts = $("script").toArray();

      var beautifyNext = function (scriptNode, i) {
        var next = function () {
          if (scripts.length) {
            i++;
            beautifyNext(scripts.pop(), i);
          } else {
            callback(arrJS);
          }
        };

        var $scriptEl = $(scriptNode);
        if (url !== 'https://www.zillow.com/' && !$scriptEl.attr("src")) {
          var src = $scriptEl.html();
          util.beautifyJS(src, url, function (src) {
            arrJS.push({
              order: i,
              js: src
            });

            next();
          });
        } else {
          console.log("Skipping blocked inline script: ", url);
          next();
        }
      };

      beautifyNext(scripts.pop(), 0);
    });
  },

  instrumentHTML: function (url, basePath, callback) {
    request({
      url: url, method: "GET", rejectUnauthorized: false, gzip: true, headers: {
        "Cache-Control": "no-cache",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.8"
      }
    }, function (err, subRes, body) {
      if (err) {
        console.log("Error on fetching HTML. Returning \"\" for:", url);
        callback("");
        return;
      }

      if (_(blockedDomains).find(function (domain) {
        if (url.indexOf(domain) > -1) {
          return true;
        }
      })) {
        console.log("Blocking ad source request and returning original for:", url);

        callback(body);
        return;
      }

      body = util.beautifyHTML(body);  //Remove crap that breaks fondue

      var $ = cheerio.load(body);
      var domItems = $("*");
      _(domItems).each(function (domItem) {
        var $domItem = $(domItem);

        // if ($domItem.is("iframe")) {
        //   $domItem.remove();
        // }
        if ($domItem.is("script")) {
          $domItem.removeAttr("nonce");

          var elSrcLink = $domItem.attr("src");
          if (elSrcLink && elSrcLink.indexOf("chrome-extension") < 0) {
            if ($domItem.is("script")) {
              if (elSrcLink && elSrcLink.indexOf("http") < 0) {
                elSrcLink = URI(elSrcLink).absoluteTo(basePath).toString();
              }

              $domItem.attr("src", routes.HOST + routes.INSTRUMENT + "?js=true&url=" + encodeURIComponent(elSrcLink));
            }
          }
        }

      });

      var fondueOptions = {
        path: url,
        include_prefix: false
      };

      var cleanedSrc = $.html();
      fondueService.instrumentHTML(cleanedSrc, fondueOptions, function (src) {
        var $ = cheerio.load(src);
        $("html > head").prepend($("script")[0]);

        var html = $.html();
        if (html.indexOf("nonce") > -1) {
          throw new Error();
        }

        callback(html);
      });
    });

  },

  instrumentJS: function (url, basePath, callback) {
    request({
      url: url,
      fileName: basePath,
      method: "GET",
      rejectUnauthorized: false,
      gzip: true
    }, function (err, subRes, body) {
      if (err) {
        console.log("Error on fetching JS. Returning \"\" for:", url);
        callback("");
        return;
      }

      if (_(blockedDomains).find(function (domain) {
          if (url.indexOf(domain) > -1) {
            return true;
          }
        })) {
        console.log("Blocking ad source request and returning original for:", url);

        callback(body);
        return;
      }

      var fondueOptions = {
        path: url,
        include_prefix: false
      };

      fondueService.instrumentJavaScript(body, fondueOptions, function (src) {
        callback(src);
      });
    });
  }
};
