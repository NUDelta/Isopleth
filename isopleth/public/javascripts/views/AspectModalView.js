var exampleFunction = function (val) {
  // For Argument type,
  //   argument is passed in
  // For Return Value type,
  //   return value is passed in

  return val === "foo";
};

define([
  "jquery",
  "backbone",
  "underscore",
  "views/CodeMirrorView",
], function ($, Backbone, _, CodeMirrorView) {
  return Backbone.View.extend({
    events: {
      "click #saveNewAspect": "saveNewAspect",
      "click #close": "hide",
      "click .newFilterType": "toggleFilterType",
      "keyup #aspectColor input": "updateColorPreview"
    },

    renderTemplate: true,

    initialize: function () {
      this.setElement($("#newAspectModal"));
    },

    updateColorPreview: function () {
      var color = this.$("#aspectColor input").val();
      this.$(".color-preview").css("background-color", color);
    },

    show: function () {
      if (this.renderTemplate) {
        this.$(".content").html($("#modalTemplate").html());

        this.codeMirrorView = new CodeMirrorView(exampleFunction.toString(), "200px", true);
        this.$(".mirrorHandle").append(this.codeMirrorView.$el);

        this.renderTemplate = false;
      }

      this.$el.show();
    },

    hide: function () {
      this.$el.hide();
    },

    saveNewAspect: function () {

      var o = {};
      o.title = this.$("#newAspectTitle input").val();
      o.type = this.$(".newFilterType.active").attr("data");
      o.color = this.$("#aspectColor input").val() || "#ffb533";

      try {
        var jsFn = this.codeMirrorView.getCode();
        o.testFn = new Function("return " + jsFn)();
      } catch (i) {
      }

      if (!o.title || !o.type || !o.testFn) {
        alert("Err: invalid title, type, or test function.");
        return;
      }

      this.$el.hide();
      this.trigger("newAspect", o);

      this.renderTemplate = true;
    },

    toggleFilterType: function (e) {
      var $switchEl = this.$(e.currentTarget);
      if (!$switchEl.hasClass("active")) {
        this.$(".newFilterType").removeClass("active");
        $switchEl.addClass("active");
      }
    }
  });
});