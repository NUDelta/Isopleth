define([
  "jquery",
  "backbone",
  "underscore"
], function ($, Backbone, _) {

  var util = {
    isKnownLibrary: function (testStr) {
      return !!_([
        "a3c5de",
        "b66ed7",
        "1b9456",
        "jquery",
        "moderniz",
        "zepto",
        "plugins",
        "moment",
        "underscore",
        "backbone",
        "require",
        "angular",
        "react",
        "handlebars",
        "html5shiv",
        "underscore",
        "plugins.js",
      ]).find(function (lib) {
        if (testStr.toLowerCase().indexOf(lib) > -1) {
          return true;
        }
      });
    },

    unMarshalFunctionVal: function (o) {
      return o.json;
    },

    unMarshalObjectVal: function (o) {
      var partialObj = o.ownProperties;
      var actualObj = {};
      _(_(partialObj).keys()).each(function (key) {
        actualObj[key] = util.unMarshshalVal(partialObj[key])
      });

      return actualObj;
    },

    unMarshshalVal: function (o) {
      if (o.type && o.type.indexOf("object") > -1) {
        if (o.preview && o.preview.indexOf("Array") > -1) {
          return util.unMarshalArrayVal(o);
        } else {
          return util.unMarshalObjectVal(o);
        }
      } else if (o.type && o.type.indexOf("function") > -1) {
        return util.unMarshalFunctionVal(o)
      } else {
        return o.value;
      }
    },

    unMarshalArrayVal: function (o) {
      var arr = [];
      _(_(o.ownProperties).keys()).each(function (key) {
        arr.push(util.unMarshshalVal(o.ownProperties[key]))
      });

      return arr;
    },

    stringifyObjToHTML: function (obj) {
      var json = JSON.stringify(obj, null, 2);

      json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      });
    },

    getAllDOMFns: function () {
      var partialKeys = [];

      //Gather all fn's in HTML Document that modify
      for (var key in HTMLDocument.prototype) {
        if (typeof document[key] === "function") {
          partialKeys.push(key);
        }
      }

      //Gather all fn's in the Element prototype that modify
      for (var key in HTMLElement.prototype) {
        try {
          if (typeof HTMLElement.prototype[key] === "function") {
            partialKeys.push(key);
          }
        } catch (ignored) {
        }
      }

      return _(partialKeys).unique();
    }
  };

  return util;
});