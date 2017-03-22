define([
  "jquery",
  "backbone",
  "underscore"
], function ($, Backbone, _) {
  return Backbone.View.extend({
    tagName: "div",

    className: "codeMirrorView",

    events: {},

    initialize: function (code, maxHeight) {
      code = code || "";

      this.cssId = "cm-" + new Date().getTime();
      this.$el.attr("id", this.cssId);
      this.$el.html("<textarea>");
      this.$el.prepend("<style>#" + this.cssId +
        " .CodeMirror-scroll { max-height: " + (maxHeight || "300px") + "; }</style>");

      this.codeMirror = CodeMirror.fromTextArea(this.$("textarea")[0], {
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

      this.codeMirror.eachLine(function(lineHandle){
        if(lineHandle.text && lineHandle.text.indexOf("iso_") > -1){
          lineHandle.text = "";
        }
      });

      setTimeout(_.bind(function () {
        this.codeMirror.refresh();
      }, this), 100);
    }
  });
});