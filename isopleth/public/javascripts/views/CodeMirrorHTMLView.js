define([
  "jquery",
  "backbone",
  "underscore",
  "handlebars",
  "./GutterPillView",
  "../routers/JSBinSocketRouter",
  "text!../templates/MissingElMessage.html"

], function ($, Backbone, _, Handlebars, GutterPillView, JSBinSocketRouter, MissingElMessageTemplate) {
  return Backbone.View.extend({
    htmlMirror: null,
    htmlSource: "",
    markers: [],
    missingElTemplate: Handlebars.compile(MissingElMessageTemplate),

    initialize: function (codeMirrors, activeNodeCollection, jsBinRouter) {
      this.codeMirrors = codeMirrors;
      this.activeNodeCollection = activeNodeCollection;
      this.jsBinSocketRouter = JSBinSocketRouter.getInstance();
      this.jsBinRouter = jsBinRouter;
      this.collapseMask = _.bind(this.collapseMask, this);
      if (!this.$missingEl) {
        $("body").append(this.missingElTemplate());
        this.$missingEl = $("#missingEl");
        this.$missingElMask = $("#missingElMask");
        this.$missingEl.click(this.collapseMask);
        this.$missingElMask.click(this.collapseMask);
      }
    },

    render: function () {
      if (!this.htmlMirror) {
        this.htmlMirror = this.codeMirrors.html;
        this.htmlMirror.setOption('lineNumbers', true);
      }

      if (!this.htmlSource) {
        return;
      }

      this.htmlJSLinksView.removeAllHTMLGutterPills();
      this.deleteAllLines();

      this.htmlMirror.setCode(this.htmlSource);
      this.htmlJSLinksView.addHTMLGutterPills();
    },

    showMissingElMessage: function (domQueries, gutterPillView) {
      gutterPillView.nonDom = true;

      var message = "<h4>Queried element(s) are not in the DOM</h4>";

      _(domQueries).each(function (domQueryObj) {
        var domFnName = domQueryObj.domFnName;
        var queryString = domQueryObj.queryString;

        message += "<p>document." + domFnName + "(\"" + queryString + "\")</p>";
      }, this);

      this.$missingEl.find("#cm-el-message").html(message);
      var rect = $(".CodeMirror-code")[0].getBoundingClientRect();
      this.$missingEl.css({
        top: rect.top + (window.innerHeight - rect.top) / 4,
        left: rect.left + 10,
        width: rect.width - 40
      });

      this.$missingElMask.css({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
      this.$missingElMask.show();
      this.$missingEl.show();
    },

    collapseMask: function () {
      this.htmlJSLinksView.collapseAll();
    },

    hideMask: function () {
      this.$missingEl.hide();
      this.$missingElMask.hide();
    },

    deleteAllLines: function () {
      this.htmlMirror.setCode("");
    },

    whereLines: function (domFnName, queryString, iterFn, context) {
      if (context) {
        iterFn = _.bind(iterFn, context);
      }

      var htmlLineArr = [];
      for (var i = 0; i < this.htmlMirror.lineCount(); i++) {
        htmlLineArr.push(this.htmlMirror.getLine(i));
      }
      _(htmlLineArr).each(function (codeLine, lineNumber) {
        var queryFn = this.getjQueryFn(domFnName);

        try {
          if (queryFn(queryString, codeLine)) {
            iterFn(codeLine, lineNumber);
          }
        } catch (ig) {
        }
      }, this);
    },

    scrollTop: function () {
      window.setTimeout(_.bind(function () {
        this.scrollToLine(0);
      }, this), 1);
    },

    scrollToLine: function (line) {
      var t = this.htmlMirror.charCoords({line: line || 0, ch: 0}, "local").top;
      var middleHeight = this.htmlMirror.getScrollerElement().offsetHeight / 2;
      this.htmlMirror.scrollTo(null, t - middleHeight - 5);
    },

    highlightLine: function (lineNumber, length) {
      this.markers.push(this.htmlMirror.markText(
        {
          line: lineNumber,
          ch: 0
        },
        {
          line: lineNumber,
          ch: length - 1
        },
        {
          css: "background-color:#fffcbd"
        }
      ));
    },

    removeAllHighlights: function () {
      _(this.markers).each(function (marker) {
        marker.clear();
      });

      this.markers = [];
    },

    getjQueryFn: function (expression) {
      switch (expression) {
        case "getElementsByTagName":
          return function (val, line) {
            var $html = $("<html></html>");
            $html.append(line);
            return !!$html.find(val).length;
          };
          break;
        case "getElementsByTagNameNS":
          return function (val, line) {
            var $html = $("<html></html>");
            $html.append(line);
            return !!$html.find(val).length;
          };
          break;
        case "getElementsByClassName":
          return function (val, line) {
            var $html = $("<html></html>");
            $html.append(line);
            return !!$html.find("." + val).length;
          };
          break;
        case "getElementsByName":
          return function (val, line) {
            var $html = $("<html></html>");
            $html.append(line);
            return !!$html.find("[name='" + val + "']").length;
          };
          break;
        case "getElementById":
          return function (val, line) {
            var $html = $("<html></html>");
            $html.append(line);
            return !!$html.find("#" + val).length;
          };
          break;
        case "querySelector":
          return function (val, line) {
            var $html = $("<html></html>");
            $html.append(line);
            return !!$html.find(val).length;
          };
          break;
        case "querySelectorAll":
          return function (val, line) {
            var $html = $("<html></html>");
            $html.append(line);
            return !!$html.find(val).length;
          };
          break;
        default:
          return function () {
          }
      }
    }
  });
});