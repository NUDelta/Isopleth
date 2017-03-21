define([
  "jquery",
  "backbone",
  "underscore",
  "handlebars",
  "text!../templates/CardView.html",
], function ($, Backbone, _, Handlebars, CardViewTemplate) {
  return Backbone.View.extend({
    template: Handlebars.compile(CardViewTemplate),

    tagName: "div",

    className: "cardView",

    events: {
      "click .invoke-inputs": "toggleInputs",
      "click .invoke-binding": "toggleBinding",
      "click .invoke-declaration": "toggleDeclaration",
      "click .invoke-outputs": "toggleOutputs",
      "click .invoke-delegates": "toggleDelegates"
    },

    initialize: function (nodeId, invokeGraph) {
      this.invokeGraph = invokeGraph;
      this.invoke = this.invokeGraph.invokeIdMap[nodeId];

      if (!this.invoke) {
        console.warn("Tried to draw cardview without invoke.");
        return;
      }

      this.render();
    },

    render: function () {
      var code = this.invoke.node.source || "";

      this.$el.append(this.template({
        description: this.invoke.getLabel(),
        code: code
      }));

      var codeArea = this.$(".cardMirror")[0];
      this.codeMirror = CodeMirror.fromTextArea(codeArea, {
        parserfile: [],
        readOnly: true,
        dragDrop: false,
        mode: "javascript",
        lineWrapping: true,
        tabSize: 2,
        gutters: ['pill-gutter', "CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        lineNumbers: true,
        foldGutter: true,
        theme: 'default',
        styleActiveLine: true,
        scrollbarStyle: "null",
        matchBrackets: true
      });
      this.setCode(code);
    },

    toggleView: function (btnPath, viewPath, renderFn, leftRight) {
      var hideSideViews = _.bind(function () {
        leftRight === "right" ? this.$(".right-column .colview").hide() : this.$(".left-column .colview").hide();
      }, this);

      if (!this.$(btnPath).hasClass("active")) {
        leftRight === "right" ? this.$(".right-button-column span").removeClass("active") : this.$(".left-button-column span").removeClass("active");
      }
      this.$(btnPath).toggleClass("active");
      var $viewPathEl = this.$(viewPath);
      if ($viewPathEl.is(":visible")) {
        var callback = _.bind(function () {
          $viewPathEl.hide();
          hideSideViews();
        }, this);
        leftRight === "right" ? this.hideRight(callback) : this.hideLeft(callback);
      } else {
        if (renderFn) {
          renderFn();
        }
        hideSideViews();
        $viewPathEl.show();
        leftRight === "right" ? this.showRight() : this.showLeft();
      }
    },

    resizePane: function (panePath, width, callback) {
      this.$(panePath).animate({
        width: width
      }, 300, _(function (e) {
        if (callback) {
          callback(e);
        }
      }).bind(this));
    },

    setCode: function (code) {
      this.codeMirror.getDoc().setValue(code);
      setTimeout(_.bind(function () {
        this.codeMirror.refresh();
      }, this), 1);
    },

    showLeft: function (callback) {
      this.resizePane(".left-column", "300px", callback);
    },

    hideLeft: function (callback) {
      this.resizePane(".left-column", "0px", callback);
    },

    showRight: function (callback) {
      this.resizePane(".right-column", "300px", callback);
    },

    hideRight: function (callback) {
      this.resizePane(".right-column", "0px", callback);
    },

    toggleInputs: function () {
      this.toggleView(".invoke-inputs span", ".invoke-inputs-view", null, "left");
    },

    toggleBinding: function () {
      this.toggleView(".invoke-binding span", ".invoke-binding-view", null, "left");
    },

    toggleDeclaration: function () {
      this.toggleView(".invoke-declaration span", ".invoke-declaration-view", null, "left");
    },

    toggleOutputs: function () {
      this.toggleView(".invoke-outputs span", ".invoke-outputs-view", null, "right");
    },

    toggleDelegates: function () {
      this.toggleView(".invoke-delegates span", ".invoke-delegates-view", null, "right");
    },

  });
});