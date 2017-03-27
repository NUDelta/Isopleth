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
      "click .invoke-delegates": "toggleDelegates"
    },

    initialize: function (nodeId, invokeGraph) {
      this.invokeGraph = invokeGraph;
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
          if (invoke.isLib || !invoke.node.source) {
            return;
          }

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

        _(children).each(function (invoke) {
          if (invoke.isLib || !invoke.node.source) {
            return;
          }

          var codeMirrorView = new CodeMirrorView(invoke.node.source, "120px");
          this.invokeChildrenCodeMirrors.push(codeMirrorView);

          var $delegatesView = this.$(".invoke-delegates-view");
          $delegatesView.append(this.getNavCardHTML(invoke));
          $delegatesView.append(codeMirrorView.$el);
        }, this);
      }

      this.toggleView(".invoke-delegates span", ".invoke-delegates-view", null, "right");
    },

    getNavCardHTML: function (invoke) {
      return "<div class='navCard' targetId = '" + this.invoke.invocationId + "' sourceId ='" + invoke.invocationId + "'>Show Details: " + invoke.getLabel() + "</div>";
    },

    showActions: function () {
      if (this.invoke.arguments && this.invoke.arguments.length) {
        this.$(".invoke-inputs").show();
      }

      if (this.invoke.returnValue) {
        this.$(".invoke-outputs").show();
      }

      if (this.invoke.parentAsyncLink) {
        this.$(".invoke-declaration").show();
      }

      if (this.invoke.parentCalls && this.invoke.parentCalls[0] && !this.invoke.parentCalls[0].isLib) {
        this.$(".invoke-parent").show();
      }

      if (this.invoke.childCalls) {
        this.$(".invoke-delegates").show();
      }

      if (this.invoke.parentAsyncSerialLinks) {
        this.$(".invoke-binding").show();
      }
    }

  });
});