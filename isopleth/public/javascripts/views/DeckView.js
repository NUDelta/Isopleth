define([
  "jquery",
  "backbone",
  "underscore",
  "handlebars",
  "views/CardView"
], function ($, Backbone, _, Handlebars, CardView) {
  return Backbone.View.extend({
    events: {
      "click .nav": "filterNav",
      "contextmenu .nav": "filterNavAlt",
      "click .navCard": "navCard"
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
      this.drawDeck = _.bind(this.drawDeck, this);
      this.navCard = _.bind(this.navCard, this);

      this.drawDeck();
    },

    clearDeck: function () {
      this.$("#deck").empty();
    },

    drawDeck: function () {
      this.clearDeck();

      var filters = _(_(this.activeFilterMap).keys()).filter(function (key) {
        return this.activeFilterMap[key] === true;
      }, this);

      var negateFilters = _(_(this.activeFilterMap).keys()).filter(function (key) {
        return this.activeFilterMap[key] === "negate";
      }, this);

      var invokeArr = this.invokeGraph.nativeRootInvokes;

      _(invokeArr).each(function (invoke) {
        if (invoke.isSequentialRepeat) {
          return;
        }

        if (filters.length) {
          var found = _(filters).find(function (aspect) {
            return invoke.aspectMap && invoke.aspectMap[aspect]
          });

          if (negateFilters) {
            var negateFound = _(negateFilters).find(function (aspect) {
              return invoke.aspectMap && invoke.aspectMap[aspect]
            });

            if(negateFound){
              return;
            }
          }

          if (!found) {
            return;
          }
        }

        var cardView = new CardView(invoke.invocationId, this.invokeGraph);
        this.$("#deck").append(cardView.el);
      }, this);

      this.trigger("deckUpdate", filters, negateFilters);
    },

    navCard: function(e){
      var invokeId = this.$(e.currentTarget).attr("data-id");
      this.showCard(invokeId);
      this.trigger("navCard", invokeId, true);
    },

    showCard: function (invokeId) {
      this.clearDeck();
      var cardView = new CardView(invokeId, this.invokeGraph);
      this.$("#deck").append(cardView.el);
    },

    filterNav: function (e) {
      var nav = this.$(e.currentTarget).attr("id");
      this[nav](e);
    },

    filterNavAlt: function (e) {
      e.preventDefault();
      var nav = this.$(e.currentTarget).attr("id");
      this[nav](e, true);
    },

    filterAction: function (buttonSelector, filterSet, negate) {
      var $filterMouse = this.$(buttonSelector);

      if (negate) {
        $filterMouse.removeClass("active");
        $filterMouse.toggleClass("negate");
      } else {
        $filterMouse.removeClass("negate");
        $filterMouse.toggleClass("active");
      }

      var filterStatus = false;
      if ($filterMouse.hasClass("active")) {
        filterStatus = true;
      } else if ($filterMouse.hasClass("negate")) {
        filterStatus = "negate";
      }

      _(filterSet).each(function (filter) {
        this.activeFilterMap[filter] = filterStatus;
      }, this);

      // Give the UI a chance to paint the button
      setTimeout(this.drawDeck, 10);
    },

    filterMouse: function (e, negate) {
      this.filterAction("#filterMouse", this.invokeGraph.mouseEvents, negate);
    },

    filterKeyboard: function (e, negate) {
      this.filterAction("#filterKeyboard", this.invokeGraph.keyEvents, negate);
    },

    filterSetup: function (e, negate) {
      this.filterAction("#filterSetup", ["setup"], negate);
    },

    filterAJAX: function (e, negate) {
      this.filterAction("#filterAJAX", this.invokeGraph.ajaxEvents, negate);
    },

    filterDom: function (e, negate) {
      this.filterAction("#filterDom", this.invokeGraph.domQueries, negate);
    },

  });
});