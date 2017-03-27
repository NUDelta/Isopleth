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
      "click #drawHeatMap": "drawHeatMap",
      "click #downloadInvokes": "downloadInvokes",
      "click #downloadNodes": "downloadNodes"
    },

    colors: {
      nativeNode: "#bce9fd",
      libNode: "#bdbdbd",
      edge: "#fd9620",
      nativeRootInvoke: "#48ff60",
      asyncEdge: "#e6da74",
      asyncSerialEdge: "#bc95ff",
      ajaxRequest: "#fff",
      ajaxResponse: "#dd7382",
      clickHandler: "#5fddbd",
      selected: "#fff07b",
    },

    aspectFilters: [],

    negatedAspectFilters: [],

    lastSelectedNode: null,

    visibleInvokes: [],

    maxVisibleHitCount: 0,

    initialize: function (invokeGraph, activeNodeCollection) {
      this.invokeGraph = invokeGraph;
      this.activeNodeCollection = activeNodeCollection;
      this.showLibs = false;
      this.showSequentialRepeats = false;
      this.setElement($("#graphView"));  // el should be in the dom at instantiation time

      this.filterByAspect = _.bind(this.filterByAspect, this);
      this.handleNodeClick = _.bind(this.handleNodeClick, this);
    },

    drawWithLib: function () {
      this.showLibs = true;
      this.drawGraph();
    },

    drawWithRepeats: function () {
      this.showSequentialRepeats = true;
      this.drawGraph();
    },

    drawHeatMap: function () {
      _(this.visibleInvokes).each(function (invoke) {
        var heatColor = this.calcHeatColor(invoke.node.invokes.length, this.maxVisibleHitCount);

        this.cy.elements('node[id = "' + invoke.invocationId + '"]')
          .style({"background-color": heatColor});
      }, this);
    },

    resetGraph: function () {
      this.showLibs = false;
      this.showSequentialRepeats = false;
      this.drawGraph();
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
      _(this.visibleInvokes).each(function (invoke) {
        this.cy.elements('node[id = "' + invoke.invocationId + '"]')
          .style({"background-color": this.colors.nativeNode});
      }, this);
    },

    markTopLevelNonLib: function () {
      _(this.invokeGraph.nativeRootInvokes).each(function (invoke) {
        this.cy.elements('node[id = "' + invoke.invocationId + '"]')
          .style({
            "background-color": this.colors.nativeRootInvoke
          });
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

    filterByAspect: function (aspectArr, negateAspectArr) {
      this.aspectFilters = aspectArr;
      this.negatedAspectFilters = negateAspectArr;

      this.drawGraph();
    },

    handleNodeClick: function (nodeId, silent) {
      if (this.lastSelectedNode) {
        this.cy.elements('node[id = "' + this.lastSelectedNode.id + '"]')
          .style({
            "background-color": this.lastSelectedNode.color,
            "border-color": "none",
            "border-width": "0"
          });
      }

      this.lastSelectedNode = {
        id: nodeId,
        color: this.cy.elements('node[id = "' + nodeId + '"]').style("background-color")
      };

      this.cy.elements('node[id = "' + nodeId + '"]')
        .style({
          "background-color": this.colors.selected,
          "border-color": "white",
          "border-width": "3px"
        });

      if (!silent) {
        this.trigger("nodeClick", nodeId);
      }
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

    calcHeatColor: function (val, max) {
      var heatNum = val / max;

      var r = parseInt(heatNum * 255);
      var b = 255 - r;

      return "#" + ((1 << 24) + (r << 16) + (0 << 8) + b).toString(16).slice(1);
    },

    drawGraph: function () {
      this.$("#invokeGraph").empty();

      var hideInvokeIdMap = {};

      if (this.aspectFilters.length || this.negatedAspectFilters.length) {
        var roots;

        if (this.showLibs) {
          roots = this.invokeGraph.rootInvokes.concat(this.invokeGraph.nativeRootInvokes)
        } else {
          roots = this.invokeGraph.nativeRootInvokes
        }

        _(roots).each(function (invoke) {
          if (this.aspectFilters.length) {
            var found = _(this.aspectFilters).find(function (aspect) {
              return invoke.aspectMap[aspect]
            });

            if (!found) {
              this.invokeGraph.descendTree(invoke, function (childNode) {
                hideInvokeIdMap[childNode.invocationId] = true;
              }, null);
              return;
            }
          }

          if (this.negatedAspectFilters.length) {
            var negateFound = _(this.negatedAspectFilters).find(function (aspect) {
              return invoke.aspectMap[aspect]
            });

            if (negateFound) {
              this.invokeGraph.descendTree(invoke, function (childNode) {
                hideInvokeIdMap[childNode.invocationId] = true;
              }, null);
              return;
            }
          }
        }, this);
      }

      this.maxVisibleHitCount = 0;
      var nodes = _(this.invokeGraph.invokes).reduce(function (displayNodes, invoke) {
        if (!this.showLibs && invoke.isLib) {
          hideInvokeIdMap[invoke.invocationId] = true;
          return displayNodes;
        }

        if (!this.showSequentialRepeats && invoke.isSequentialRepeat) {
          hideInvokeIdMap[invoke.invocationId] = true;
          return displayNodes;
        }

        if (hideInvokeIdMap[invoke.invocationId]) {
          return displayNodes;
        }

        var label = invoke.getLabel();
        var node = {
          data: {
            id: invoke.invocationId,
            label: label,
            color: this.getNodeColor(invoke)
          }
        };

        this.visibleInvokes.push(invoke);
        if (invoke.node.invokes.length > this.maxVisibleHitCount) {
          this.maxVisibleHitCount = invoke.node.invokes.length;
        }

        displayNodes.push(node);

        return displayNodes;
      }, [], this);

      var edges = _(this.invokeGraph.edges).reduce(function (displayEdges, edge) {
        if (hideInvokeIdMap[edge.parentInvoke.invocationId] ||
          hideInvokeIdMap[edge.childInvoke.invocationId]) {
          return displayEdges;
        }

        displayEdges.push({
          data: {
            source: edge.parentInvoke.invocationId,
            target: edge.childInvoke.invocationId,
            color: this.colors.edge
          }
        });

        return displayEdges;
      }, [], this);

      this.cy = cytoscape({
        container: this.$("#invokeGraph")[0],
        boxSelectionEnabled: false,
        autounselectify: true,
        layout: {
          name: 'dagre',
          avoidOverlap: true,
          pan: 'fix',
          fit: true,
          padding: 20,
          minLen: function (edge) {
            return 2;
          }
        },
        style: [
          {
            selector: 'node',
            style: {
              'min-zoomed-font-size': 6,
              'font-family': 'system, "helvetica neue"',
              'font-size': 14,
              'font-weight': 400,
              'shape': 'roundrectangle',
              'overlay-color': "white",
              'overlay-padding': 1,
              'width': 'label',
              'height': 'label',
              'padding': 8,
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

      this.drawJoshAsync();
      this.markTopLevelNonLib();
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