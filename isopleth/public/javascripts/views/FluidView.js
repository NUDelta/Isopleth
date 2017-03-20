define([
  "jquery",
  "backbone",
  "underscore",
  "handlebars",
  "views/DeckView",
  "views/CardView",
  "views/CallGraphView",
  "../routers/JSBinSocketRouter",
  "text!../templates/FluidView.html",
  "text!../templates/FluidView.css"
], function ($, Backbone, _, Handlebars, DeckView, CardView, CallGraphView, JSBinSocketRouter, FluidViewTemplate, FluidViewCSS) {
  return Backbone.View.extend({
    template: Handlebars.compile(FluidViewTemplate),

    el: "#fluidView",

    initialize: function (codeMirrors, sourceCollection, activeNodeCollection, invokeGraph, jsBinRouter) {
      this.$el.html(this.template({css: FluidViewCSS}));

      this.invokeGraph = invokeGraph;
      this.codeMirrors = codeMirrors;
      this.sourceCollection = sourceCollection;
      this.activeNodeCollection = activeNodeCollection;
      this.jsBinSocketRouter = JSBinSocketRouter.getInstance();
      this.jsBinRouter = jsBinRouter;
      this.callGraphView = new CallGraphView(this.invokeGraph);
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