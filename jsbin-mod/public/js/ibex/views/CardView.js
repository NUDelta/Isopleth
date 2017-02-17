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

    className: "card",

    events: {
      "click": "flip"
    },

    initialize: function (description, code) {
      this.$el.append(this.template({
        description: description,
        code: code
      }));
    },

    flip: function () {
      this.$el.toggleClass('flipped');
    }
  });
});