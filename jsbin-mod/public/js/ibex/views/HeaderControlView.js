def([
  "jquery",
  "backbone",
  "underscore",
  "handlebars",
  "Plotly",
  "moment",
  "text!../templates/UIControls.html"
], function ($, Backbone, _, Handlebars, Plotly, moment, UIControlsTemplate) {
  return Backbone.View.extend({
    template: Handlebars.compile(UIControlsTemplate),

    el: ".control",

    jsOrderReversed: true,

    slideValLower: 0,

    slideValUpper: 0,

    events: {
      "click #pauseUpdates": "togglePauseClicked",
      "click #resetTraces": "resetClicked",
      "click #jsScriptOrder": "toggleJSOrder",
      "click #aspect-setup": "aspectSetup",
      "click #aspect-tiles": "aspectTiles",
      "click #aspect-graph": "aspectGraph"
    },

    initialize: function (activeNodeCollection) {
      this.activeNodeCollection = activeNodeCollection;

      this.timeSlideChange = _.bind(this.timeSlideChange, this);
      this.jsDetailChange = _.bind(this.jsDetailChange, this);
      this.pause = _.bind(this.pause, this);
      this.resume = _.bind(this.resume, this);

      this.triggerSlideChangeThrottled = _.throttle(_.bind(function () {
        this.triggerSlideChange();
      }, this), 1000);
    },

    render: function () {
      this.$("#fondue-ui-controls").remove();

      this.$el.append(this.template());

      this.renderDetailSlider();
      this.renderSlider();
    },

    renderDetailSlider: function () {
      this.$detailSlider = this.$("#detailSlider");
      this.$detailSlider.slider({
        range: "min",
        min: 1,
        max: 100,
        value: 1,
        orientation: "horizontal",
        animate: true,
        slide: this.jsDetailChange
      });
    },

    renderSlider: function () {
      this.$(".timeline-slider-wrap #timeLineSlider").remove();
      this.$(".timeline-slider-wrap").append("<div id='timeLineSlider'></div>");
      this.$timeLineSlider = this.$("#timeLineSlider");

      this.earliestTS = this.activeNodeCollection.getEarliestTimeStamp();
      this.latestTS = this.activeNodeCollection.getLatestTimeStamp();

      this.$timeLineSlider.slider({
        range: true,
        min: this.earliestTS,
        max: this.latestTS,
        values: [this.slideValLower || this.earliestTS, this.slideValUpper || this.latestTS],
        slide: this.timeSlideChange
      });
      this.updateCallTimeSliderLabel()
    },

    aspectSetup: function () {
    },

    aspectTiles: function () {
      this.trigger("aspect:tiles");
    },

    aspectGraph: function () {
      this.trigger("aspect:graph");
    },

    renderPlot: function () {
      var callTimes = _(this.activeNodeCollection.models).chain()
        .map(function (model) {
          return model.get("invokes")
        })
        .flatten()
        .pluck("timestamp")
        .value()
        .sort(function (a, b) {
          return b - a;
        });

      var interval = 1000;

      // Get values for range of histogram's x axis
      var greatestVal = callTimes[0];
      var leastVal = callTimes[callTimes.length - 1];
      var x = _.range(leastVal + interval, greatestVal + interval, interval);

      // Get value counts for histogram's y axis
      var y = _(x).map(function (num) {
        var count = 0;

        // Remove elements from end of array while we iterate through
        // to avoid duplicate lookups
        for (var i = callTimes.length - 1; i >= 0; i--) {
          // Put everything less than the histogram x in that x value
          if (callTimes[i] <= num) {
            // console.log(callTimes[i], "<=", num)
            count++;
            callTimes.pop();
          } else {
            break;
          }
        }

        return count;
      });

      x = _(x).map(function(num){
        return Math.floor((num - leastVal) / 1000);
      });

      var $plotEl = $("#plotter");
      if ($plotEl.children().length < 1) {
        var trace1 = {
          x: x,
          y: y,
          name: 'Rest of world',
          marker: {color: 'rgb(55, 83, 109)'},
          type: 'bar'
        };

        var data = [trace1];

        var layout = {
          xaxis: {
            title: "Runtime in Seconds",
            tickfont: {
              size: 14,
              color: 'rgb(107, 107, 107)'
            }
          },
          yaxis: {
            title: "Calls",
            titlefont: {
              size: 16,
              color: 'rgb(107, 107, 107)'
            },
            tickfont: {
              size: 14,
              color: 'rgb(107, 107, 107)'
            }
          },
          barmode: 'group',
          bargap: 0.1
        };

        Plotly.newPlot($plotEl[0], data, layout);
      } else {
        Plotly.restyle($plotEl[0], {
          x: [x],
          y: [y]
        });
      }
    },

    timeSlideChange: function (event, ui) {
      this.slideValLower = ui.values[0];
      this.slideValUpper = ui.values[1];

      this.updateCallTimeSliderLabel();

      this.activeNodeCollection.setTimeStampBounds(this.slideValLower, this.slideValUpper);
      this.triggerSlideChangeThrottled();
    },

    updateCallTimeSliderLabel: function () {
      var lowerDiff;
      if (this.slideValLower) {
        lowerDiff = this.getTimeDiff(this.earliestTS, this.slideValLower);
      } else {
        lowerDiff = "0s";
      }
      var higherDiff;
      if (this.slideValUpper) {
        higherDiff = this.getTimeDiff(this.earliestTS, this.slideValUpper);
      } else {
        higherDiff = this.getTimeDiff(this.earliestTS, this.latestTS);
      }

      this.$("#slideValLower").text(lowerDiff);
      this.$("#slideValUpper").text(higherDiff);
    },

    getTimeDiff: function (tsA, tsB) {
      var a = moment(tsA);
      var b = moment(tsB);
      var seconds = b.diff(a, 's');
      seconds = seconds ? seconds + "s" : "";

      if (!seconds) {
        seconds = "0s";
      }

      return seconds;
    },

    triggerSlideChange: function () {
      this.trigger("timeSlideChange");
    },

    setTimeSlideVal: function (lowerVal, upperVal) {
      this.$timeLineSlider.slider("values", lowerVal);
      this.$timeLineSlider.slider("values", upperVal);
    },

    jsDetailChange: function (event, ui) {
      var newVal = Math.ceil(ui.value / 20);

      if (this.lastDetailSlideVal) {
        if (newVal !== this.lastDetailSlideVal) {
          this.$('#detailLevel').text(newVal);
          this.lastDetailSlideVal = newVal;
          this.trigger("jsDetailChange", newVal);
        }
      } else {
        this.lastDetailSlideVal = newVal
      }
    },

    togglePauseClicked: function () {
      if (this.paused) {
        this.trigger("activeCodePanel:pause", false);
        this.resume();
      } else {
        this.trigger("activeCodePanel:pause", true);
        this.pause();
      }
    },

    toggleJSOrder: function () {
      if (this.jsOrderReversed) {
        this.$(".orderUpDown.reverse").hide();
        this.$(".orderUpDown.normal").show();
        this.jsOrderReversed = false;
      } else {
        this.$(".orderUpDown.reverse").show();
        this.$(".orderUpDown.normal").hide();
        this.jsOrderReversed = true;
      }
      this.trigger("controlView:order", this.jsOrderReversed);
    },

    pause: function () {
      this.paused = true;
      var $pauseUpdates = this.$("#pauseUpdates");
      $pauseUpdates.find("#pauseStatusOn").hide();
      $pauseUpdates.find("#pauseStatusOff").show();
      $pauseUpdates.parent().addClass("active");
      $pauseUpdates.parent().removeClass("inactive");
    },

    resume: function () {
      this.paused = false;
      var $pauseUpdates = this.$("#pauseUpdates");
      $pauseUpdates.find("#pauseStatusOn").show();
      $pauseUpdates.find("#pauseStatusOff").hide();
      $pauseUpdates.parent().removeClass("active");
      $pauseUpdates.parent().addClass("inactive");
    },

    resetClicked: function (e) {
      this.trigger("activeCodePanel:reset", false);
    }
  });
});