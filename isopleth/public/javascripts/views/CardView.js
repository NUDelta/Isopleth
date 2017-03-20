define([
  "jquery",
  "backbone",
  "underscore",
  "handlebars",
  "text!../templates/CardView.html",
], function ($, Backbone, _, Handlebars, CardViewTemplate) {
  return Backbone.View.extend({
    template: Handlebars.compile(CardViewTemplate),

    tagName: "div",

    className: "cardView",

    initialize: function (nodeId, invokeGraph) {
      this.invokeGraph = invokeGraph;
      var invoke = this.invokeGraph.invokeIdMap[nodeId];

      if (!invoke) {
        console.warn("Tried to draw cardview without invoke.");
        return;
      }

      var code = invoke.node.source || "";

      this.$el.append(this.template({
        description: invoke.getLabel(),
        code: code
      }));

      var codeArea = this.$(".cardMirror")[0];
      this.codeMirror = CodeMirror.fromTextArea(codeArea, {
        parserfile: [],
        readOnly: true,
        dragDrop: false,
        mode: "javascript",
        lineWrapping: true,
        tabSize: 2,
        gutters: ['pill-gutter', "CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        lineNumbers: true,
        foldGutter: true,
        theme: 'default',
        styleActiveLine: true,
        scrollbarStyle: "null",
        matchBrackets: true
      });
      this.setCode(code);

    },

    setCode: function (code) {
      this.codeMirror.getDoc().setValue(code);
      setTimeout(_.bind(function () {
        this.codeMirror.refresh();
      }, this), 1);
    },

  });
});