define([
  "jquery",
  "backbone",
  "underscore",
  "handlebars",
], function ($, Backbone, _, Handlebars) {
  return Backbone.View.extend({
    events: {
      "click #markNonLib": "markNonLib",
      "click #markTopLevelNonLib": "markTopLevelNonLib",
      "click #drawTomAsync": "drawTomAsync",
      "click #drawJoshAsync": "drawJoshAsync",
      "click #pruneGraph": "pruneGraph",
      "click #resetGraph": "resetGraph",
      "click #markAllBlue": "markAllBlue",
      "click #markAjaxRequest": "markAjaxRequest",
      "click #markAjaxResponse": "markAjaxResponse",
      "click #markClick": "markClick",
      "click #drawWithLib": "drawWithLib",
      "click #drawWithRepeats": "drawWithRepeats",
      "click #downloadInvokes": "downloadInvokes",
      "click #downloadNodes": "downloadNodes"
    },

    colors: {
      nativeNode: "#bce9fd",
      libNode: "#66d9ef",
      edge: "#fd9620",
      nativeRootInvoke: "#48ff60",
      asyncEdge: "#e6da74",
      asyncSerialEdge: "#bc95ff",
      ajaxRequest: "#fff",
      ajaxResponse: "#dd7382",
      clickHandler: "#5fddbd"
    },

    initialize: function (invokeGraph, activeNodeCollection) {
      this.invokeGraph = invokeGraph;
      this.activeNodeCollection = activeNodeCollection;
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
      this.showSequentialRepeats = false;
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
        this.cy.remove('edge[source = "' + edge.parentInvoke.invocationId + '"][target="' + edge.childInvoke.invocationId + '"]');
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
        this.cy.remove('edge[source = "' + edge.parentInvoke.invocationId + '"][target="' + edge.childInvoke.invocationId + '"]');
        this.cy.add({
          group: 'edges', data: {
            source: edge.parentInvoke.invocationId,
            target: edge.childInvoke.invocationId,
            color: this.colors.asyncEdge
          }
        });
      }, this);
    },

    markAllBlue: function () {
      _(this.invokeGraph.invokes).each(function (invoke) {
        this.cy.elements('node[id = "' + invoke.invocationId + '"]')
          .style({"background-color": this.colors.nativeNode});
      }, this);
    },

    markAjaxRequest: function () {
      _(this.invokeGraph.aspectCollectionMap.ajaxRequest).each(function (invoke) {
        this.cy.elements('node[id = "' + invoke.invocationId + '"]')
          .style({"background-color": this.colors.ajaxRequest});
      }, this);
    },

    markAjaxResponse: function () {
      _(this.invokeGraph.aspectCollectionMap.ajaxResponse).each(function (invoke) {
        this.cy.elements('node[id = "' + invoke.invocationId + '"]')
          .style({"background-color": this.colors.ajaxResponse});
      }, this);
    },

    markClick: function () {
      _(this.invokeGraph.aspectCollectionMap.click).each(function (invoke) {
        this.cy.elements('node[id = "' + invoke.invocationId + '"]')
          .style({"background-color": this.colors.clickHandler});
      }, this);
    },

    handleNodeClick: function (nodeId) {
      this.trigger("nodeClick", nodeId);
    },

    getNodeColor: function (node) {
      if (node.isLib) {
        return this.colors.libNode;
      }

      if (node.aspectMap) {
        var aspectArr = _(node.aspectMap).keys();
        if (aspectArr.length) {
          if (this.colors[aspectArr[0]]) {
            return this.colors[aspectArr[0]];
          }
        }
      }

      return this.colors.nativeNode;
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

        var label = invoke.getLabel();
        var node = {
          data: {
            id: invoke.invocationId,
            label: label,
            shape: "rectangle",
            width: label ? (label.length * 10) + "px" : "25px",
            color: this.getNodeColor(invoke)
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
    },

    downloadInvokes: function () {
      this.downloadStr(JSON.stringify(this.invokeGraph.rawInvokes, null, 2), "invokeSample.txt");
    },

    downloadNodes: function () {
      this.downloadStr(JSON.stringify(this.activeNodeCollection.rawNodes, null, 2), "nodeSample.txt");
    },

    downloadStr: function (str, fileName) {
      var textFileAsBlob = new Blob([str], {type: 'text/plain'});

      var downloadLink = document.createElement("a");
      downloadLink.download = fileName;
      downloadLink.innerHTML = "Download File";
      downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
      downloadLink.click();
    }
  });
});