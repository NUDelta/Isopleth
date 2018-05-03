define([
  "jquery",
  "backbone",
  "underscore",
  "../views/GutterPillView",
  "../views/DropDownJSView",
  "../views/HeaderControlView",
  "../views/CodeMirrorJSView",
  "../views/CodeMirrorHTMLView",
  "../views/CodeMirrorCSSView",
  "../views/HTMLJSLinksView",
  "../views/IsoplethView",
  "../graphs/InvokeGraph",
  "../collections/SourceCollection",
  "../collections/ActiveNodeCollection",
  "../routers/JSBinSocketRouter"
], function ($, Backbone, _,
             GutterPillView,
             DropDownJSView,
             HeaderControlView,
             CodeMirrorJSView,
             CodeMirrorHTMLView,
             CodeMirrorCSSView,
             HTMLJSLinksView,
             IsoplethView,
             InvokeGraph,
             SourceCollection,
             ActiveNodeCollection,
             JSBinSocketRouter) {
  var instance = null;

  var JSBinRouter = Backbone.Router.extend({
    codeMirrors: {
      js: null,
      html: null,
      css: null
    },

    initialize: function () {
      if (instance !== null) {
        throw new Error("Cannot instantiate more than one Singleton, use MySingleton.getInstance()");
      }

      this.activeNodeCollection = new ActiveNodeCollection();
      this.sourceCollection = new SourceCollection(null, {
        scripts: [],
        activeNodeCollection: this.activeNodeCollection
      });

      this.invokeGraph = new InvokeGraph(this.codeMirrors, this.sourceCollection, this.activeNodeCollection, this);
      this.isoplethView = new IsoplethView(this.codeMirrors, this.sourceCollection, this.activeNodeCollection, this.invokeGraph, this);
      this.isoplethView.render();

      this.jsBinSocketRouter = JSBinSocketRouter.getInstance();
    },

    pauseUIUpdates: function () {
      console.warn("Ignoring UI Pause Request");
      return;
      // this.uiPaused = true;
      // this.headerControlView.pause();
    },

    nav: function (panelType, codeMirrorInstance) {
      this[panelType](codeMirrorInstance);
    },

    javascript: function (codeMirrorInstance) {
      this.codeMirrors.js = codeMirrorInstance;
    },

    html: function (codeMirrorInstance) {
      this.codeMirrors.html = codeMirrorInstance;
      // this.codeMirrorHTMLView.render();
    },

    css: function (codeMirrorInstance) {
      this.codeMirrors.css = codeMirrorInstance;
      // this.codeMirrorCSSView.render();
    }
  });

  JSBinRouter.getInstance = function () {
    if (instance === null) {
      instance = new JSBinRouter();
    }
    return instance;
  };

  return JSBinRouter;
});