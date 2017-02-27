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

    initialize: function (codeMirrors, sourceCollection, activeNodeCollection, jsBinRouter) {
      this.codeMirrors = codeMirrors;
      this.sourceCollection = sourceCollection;
      this.activeNodeCollection = activeNodeCollection;
      this.jsBinSocketRouter = JSBinSocketRouter.getInstance();
      this.jsBinRouter = jsBinRouter;
    },

    render: function () {
      this.$el.append(this.template());
    },

    onInvokes: function () {
      // this.$(".container").empty();
      // this.backtraceAsyncEvent();
    },

    processInvokes: function () {
      this.invocations = [];
      this.invokeIdMap = {};
      this.topLevelInvokes = [];

      _(this.activeNodeCollection.getGeneralNodes()).each(function (nodeModel) {
        var invokes = nodeModel.get("invokes");
        _(invokes).each(function (invoke) {
          if (!invoke.timestamp) {
            return;
          }

          this.invokeIdMap[invoke.invocationId] = invoke;
          this.invocations.push(invoke);
        }, this);
      }, this);

      this.invocations.sort(function (a, b) {
        if (a.timestamp > b.timestamp) {
          return 1;
        } else if (a.timestamp < b.timestamp) {
          return -1;
        } else {
          // Secondary sort on tick
          if (a.tick > b.tick) {
            return 1;
          } else if (a.tick < b.tick) {
            return -1;
          } else {
            return 0;
          }
        }
      });

      // Draw missing async links in graph
      // _(invocations).each(function (invoke) {
      //   if (invoke.node.type === "function") {
      //     if (invoke.topLevelInvocationId === invoke.invocationId) {
      //       topLevelInvokes.push(invoke);
      //
      //       // Search for async parent
      //       _(invocations).each(function (bInvoke) {
      //         var argMatch = _(bInvoke.arguments).find(function (arg) {
      //           return arg.value && arg.value.type === "function"
      //             && arg.value.json === invoke.node.source;
      //         });
      //
      //         if (argMatch) {
      //           if (invoke.asyncParentInvokeIds) {
      //             invoke.asyncParentInvokeIds.push(bInvoke.invocationId);
      //           } else {
      //             invoke.asyncParentInvokeIds = [bInvoke.invocationId];
      //           }
      //         }
      //       });
      //     }
      //   }
      // });
    },

    showCallGraph: function () {
      this.$(".container").empty();
      this.processInvokes();

      var callGraphView = new CallGraphView(this.invocations, this.invokeIdMap);
      this.$(".container").append(callGraphView.el);
      callGraphView.drawGraph();
    },

    backtraceAsyncEvent: function () {
      this.$(".container").empty();
      this.processInvokes();

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