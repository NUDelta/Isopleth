def([
  "jquery",
  "backbone",
  "underscore",
  "handlebars",
  "text!../templates/CardView.html"
], function ($, Backbone, _, Handlebars, CardViewTemplate) {
  return Backbone.View.extend({
    template: Handlebars.compile(CardViewTemplate),

    tagName: "div",

    className:"card",

    events: {
      "click": "flip"
    },

    initialize: function () {
      this.$el.append(this.template({
        bim: "bazz"
      }));
    },

    flip: function () {
      this.$el.toggleClass('flipped');
    }
  });
});