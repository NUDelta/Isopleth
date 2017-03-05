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
      "click #markAjaxRequest": "markAjaxRequest",
      "click #markAjaxResponse": "markAjaxResponse",
      "click #markClick": "markClick",
      "click #drawWithLib": "drawWithLib",
    },

    initialize: function (invokeGraph) {
      this.invokeGraph = invokeGraph;
      this.$el.attr("id", "callGraphView");
      this.$el.html(this.template({}));
      this.showLibs = false;
    },

    drawGraphVis: function () {
      var layoutMethod = "directed";
      this.$("#invokeGraph").empty();
      var container = this.$("#invokeGraph")[0];

      var nodeDataSet = new vis.DataSet();

      if (this.showLibs) {
        nodeDataSet.add(this.invokeGraph.visualGraph.nodes);
      } else {
        nodeDataSet.add(this.invokeGraph.visualGraph.nativeNodes);
      }
      var edgeDataSet = new vis.DataSet();
      edgeDataSet.add(this.invokeGraph.visualGraph.edges);

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

      this.network = new vis.Network(container, this.graphData, options);
    },

    drawWithLib: function () {
      this.showLibs = true;
      this.drawGraph();
    },

    resetGraph: function () {
      this.showLibs = false;
      this.drawGraph();
    },

    markTopLevelNonLib: function () {
      _(this.invokeGraph.nativeRootInvokes).each(function (invoke) {
        this.cy.elements('node[id = "' + invoke.invocationId + '"]')
          .style({"background-color": "teal"});
        // this.graphData.nodes.update({
        //   id: invoke.invocationId,
        //   color: "teal"
        // });
      }, this);
    },

    drawJoshAsync: function () {
      _(this.invokeGraph.visualGraph.asyncSerialEdges).each(function (edge) {
        this.cy.add({
          group: 'edges', data: {
            source: edge.from,
            target: edge.to,
            color: edge.color
          }
        });
        // this.graphData.edges.add(edge);
      }, this);
    },

    drawTomAsync: function () {
      _(this.invokeGraph.visualGraph.asyncEdges).each(function (edge) {
        this.cy.add({
          group: 'edges', data: {
            source: edge.from,
            target: edge.to,
            color: edge.color
          }
        });
        //this.graphData.edges.add(edge);
      }, this);
    },

    markAjaxRequest: function () {
      _(this.invokeGraph.ajaxRequests).each(function (invoke) {
        this.cy.elements('node[id = "' + invoke.invocationId + '"]')
          .style({"background-color": "red"});
        // this.graphData.nodes.update({
        //   id: invoke.invocationId,
        //   color: "red"
        // });
      }, this);
    },

    markAjaxResponse: function () {
      _(this.invokeGraph.ajaxResponses).each(function (invoke) {
        this.cy.elements('node[id = "' + invoke.invocationId + '"]')
          .style({"background-color": "pink"});
        // this.graphData.nodes.update({
        //   id: invoke.invocationId,
        //   color: "pink"
        // });
      }, this);
    },

    markClick: function () {
      _(this.invokeGraph.clickHandlers).each(function (invoke) {
        this.cy.elements('node[id = "' + invoke.invocationId + '"]')
          .style({"background-color": "violet"});
        // this.graphData.nodes.update({
        //   id: invoke.invocationId,
        //   color: "violet"
        // });
      }, this);
    },

    drawGraph: function () {
      this.$("#invokeGraph").empty();

      var useNodes = this.invokeGraph.visualGraph.nodes;

      if (!this.showLibs) {
        useNodes = this.invokeGraph.visualGraph.nativeNodes;
      }

      var nodes = _(useNodes).map(function (node) {
        return {data: node};
      });

      var edges = _(this.invokeGraph.visualGraph.edges).map(function (node) {
        return {
          data: {
            source: node.from,
            target: node.to,
            color: node.color
          }
        };
      });

      this.cy = cytoscape({
        container: this.$("#invokeGraph")[0],
        boxSelectionEnabled: false,
        autounselectify: true,
        layout: {
          name: 'dagre',
          pan: 'fix',
          padding: '10',
          minLen: function( edge ){ return 1; }
        },
        style: [
          {
            selector: 'node',
            style: {
              'content': 'data(label)',
              'text-opacity': 0.5,
              'text-valign': 'center',
              'text-halign': 'center',
              'background-color': 'data(color)'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 4,
              'target-arrow-shape': 'triangle',
              'line-color': 'data(color)',
              'target-arrow-color': 'data(color)',
              'curve-style': 'bezier'
            }
          }
        ],
        elements: {
          nodes: nodes,
          edges: edges
        },
      });
    }
  });
});