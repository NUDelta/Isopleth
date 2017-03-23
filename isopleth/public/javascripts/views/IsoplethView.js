define([
  "jquery",
  "backbone",
  "underscore",
  "handlebars",
  "views/DeckView",
  "views/CardView",
  "views/CallGraphView",
  "../routers/JSBinSocketRouter",
  "text!../templates/FluidView.html"
], function ($, Backbone, _, Handlebars, DeckView, CardView, CallGraphView, JSBinSocketRouter, FluidViewTemplate) {
  return Backbone.View.extend({
    template: Handlebars.compile(FluidViewTemplate),

    el: "#isoplethView",

    initialize: function (codeMirrors, sourceCollection, activeNodeCollection, invokeGraph, jsBinRouter) {
      this.$el.html(this.template());

      this.invokeGraph = invokeGraph;
      this.codeMirrors = codeMirrors;
      this.sourceCollection = sourceCollection;
      this.activeNodeCollection = activeNodeCollection;
      this.jsBinSocketRouter = JSBinSocketRouter.getInstance();
      this.jsBinRouter = jsBinRouter;
      this.callGraphView = new CallGraphView(this.invokeGraph, activeNodeCollection);
      this.deckView = new DeckView(this.invokeGraph);
      this.callGraphView.on("nodeClick", this.deckView.drawCard);
    },

    render: function () {
    },

    showCallGraph: function () {
      this.callGraphView.drawGraph();
    }

  });
});