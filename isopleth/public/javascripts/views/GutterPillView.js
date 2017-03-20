define([
  "jquery",
  "backbone",
  "underscore",
  "../util/util"
], function ($, Backbone, _, util) {
  return Backbone.View.extend({
    el: "<span class='theseus-call-count none'><span class='counts'></span></span>",

    events: {
      "click": "toggleTrace"
    },

    initialize: function (codeMirror, line, activeNodeModel, sourceCollection, htmlRelatedNodeModels, jsBinRouter) {
      this.sourceCollection = sourceCollection;
      this.line = line;
      this.jsBinRouter = jsBinRouter;
      this.mirror = codeMirror;
      this.marker = codeMirror.setGutterMarker(line, "pill-gutter", this.$el[0]);

      this.activeNodeModel = activeNodeModel;
      this.htmlRelatedNodeModels = htmlRelatedNodeModels;

      this.setDomModifier();
    },

    addRelatedDomQueries: function (relatedDomQueries) {
      this.relatedDomQueries = this.relatedDomQueries || [];
      this.relatedDomQueries = this.relatedDomQueries.concat(relatedDomQueries);
      this.relatedDomQueries = _(this.relatedDomQueries).uniq(function (domQueryObj) {
        return domQueryObj.domFnName + domQueryObj.queryString;
      });
    },

    getRelatedDomQueries: function () {
      return this.relatedDomQueries || [];
    },

    destroy: function () {
      this.mirror.setGutterMarker(this.marker, "pill-gutter", null);
      this.remove();
    },

    setCount: function (count) {
      var html = count + " Call" + (count === 1 ? "" : "s");
      if (this.htmlRelatedNodeModels) {
        html = "Query";
        this.$el.addClass("html-side")
      } else {
        this.$el.addClass("js-side")
      }

      this.$el.find(".counts").html(html);
      this.$el.toggleClass("none", count === 0);
      this.count = count;
    },

    getCount: function () {
      return this.count || 0;
    },

    setDomModifier: function () {
      if (this.activeNodeModel && this.activeNodeModel.get("domModifier")) {
        this.$el.addClass("domModifier");
      }
    },

    setCollapseFn: function (fn) {
      this.collapseFn = fn;
    },

    setExpandFn: function (fn) {
      this.expandFn = fn;
    },

    toggleTrace: function () {
      if (this.expanded) {
        this.$el.removeClass("selected");
        this.collapseFn(this);
      } else {
        this.$el.addClass("selected");
        this.expandFn(this);
      }
    }
  });
});