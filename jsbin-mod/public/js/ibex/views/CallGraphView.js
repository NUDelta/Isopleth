def([
  "jquery",
  "backbone",
  "underscore",
  "handlebars",
  "vis",
], function ($, Backbone, _, Handlebars, vis) {
  return Backbone.View.extend({
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
      "click #drawWithRepeats": "drawWithRepeats",
    },

    colors: {
      nativeNode: "#bce9fd",
      libNode: "#66d9ef",
      edge: "#fd9620",
      nativeRootInvoke: "#48ff60",
      asyncEdge: "#e6da74",
      asyncSerialEdge: "#bc95ff",
      ajaxRequestNode: "#fff",
      ajaxResponseNode: "#dd7382",
      clickResponseNode: "#5fddbd"
    },

    initialize: function (invokeGraph) {
      this.invokeGraph = invokeGraph;
      this.showLibs = false;
      this.showSequentialRepeats = false;
      this.setElement($("#graphView"));  // el should be in the dom at instantiation time
    },

    drawWithLib: function () {
      this.showLibs = true;
      this.drawGraph();
    },

    drawWithRepeats: function () {
      this.showSequentialRepeats = true;
      this.drawGraph();
    },

    resetGraph: function () {
      this.showLibs = false;
      this.drawGraph();
    },

    markTopLevelNonLib: function () {
      _(this.invokeGraph.nativeRootInvokes).each(function (invoke) {
        this.cy.elements('node[id = "' + invoke.invocationId + '"]')
          .style({
            "background-color": this.colors.nativeRootInvoke
          });
      }, this);
    },

    drawJoshAsync: function () {
      _(this.invokeGraph.asyncSerialEdges).each(function (edge) {
        this.cy.add({
          group: 'edges', data: {
            source: edge.parentInvoke.invocationId,
            target: edge.childInvoke.invocationId,
            color: this.colors.asyncSerialEdge
          }
        });
      }, this);
    },

    drawTomAsync: function () {
      _(this.invokeGraph.asyncEdges).each(function (edge) {
        this.cy.add({
          group: 'edges', data: {
            source: edge.parentInvoke.invocationId,
            target: edge.childInvoke.invocationId,
            color: this.colors.asyncEdge
          }
        });
      }, this);
    },

    markAjaxRequest: function () {
      _(this.invokeGraph.ajaxRequests).each(function (invoke) {
        this.cy.elements('node[id = "' + invoke.invocationId + '"]')
          .style({"background-color": this.colors.ajaxRequestNode});
      }, this);
    },

    markAjaxResponse: function () {
      _(this.invokeGraph.ajaxResponses).each(function (invoke) {
        this.cy.elements('node[id = "' + invoke.invocationId + '"]')
          .style({"background-color": this.colors.ajaxResponseNode});
      }, this);
    },

    markClick: function () {
      _(this.invokeGraph.clickHandlers).each(function (invoke) {
        this.cy.elements('node[id = "' + invoke.invocationId + '"]')
          .style({"background-color": this.colors.clickResponseNode});
      }, this);
    },

    handleNodeClick:function(nodeId){
      this.trigger("nodeClick", nodeId);
    },

    drawGraph: function () {
      this.$("#invokeGraph").empty();

      var nodes = _(this.invokeGraph.invokes).reduce(function (displayNodes, invoke) {
        if (!this.showLibs && invoke.isLib) {
          return displayNodes;
        }

        if (!this.showSequentialRepeats && invoke.isSequentialRepeat) {
          return displayNodes;
        }

        var label = invoke.node.name && invoke.node.name.length < 44 ? invoke.node.name : "";
        var node = {
          data: {
            id: invoke.invocationId,
            label: label,
            shape: "rectangle",
            width: label ? (label.length * 10) + "px" : "25px",
            color: invoke.isLib ? this.colors.libNode : this.colors.nativeNode
          }
        };

        displayNodes.push(node);

        return displayNodes;
      }, [], this);

      var edges = _(this.invokeGraph.edges).map(function (edge) {
        return {
          data: {
            source: edge.parentInvoke.invocationId,
            target: edge.childInvoke.invocationId,
            color: this.colors.edge
          }
        };
      }, this);

      this.cy = cytoscape({
        container: this.$("#invokeGraph")[0],
        boxSelectionEnabled: false,
        autounselectify: true,
        layout: {
          name: 'dagre',
          pan: 'fix',
          padding: '10',
          minLen: function (edge) {
            return 1;
          }
        },
        style: [
          {
            selector: 'node',
            style: {
              'shape': 'data(shape)',
              'width': 'data(width)',
              'content': 'data(label)',
              'text-opacity': 1,
              'text-valign': 'center',
              'text-halign': 'center',
              'color': "black",
              'background-color': 'data(color)'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
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

      var callGraphView = this;
      this.cy.on('click', 'node', function (e) {
        callGraphView.handleNodeClick(this.id());
      });
      //
      // this.cy.on('click', 'edge', function (e) {
      //   callGraphView.handleEdgeClick(e);
      // });
    }
  });
});