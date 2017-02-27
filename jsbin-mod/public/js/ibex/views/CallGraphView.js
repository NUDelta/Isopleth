def([
  "jquery",
  "backbone",
  "underscore",
  "handlebars",
  "vis",
  "text!../templates/CallGraphView.html"
], function ($, Backbone, _, Handlebars, vis, CallGraphViewHTML) {
  return Backbone.View.extend({
    template: Handlebars.compile(CallGraphViewHTML),

    tagName: "div",

    id: "callGraphView",

    events: {
      "click #markNonLib": "markNonLib",
      "click #markTopLevelNonLib": "markTopLevelNonLib",
      "click #drawTomAsync": "drawTomAsync",
      "click #drawJoshAsync": "drawJoshAsync",
      "click #pruneGraph": "pruneGraph",
      "click #resetGraph": "resetGraph",
      "click #markAjax": "markAjax",
      "click #markClick": "markClick",
    },

    initialize: function (invokes, invokeIdMap) {
      this.invokes = invokes;
      this.invokeIdMap = invokeIdMap;
      this.$el.append(this.template({}));
    },

    calculateInvokeGraph: function () {
      this.nativeInvokes = [];
      this.topLevelInvokes = [];
      var invokes = this.invokes;
      var nodes = [];
      var edges = [];
      _(invokes).each(function (invoke) {
        invoke.children = null;
        invoke.visited = null;
        invoke.isLib = null;
      });

      _(invokes).each(function (invoke) {
        if (invoke.topLevelInvocationId === invoke.invocationId) {
          this.topLevelInvokes.push(invoke);
        }

        invoke.isLib = invoke.node.id.indexOf("zepto") > -1;
        var graphNode = {
          id: invoke.invocationId,
          label: invoke.node.name && invoke.node.name.length < 44 ? invoke.node.name : "",
          title: invoke.node.source,
          color: "yellow"
        };

        if (!invoke.isLib) {
          this.nativeInvokes.push(invoke);
        }

        nodes.push(graphNode);
        invoke.graphNode = graphNode;

        _(invoke.parents).each(function (parent) {
          if (parent.type === "async") {
            //do nothing;
          } else {
            edges.push({from: parent.invocationId, to: invoke.invocationId, color: 'blue'});
            if (!this.invokeIdMap[parent.invocationId].children) {
              this.invokeIdMap[parent.invocationId].children = [];
            }
            this.invokeIdMap[parent.invocationId].children.push(invoke);
          }
        }, this);
      }, this);

      var count = 0;
      this.nativeRoots = [];
      var findNativeRoots = _.bind(function (invoke) {
        invoke.visited = true;

        var hasAsyncOrLibParent = _(invoke.parents).find(function (p) {
          return p.type === "async" || this.invokeIdMap[p.invocationId].isLib
        }, this);
        if (!invoke.isLib && (!invoke.parents || hasAsyncOrLibParent)) {
          this.nativeRoots.push(invoke);
        }

        _(invoke.children).each(function (childNode) {
          findNativeRoots(childNode);
        });

        invoke.visited = false;

        count++;
      }, this);

      _(this.topLevelInvokes).each(findNativeRoots, this);

      return {
        nodes: nodes, edges: edges
      };
    },

    drawGraph: function () {
      var invokeGraph = this.calculateInvokeGraph();

      var layoutMethod = "directed";
      this.$("#invokeGraph").empty();
      var container = this.$("#invokeGraph")[0];

      var nodeDataSet = new vis.DataSet();
      nodeDataSet.add(invokeGraph.nodes);
      var edgeDataSet = new vis.DataSet();
      edgeDataSet.add(invokeGraph.edges);

      this.graphData = {
        nodes: nodeDataSet,
        edges: edgeDataSet
      };

      var options = {
        autoResize: false,
        interaction: {
          tooltipDelay: 100,
        },
        layout: {
          hierarchical: {
            sortMethod: layoutMethod
          }
        },
        edges: {
          smooth: true,
          arrows: {to: true}
        }
      };

      var network = new vis.Network(container, this.graphData, options);
    },

    resetGraph: function () {
      this.drawGraph();
    },

    markNonLib: function () {
      _(this.nativeInvokes).each(function (invoke) {
        this.graphData.nodes.update({
          id: invoke.invocationId,
          color: "red"
        });
      }, this);
    },

    markTopLevelNonLib: function () {
      _(this.nativeRoots).each(function (invoke) {
        this.graphData.nodes.update({
          id: invoke.invocationId,
          color: "green"
        });
      }, this);
    },

    drawJoshAsync: function () {
      var traverseInvokeTreeForArg = function (invoke, fromId, source, edges) {
        var argMatch = _(invoke.arguments).find(function (arg) {
          return arg.value && arg.value.type === "function"
            && arg.value.json === source;
        });

        if (argMatch) {
          edges.push({from: fromId, to: invoke.invocationId, color: "purple"});
        }

        _(invoke.children).each(function (child) {
          traverseInvokeTreeForArg(child, fromId, source, edges);
        });
      };

      _(this.nativeRoots).each(function (aInvoke) {
        var edges = [];

        _(this.nativeRoots).each(function (bInvoke) {
          if (aInvoke.invocationId !== bInvoke.invocationId) {
            if (aInvoke.node.source) {
              traverseInvokeTreeForArg(bInvoke, aInvoke.invocationId, aInvoke.node.source, edges);
            }
          }
        });

        _(edges).each(function (edge) {
          this.graphData.edges.add(edge);
        }, this);
      }, this);
    },

    drawTomAsync: function () {
      _(this.nativeRoots).each(function (aInvoke) {
        var edges = [];

        _(this.nativeRoots).each(function (bInvoke) {
          if (aInvoke.invocationId !== bInvoke.invocationId) {
            if (aInvoke.parents && aInvoke.parents[0] &&
              aInvoke.parents[0].type && aInvoke.parents[0].type === "async") {
              edges.push({from: aInvoke.invocationId, to: aInvoke.parents[0].invocationId, color: "green"})
            }
          }
        });

        _(edges).each(function (edge) {
          this.graphData.edges.add(edge);
        }, this);
      }, this);
    },

    pruneGraph: function () {
      var ids = _(this.nativeInvokes).pluck("invocationId");
      var without = _(this.invokeIdMap).chain().keys().difference(ids).value();

      _(without).each(function (id) {
        this.graphData.nodes.remove({id: id})
      }, this);
    },

    markAjax: function () {
      _(this.invokes).each(function (invoke) {
        if (
          invoke.arguments &&
          invoke.arguments[0] &&
          invoke.arguments[0].value &&
          invoke.arguments[0].value.ownProperties &&
          invoke.arguments[0].value.ownProperties.eventName &&
          invoke.arguments[0].value.ownProperties.eventName.value &&
          invoke.arguments[0].value.ownProperties.eventName.value.toLowerCase().indexOf("event") > -1 &&
          invoke.arguments[0].value.ownProperties.type &&
          invoke.arguments[0].value.ownProperties.type.value
        ) {
          if (invoke.arguments[0].value.ownProperties.type.value === "load" ||
            invoke.arguments[0].value.ownProperties.type.value === "readystatechange") {
            this.graphData.nodes.update({
              id: invoke.invocationId,
              color: "pink"
            });
          }
        }
      }, this);
    },

    markClick: function () {
      _(this.invokes).each(function (invoke) {
        if (
          invoke.arguments &&
          invoke.arguments[0] &&
          invoke.arguments[0].value &&
          invoke.arguments[0].value.ownProperties &&
          invoke.arguments[0].value.ownProperties.eventName &&
          invoke.arguments[0].value.ownProperties.eventName.value &&
          invoke.arguments[0].value.ownProperties.eventName.value.toLowerCase().indexOf("event") > -1 &&
          invoke.arguments[0].value.ownProperties.type &&
          invoke.arguments[0].value.ownProperties.type.value
        ) {
          if (invoke.arguments[0].value.ownProperties.type.value === "click") {
            this.graphData.nodes.update({
              id: invoke.invocationId,
              color: "orange"
            });
          }
        }
      }, this);
    },
  });
});