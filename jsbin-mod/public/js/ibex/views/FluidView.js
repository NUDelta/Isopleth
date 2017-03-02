def([
  "jquery",
  "backbone",
  "underscore",
  "handlebars",
  "views/CardView",
  "views/CallGraphView",
  "../routers/JSBinSocketRouter",
  "text!../templates/FluidView.html"
], function ($, Backbone, _, Handlebars, CardView, CallGraphView, JSBinSocketRouter, FluidViewTemplate) {
  return Backbone.View.extend({
    template: Handlebars.compile(FluidViewTemplate),

    el: "#fluidView",

    initialize: function (codeMirrors, sourceCollection, activeNodeCollection, invokeGraph, jsBinRouter) {
      this.invokeGraph = invokeGraph;
      this.codeMirrors = codeMirrors;
      this.sourceCollection = sourceCollection;
      this.activeNodeCollection = activeNodeCollection;
      this.jsBinSocketRouter = JSBinSocketRouter.getInstance();
      this.jsBinRouter = jsBinRouter;
    },

    render: function () {
      this.$el.append(this.template());
    },

    showCallGraph: function () {
      this.$(".container").empty();

      var callGraphView = new CallGraphView(this.invokeGraph);
      this.$(".container").append(callGraphView.$el);
      callGraphView.drawGraph();
    },

    backtraceAsyncEvent: function () {
      this.$(".container").empty();

      var lastInvoke = _(this.topLevelInvokes).last();
      if (!lastInvoke || !lastInvoke.asyncParentInvokeIds) {
        return console.warn("No async parent... hmmm.. number of top level invokes:", this.topLevelInvokes.length);
      }

      var asyncParentInvoke = this.invokeIdMap[lastInvoke.asyncParentInvokeIds[0]];
      if (!asyncParentInvoke) {
        return console.warn("No async parent invoke ids found.")
      }

      var cardView = new CardView(
        "Setup Function",
        this.activeNodeCollection.get(asyncParentInvoke.callStack[0].nodeId).get("source"));
      this.$(".container").append(cardView.el);

      cardView = new CardView(
        "Async Binding",
        asyncParentInvoke.node.source);
      this.$(".container").append(cardView.el);

      cardView = new CardView(
        "DOM hook registered: " + lastInvoke.arguments[0].value.ownProperties.type.value,
        lastInvoke.arguments[0].value.ownProperties.target.value);
      this.$(".container").append(cardView.el);

      cardView = new CardView(
        "The Interaction",
        lastInvoke.node.name + ": " + lastInvoke.node.source
      );
      this.$(".container").append(cardView.el);

      // console.log("The setup function for the interaction: ", activeNodeCollection.get(asyncParentInvoke.callStack[0].nodeId).get("source"));
      // console.log("It was bound at: ", asyncParentInvoke.node.source);
      // console.log("The callback was: ", lastInvoke.node.name, ":", lastInvoke.node.source);
      // Which called....
    }
  });
});