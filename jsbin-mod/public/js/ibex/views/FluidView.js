def([
  "jquery",
  "backbone",
  "underscore",
  "handlebars",
  "views/CardView",
  "../routers/JSBinSocketRouter",
  "text!../templates/FluidView.html"
], function ($, Backbone, _, Handlebars, CardView, JSBinSocketRouter, FluidViewTemplate) {
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

      var cardView = new CardView();

      this.$(".container").append(cardView.el);
      var cardView = new CardView();

      this.$(".container").append(cardView.el);
      var cardView = new CardView();

      this.$(".container").append(cardView.el);
      var cardView = new CardView();

      this.$(".container").append(cardView.el);
    },

    onInvokes:function(){

    }
  });
});