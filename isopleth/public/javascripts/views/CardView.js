define([
  "jquery",
  "backbone",
  "underscore",
  "handlebars",
  "views/CodeMirrorView",
  "util/util",
  "text!../templates/CardView.html",
], function ($, Backbone, _, Handlebars, CodeMirrorView, util, CardViewTemplate) {
  return Backbone.View.extend({
    template: Handlebars.compile(CardViewTemplate),

    tagName: "div",

    className: "cardView",

    events: {
      "click .invoke-inputs": "toggleInputs",
      "click .invoke-binding": "toggleBinding",
      "click .invoke-declaration": "toggleDeclaration",
      "click .invoke-parent": "toggleParent",
      "click .invoke-outputs": "toggleOutputs",
      "click .invoke-delegates": "toggleDelegates",
      "click .invoke-effects": "toggleEffects",
      "keyup .invoke-label": "setCustomLabel",
      "blur .invoke-label": "checkEmptyLabel"
    },

    initialize: function (nodeId, invokeGraph, callGraphView) {
      this.invokeGraph = invokeGraph;
      this.callGraphView = callGraphView;
      this.invoke = this.invokeGraph.invokeIdMap[nodeId];

      if (!this.invoke) {
        console.warn("Tried to draw cardview without invoke.");
        return;
      }

      this.render();
    },

    render: function () {
      this.$el.append(this.template({
        description: this.invoke.getLabel()
      }));

      this.showActions();

      var source = this.invoke.node.source || "";
      this.mainCodeMirrorView = new CodeMirrorView(source, "265px");
      this.$(".main-javascript").append(this.mainCodeMirrorView.$el);
      if (!source) {
        this.$(".main-javascript").hide();
        this.$(".empty-javascript").show();
      }
    },

    toggleView: function (btnPath, viewPath, renderFn, leftRight) {
      var hideSideViews = _.bind(function () {
        leftRight === "right" ? this.$(".right-column .colview").hide() : this.$(".left-column .colview").hide();
      }, this);

      if (!this.$(btnPath).hasClass("active")) {
        leftRight === "right" ? this.$(".right-button-column span").removeClass("active") : this.$(".left-button-column span").removeClass("active");
      }
      this.$(btnPath).toggleClass("active");
      var $viewPathEl = this.$(viewPath);
      if ($viewPathEl.is(":visible")) {
        var callback = _.bind(function () {
          $viewPathEl.hide();
          hideSideViews();
        }, this);
        leftRight === "right" ? this.hideRight(callback) : this.hideLeft(callback);
      } else {
        if (renderFn) {
          renderFn();
        }
        hideSideViews();
        $viewPathEl.show();
        leftRight === "right" ? this.showRight() : this.showLeft();
      }
    },

    resizePane: function (panePath, width, callback) {
      this.$(panePath).animate({
        width: width
      }, 300, _(function (e) {
        if (callback) {
          callback(e);
        }
      }).bind(this));
    },

    setCustomLabel: function () {
      this.invoke.customLabel = this.$(".invoke-label").val();
      this.callGraphView.updateLabel(this.invoke.invocationId);
    },

    checkEmptyLabel: function () {
      this.invoke.customLabel = this.$(".invoke-label").val();
      if (!this.invoke.customLabel) {
        this.$(".invoke-label").val(this.invoke.getLabel());
      }
    },

    showLeft: function (callback) {
      this.resizePane(".left-column", "500px", callback);
    },

    hideLeft: function (callback) {
      this.resizePane(".left-column", "0px", callback);
    },

    showRight: function (callback) {
      this.resizePane(".right-column", "500px", callback);
    },

    hideRight: function (callback) {
      this.resizePane(".right-column", "0px", callback);
    },

    toggleInputs: function () {
      var args = this.invoke.arguments || [];

      if (!this.inputCodeMirrors) {
        this.inputCodeMirrors = [];

        _(args).each(function (arg) {
          var val = util.unMarshshalVal(arg.value);

          if (typeof val !== "string") {
            val = JSON.stringify(val, null, 2);
          }
          var codeMirrorView = new CodeMirrorView(val, "120px");

          this.inputCodeMirrors.push(codeMirrorView);

          this.$(".invoke-inputs-view").append(codeMirrorView.$el);
        }, this);
      }

      this.toggleView(".invoke-inputs span", ".invoke-inputs-view", null, "left");
    },

    toggleBinding: function () {
      var binders = this.invoke.parentAsyncSerialLinks || [];

      if (!this.bindingCodeMirrors) {
        this.bindingCodeMirrors = [];

        _(binders).each(function (invoke) {
          var codeMirrorView = new CodeMirrorView(invoke.node.source, "220px");
          this.bindingCodeMirrors.push(codeMirrorView);

          var $view = this.$(".invoke-binding-view");
          $view.append(this.getNavCardHTML(invoke));
          $view.append(codeMirrorView.$el);
        }, this);
      }

      this.toggleView(".invoke-binding span", ".invoke-binding-view", null, "left");
    },

    toggleDeclaration: function () {
      if (!this.invoke.parentAsyncLink) {
        return;
      }

      if (!this.declarationMirror && this.invoke.parentAsyncLink.node.source) {
        var codeMirrorView = new CodeMirrorView(this.invoke.parentAsyncLink.node.source, "270px");
        this.declarationMirror = codeMirrorView;

        var $view = this.$(".invoke-declaration-view");
        $view.append(this.getNavCardHTML(this.invoke.parentAsyncLink));
        $view.append(codeMirrorView.$el);
      }

      this.toggleView(".invoke-declaration span", ".invoke-declaration-view", null, "left");
    },

    toggleParent: function () {
      if (!this.invoke.parentCalls || !this.invoke.parentCalls[0]) {
        return;
      }

      if (!this.parentCallMirror) {
        var codeMirrorView = new CodeMirrorView(this.invoke.parentCalls[0].node.source, "270px");
        this.parentCallMirror = codeMirrorView;

        var $view = this.$(".invoke-parent-view");
        $view.append(this.getNavCardHTML(this.invoke.parentCalls[0]));
        $view.append(codeMirrorView.$el);
      }

      this.toggleView(".invoke-parent span", ".invoke-parent-view", null, "left");
    },

    toggleOutputs: function () {
      if (!this.invoke.returnValue) {
        return;
      }

      if (!this.returnValMirror) {
        var source = util.unMarshshalVal(this.invoke.returnValue);
        if (typeof source !== "string") {
          source = JSON.stringify(source, null, 2);
        }

        var codeMirrorView = new CodeMirrorView(source, "270px");
        this.returnValMirror = codeMirrorView;

        this.$(".invoke-outputs-view").append(codeMirrorView.$el);
      }

      this.toggleView(".invoke-outputs span", ".invoke-outputs-view", null, "right");
    },

    toggleDelegates: function () {
      var children = this.invoke.childCalls || [];

      if (!this.invokeChildrenCodeMirrors) {
        this.invokeChildrenCodeMirrors = [];

        var $delegatesView = this.$(".invoke-delegates-view");
        _(children).each(function (invoke) {
          var codeMirrorView = new CodeMirrorView(invoke.node.source, "120px");
          this.invokeChildrenCodeMirrors.push(codeMirrorView);

          $delegatesView.append(this.getNavCardHTML(invoke));
          $delegatesView.append(codeMirrorView.$el);
        }, this);
      }

      this.toggleView(".invoke-delegates span", ".invoke-delegates-view", null, "right");
    },

    toggleEffects: function () {
      var children = this.invoke.childAsyncSerialLinks || [];

      if (!this.invokeAsyncSerialChildrenCodeMirrors) {
        this.invokeAsyncSerialChildrenCodeMirrors = [];

        var $effectsView = this.$(".invoke-effects-view");

        _(children).each(function (invoke) {
          var codeMirrorView = new CodeMirrorView(invoke.node.source, "180px");
          this.invokeAsyncSerialChildrenCodeMirrors.push(codeMirrorView);

          $effectsView.append(this.getNavCardHTML(invoke));
          $effectsView.append(codeMirrorView.$el);
        }, this);
      }

      this.toggleView(".invoke-effects span", ".invoke-effects-view", null, "right");
    },

    getNavCardHTML: function (invoke) {
      var invisibleNote = this.isVisibleInvoke(invoke.invocationId) ? "(Hidden in Graph) " : "";

      return "<div class='navCard' targetId = '" + this.invoke.invocationId + "' sourceId ='" + invoke.invocationId + "'>Show Details: " + invisibleNote +  invoke.getLabel() + "</div>";
    },

    containsInvoke: function (arr) {
      if (!arr || arr.length < 1) {
        return false;
      }

      return true;
    },

    isVisibleInvoke: function (invokeId) {
      return !this.callGraphView.hideInvokeIdMap[invokeId];
    },

    showActions: function () {
      if (this.invoke.arguments && this.invoke.arguments.length) {
        this.$(".invoke-inputs").show();
      } else {
        this.$(".invoke-inputs").hide();
      }

      if (this.invoke.returnValue) {
        this.$(".invoke-outputs").show();
      } else {
        this.$(".invoke-outputs").hide();
      }

      if (this.invoke.parentAsyncLink) {
        this.$(".invoke-declaration").show();
      } else {
        this.$(".invoke-declaration").hide();
      }

      if (this.containsInvoke(this.invoke.parentCalls)) {
        this.$(".invoke-parent").show();
      } else {
        this.$(".invoke-parent").hide();
      }

      if (this.containsInvoke(this.invoke.childCalls)) {
        this.$(".invoke-delegates").show();
      } else {
        this.$(".invoke-delegates").hide();
      }

      if (this.containsInvoke(this.invoke.parentAsyncSerialLinks)) {
        this.$(".invoke-binding").show();
      } else {
        this.$(".invoke-binding").hide();
      }

      if (this.containsInvoke(this.invoke.childAsyncSerialLinks)) {
        this.$(".invoke-effects").show();
      } else {
        this.$(".invoke-effects").hide();
      }
    }

  });
});