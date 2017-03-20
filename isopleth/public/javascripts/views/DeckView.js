define([
  "jquery",
  "backbone",
  "underscore",
  "handlebars",
  "views/CardView"
], function ($, Backbone, _, Handlebars, CardView) {
  return Backbone.View.extend({
    events: {},

    initialize: function (invokeGraph) {
      this.invokeGraph = invokeGraph;
      this.setElement($("#deckView"));

      this.drawCard = _.bind(this.drawCard, this);
    },

    drawCard: function (nodeId) {
      var cardView = new CardView(nodeId, this.invokeGraph);
      this.$el.html(cardView.el);
    },

    backtraceAsyncEvent: function () {
      this.$el.empty();

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
      this.$el.append(cardView.el);

      cardView = new CardView(
        "Async Binding",
        asyncParentInvoke.node.source);
      this.$el.append(cardView.el);

      cardView = new CardView(
        "DOM hook registered: " + lastInvoke.arguments[0].value.ownProperties.type.value,
        lastInvoke.arguments[0].value.ownProperties.target.value);
      this.$el.append(cardView.el);

      cardView = new CardView(
        "The Interaction",
        lastInvoke.node.name + ": " + lastInvoke.node.source
      );
      this.$el.append(cardView.el);

      // console.log("The setup function for the interaction: ", activeNodeCollection.get(asyncParentInvoke.callStack[0].nodeId).get("source"));
      // console.log("It was bound at: ", asyncParentInvoke.node.source);
      // console.log("The callback was: ", lastInvoke.node.name, ":", lastInvoke.node.source);
      // Which called....
    }
  });
});