define([
  "jquery",
  "backbone",
  "underscore",
  "handlebars",
  "views/DeckView",
  "views/CardView",
  "views/CallGraphView",
  "../routers/JSBinSocketRouter",
  "text!../templates/IsoplethView.html"
], function ($, Backbone, _, Handlebars, DeckView, CardView, CallGraphView, JSBinSocketRouter, FluidViewTemplate) {
  return Backbone.View.extend({
    template: Handlebars.compile(FluidViewTemplate),

    el: "#isoplethView",

    initialize: function (codeMirrors, sourceCollection, activeNodeCollection, invokeGraph, jsBinRouter) {
      this.$el.html(this.template());

      this.showCallGraph = _.bind(this.showCallGraph, this);
      this.showCallGraph = _.throttle(this.showCallGraph, 5000);
      this.invokeGraph = invokeGraph;
      this.codeMirrors = codeMirrors;
      this.sourceCollection = sourceCollection;
      this.activeNodeCollection = activeNodeCollection;
      this.jsBinSocketRouter = JSBinSocketRouter.getInstance();
      this.jsBinRouter = jsBinRouter;
      this.callGraphView = new CallGraphView(this.invokeGraph, activeNodeCollection);
      this.deckView = new DeckView(this.invokeGraph, this.callGraphView);
      this.callGraphView.on("nodeClick", this.deckView.showCard);
      this.callGraphView.on("edgeClick", this.deckView.showCards);
      this.deckView.on("deckUpdate", this.callGraphView.filterByAspect);
      this.deckView.on("navCard", this.callGraphView.handleEdgeClick);
      this.deckView.on("newAspectColor", this.callGraphView.addCustomColor);

      // this.callGraphView.draw();
    },

    render: function () {
    },

    showCallGraph: function () {
      this.callGraphView.drawGraph();
    }

  });
});