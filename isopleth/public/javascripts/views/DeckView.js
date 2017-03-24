define([
  "jquery",
  "backbone",
  "underscore",
  "handlebars",
  "views/CardView"
], function ($, Backbone, _, Handlebars, CardView) {
  return Backbone.View.extend({
    events: {
      "click #filterMouse": "filterMouse",
      "click #filterKeyboard": "filterKeyboard",
      "click #filterSetup": "filterSetup",
      "click #filterAJAX": "filterAJAX",
      "click #filterDom": "filterDom"
    },

    visibleCards: [],

    activeFilterMap: {
      click: false,
      mousemove: false,
      mousedown: false,
      mouseup: false,
      mouseout: false,
      mouseover: false,
      mouseenter: false,
      mouseleave: false,
      keydown: false,
      keypress: false,
      keyup: false,
      ajaxRequest: false,
      ajaxResponse: false,
      jQueryCall: false
    },

    initialize: function (invokeGraph) {
      this.invokeGraph = invokeGraph;
      this.setElement($("#deckView"));

      this.showCard = _.bind(this.showCard, this);

      this.drawDeck();
    },

    clearDeck: function () {
      this.$("#deck").empty();
    },

    drawDeck: function () {
      this.clearDeck();

      var filters = _(_(this.activeFilterMap).keys()).filter(function (key) {
        return this.activeFilterMap[key]
      }, this);

      var invokeArr = this.invokeGraph.nativeRootInvokes;
      var _filters = _(filters);

      _(invokeArr).each(function (invoke) {
        if(invoke.isSequentialRepeat){
          return;
        }

        if (filters.length) {
          var found = _filters.find(function (aspect) {
            return invoke.aspectMap && invoke.aspectMap[aspect]
          });

          if (!found) {
            return;
          }
        }

        var cardView = new CardView(invoke.invocationId, this.invokeGraph);
        this.$("#deck").append(cardView.el);
      }, this);

      this.trigger("deckUpdate", filters);
    },

    showCard: function (invokeId) {
      this.clearDeck();
      var cardView = new CardView(invokeId, this.invokeGraph);
      this.$("#deck").append(cardView.el);
    },

    filterAction: function (buttonSelector, filterSet) {
      var $filterMouse = this.$(buttonSelector);
      $filterMouse.toggleClass("active");

      var isActive = !!$filterMouse.hasClass("active");
      _(filterSet).each(function (filter) {
        this.activeFilterMap[filter] = isActive;
      }, this);

      this.drawDeck();
    },

    filterMouse: function () {
      this.filterAction("#filterMouse", this.invokeGraph.mouseEvents);
    },

    filterKeyboard: function () {
      this.filterAction("#filterKeyboard", this.invokeGraph.keyEvents);
    },

    filterSetup: function () {
      this.filterAction("#filterSetup", ["setup"]);
    },

    filterAJAX: function () {
      this.filterAction("#filterAJAX", this.invokeGraph.ajaxEvents);
    },

    filterDom: function () {
      this.filterAction("#filterDom", []);
    },

  });
});