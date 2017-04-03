define([
  "jquery",
  "backbone",
  "underscore",
  "handlebars",
  "views/CardView",
  "views/AspectModalView"
], function ($, Backbone, _, Handlebars, CardView, AspectModalView) {
  return Backbone.View.extend({
    events: {
      "click .nav:not(#filterAdd)": "filterNav",
      "contextmenu .nav": "filterNavAlt",
      "click .navCard": "navCard",
      "click #filterAdd": "filterAdd"
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

    initialize: function (invokeGraph, callGraphView) {
      this.invokeGraph = invokeGraph;
      this.callGraphView = callGraphView;
      this.setElement($("#deckView"));

      this.showCard = _.bind(this.showCard, this);
      this.showCards = _.bind(this.showCards, this);
      this.drawDeck = _.bind(this.drawDeck, this);
      this.navCard = _.bind(this.navCard, this);
      this.addAspect = _.bind(this.addAspect, this);

      this.aspectModalView = new AspectModalView();
      this.aspectModalView.on("newAspect", this.addAspect);

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
            return invoke.aspectMap[aspect]
          });

          if (!found) {
            return;
          }
        }

        if (negateFilters && negateFilters.length) {
          var negateFound = _(negateFilters).find(function (aspect) {
            return invoke.aspectMap[aspect]
          });

          if (negateFound) {
            return;
          }
        }

        this.addCard(invoke.invocationId);
      }, this);

      this.trigger("deckUpdate", filters, negateFilters);
    },

    addCard:function(invokeId){
      var cardView = new CardView(invokeId, this.invokeGraph, this.callGraphView);
        this.$("#deck").append(cardView.el);
    },

    navCard: function (e) {
      var sourceId = this.$(e.currentTarget).attr("sourceId");
      var targetId = this.$(e.currentTarget).attr("targetId");
      this.showCards([sourceId, targetId]);
      this.trigger("navCard", sourceId, targetId, true);
    },

    showCard: function (invokeId) {
      this.clearDeck();
      this.addCard(invokeId);
    },

    showCards: function (arrInvokeIds) {
      this.clearDeck();
      _(arrInvokeIds).each(function(invokeId){
        this.addCard(invokeId);
      }, this);
    },

    filterNav: function (e) {
      var $filterNav = this.$(e.currentTarget);
      var nav = $filterNav.attr("id");

      if ($filterNav.hasClass("customFilter")) {
        this.filterNavCustom(e)
      } else {
        this[nav](e);
      }
    },

    filterNavAlt: function (e) {
      e.preventDefault();
      var $filterNav = this.$(e.currentTarget);
      var nav = $filterNav.attr("id");

      if ($filterNav.hasClass("customFilter")) {
        this.filterNavCustom(e, true)
      } else {
        this[nav](e, true);
      }
    },

    filterAction: function (buttonSelector, filterSet, negate, mock) {
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

      if(mock){
        return;
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
      this.filterAction("#filterSetup", ["setup"], negate, true);
    },

    filterAJAX: function (e, negate) {
      this.filterAction("#filterAJAX", this.invokeGraph.ajaxEvents, negate);
    },

    filterDom: function (e, negate) {
      this.filterAction("#filterDom", this.invokeGraph.domQueries, negate);
    },

    filterNone: function (e, negate) {
      this.filterAction("#filterNone", [], negate, true);
    },

    filterAdd: function () {
      this.aspectModalView.show();
    },

    filterNavCustom: function (e, negate) {
      var $filterEl = this.$(e.currentTarget);
      this.filterAction("#" + $filterEl.attr("id"), [$filterEl.attr("aspect")], negate);
    },

    addAspect: function (aspectDTO) {
      var title = aspectDTO.title;
      var id = "filter-iso-" + new Date().getTime();
      var type = aspectDTO.type;
      var testFunction = aspectDTO.testFn;
      var color = aspectDTO.color;

      var argFn = type === "arg" ? testFunction : null;
      var returnFn = type === "returnVal" ? testFunction : null;
      var aspect = "*" + title;

      $("<li id='" + id + "' class='nav customFilter' aspect='" + aspect + "'>" + title + "</li>").insertBefore("#filterAdd");

      this.invokeGraph.classifyCustom(aspect, argFn, returnFn);
      this.trigger("newAspectColor", aspect, color);

      setTimeout(this.drawDeck, 10);
    }
  });
});