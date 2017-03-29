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
      "click #downloadNodes": "downloadNodes",
      "click #drawUnknownAspectNodes": "drawUnknownAspectNodes"
    },

    customColors: {},

    colors: {
      nativeNode: "#bce9fd",
      libNode: "#bdbdbd",
      edge: "#e6da74",
      nativeRootInvoke: "#48ff60",
      asyncEdge: "#fd9620",
      asyncSerialEdge: "#bc95ff",
      ajaxRequest: "#fff",
      ajaxResponse: "#dd7382",
      domQuery: "#bc95ff",
      jqDom: "#bc95ff",
      mouseEvent: "#fd9620",
      click: "#fd9620",
      wheel: "#fd9620",
      mousemove: "#fd9620",
      mousedown: "#fd9620",
      mouseup: "#fd9620",
      mouseout: "#fd9620",
      mouseleave: "#fd9620",
      mouseenter: "#fd9620",
      mouseover: "#fd9620",
      selected: "#fff07b",
      edgeSelected: "#f7f7f7",
    },

    aspectFilters: [],

    negatedAspectFilters: [],

    lastSelectedNodes: [],

    lastSelectedEdge: null,

    visibleInvokes: [],

    maxVisibleHitCount: 0,

    showUnknownAspects: false,

    hideInvokeIdMap: {},

    initialize: function (invokeGraph, activeNodeCollection) {
      this.invokeGraph = invokeGraph;
      this.activeNodeCollection = activeNodeCollection;
      this.showLibs = false;
      this.showSequentialRepeats = false;
      this.setElement($("#graphView"));  // el should be in the dom at instantiation time

      this.$("#invokeGraph").height(parseInt(this.$el.height()) - parseInt(this.$("#graphControl").height()));

      this.filterByAspect = _.bind(this.filterByAspect, this);
      this.handleNodeClick = _.bind(this.handleNodeClick, this);
      this.handleEdgeClick = _.bind(this.handleEdgeClick, this);
      this.addCustomColor = _.bind(this.addCustomColor, this);
    },

    addCustomColor: function (aspect, color) {
      this.customColors[aspect] = color;
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

    drawUnknownAspectNodes: function () {
      this.showUnknownAspects = true;
      this.drawGraph();
    },

    resetGraph: function () {
      this.showLibs = false;
      this.showSequentialRepeats = false;
      this.showUnknownAspects = false;
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

    markAspectColor: function (aspectArr, color) {
      if (!aspectArr || !color) {
        console.warn("Tried to color invoke node without params.");
        return;
      }

      var allNodes = (aspectArr === "*");

      _(this.visibleInvokes).each(function (invoke) {
        var markAspect;
        if (allNodes) {
          markAspect = true;
        } else {
          markAspect = _(aspectArr).find(function (aspect) {
            return invoke.aspectMap[aspect];
          });
        }

        if (markAspect) {
          this.cy.elements('node[id = "' + invoke.invocationId + '"]')
            .style({"background-color": color});
        }
      }, this);
    },

    markAllBlue: function () {
      this.markAspectColor("*", this.colors.nativeNode);
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
      this.markAspectColor(["ajaxRequest"], this.colors.ajaxRequest);
    },

    markAjaxResponse: function () {
      this.markAspectColor(["ajaxResponse"], this.colors.ajaxResponse);
    },

    markClick: function () {
      this.markAspectColor(this.invokeGraph.mouseEvents, this.colors.mouseEvent);
    },

    filterByAspect: function (aspectArr, negateAspectArr) {
      this.aspectFilters = aspectArr;
      this.negatedAspectFilters = negateAspectArr;

      this.drawGraph();
    },

    resetLastNodes: function () {
      if (!this.lastSelectedNodes.length) {
        return;
      }

      _(this.lastSelectedNodes).each(function (node) {
        this.cy.elements('node[id = "' + node.id + '"]')
          .style({
            "background-color": node.color,
            "border-color": "none",
            "border-width": "0"
          });
      }, this);

      this.lastSelectedNodes = [];

      if (this.lastSelectedEdge) {
        var edgeElement = this.cy.elements('edge[source = "' + this.lastSelectedEdge.sourceId + '"][target = "' + this.lastSelectedEdge.targetId + '"]');
        if (!edgeElement.length) {
          edgeElement = this.cy.elements('edge[target = "' + this.lastSelectedEdge.sourceId + '"][source = "' + this.lastSelectedEdge.targetId + '"]');
        }

        edgeElement.style({
          "line-color": this.lastSelectedEdge.color
        });
        this.lastSelectedEdge = null;
      }
    },

    handleNodeClick: function (nodeId, silent) {
      this.resetLastNodes();

      this.lastSelectedNodes = [{
        id: nodeId,
        color: this.cy.elements('node[id = "' + nodeId + '"]').style("background-color")
      }];

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

    handleEdgeClick: function (sourceId, targetId, silent) {
      this.resetLastNodes();

      _([sourceId, targetId]).each(function (nodeId) {
        this.lastSelectedNodes.push({
          id: nodeId,
          color: this.cy.elements('node[id = "' + nodeId + '"]').style("background-color")
        });

        this.cy.elements('node[id = "' + nodeId + '"]')
          .style({
            "background-color": this.colors.selected,
            "border-color": "white",
            "border-width": "3px"
          });
      }, this);

      var edgeElement = this.cy.elements('edge[source = "' + sourceId + '"][target = "' + targetId + '"]');
      if (!edgeElement.length) {
        edgeElement = this.cy.elements('edge[target = "' + sourceId + '"][source = "' + targetId + '"]');
      }

      this.lastSelectedEdge = {
        sourceId: sourceId,
        targetId: targetId,
        color: edgeElement.style("line-color")
      };
      edgeElement
        .style({
          "line-color": this.colors.edgeSelected,
        });

      if (!silent) {
        this.trigger("edgeClick", [sourceId, targetId]);
      }
    },

    getNodeColor: function (node) {
      var customColors = _(this.customColors).keys();

      if (customColors.length) {
        var colorKey = _(customColors).find(function (aspect) {
          return node.aspectMap[aspect];
        });

        if (colorKey) {
          return this.customColors[colorKey];
        }
      }

      if (node.isLib) {
        return this.colors.libNode;
      }

      if (node.nativeRootInvoke) {
        return this.colors.nativeRootInvoke;
      }

      var aspectArr = _(node.aspectMap).keys();
      var last = _(aspectArr).last();
      if (this.colors[last]) {
        return this.colors[last];
      }

      return this.colors.nativeNode;
    },

    calcHeatColor: function (val, max) {
      var heatNum = val / max;

      var r = parseInt(heatNum * 255);
      var b = 255 - r;

      return "#" + ((1 << 24) + (r << 16) + (0 << 8) + b).toString(16).slice(1);
    },

    updateLabel: function (invokeId) {
      this.cy.elements('node[id = "' + invokeId + '"]')
        .data("label", this.invokeGraph.invokeIdMap[invokeId].getLabel());
    },

    drawGraph: function () {
      this.$("#invokeGraph").empty();

      this.hideInvokeIdMap = {};

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

            var hideMap = this.hideInvokeIdMap
            if (!found) {
              this.invokeGraph.descendTree(invoke, function (childNode) {
                hideMap[childNode.invocationId] = true;
              }, null);
              return;
            }
          }

          if (this.negatedAspectFilters.length) {
            var negateFound = _(this.negatedAspectFilters).find(function (aspect) {
              return invoke.aspectMap[aspect]
            });

            if (negateFound) {
              var hideMap = this.hideInvokeIdMap
              this.invokeGraph.descendTree(invoke, function (childNode) {
                hideMap[childNode.invocationId] = true;
              }, null);
              return;
            }
          }
        }, this);
      }

      this.maxVisibleHitCount = 0;
      var nodes = _(this.invokeGraph.invokes).reduce(function (displayNodes, invoke) {
        if (!this.showLibs && invoke.isLib) {
          this.hideInvokeIdMap[invoke.invocationId] = true;
          return displayNodes;
        }

        if (!this.showUnknownAspects && _(invoke.aspectMap).keys().length < 1) {
          this.hideInvokeIdMap[invoke.invocationId] = true;
          return displayNodes;
        }

        if (!this.showSequentialRepeats && invoke.isSequentialRepeat) {
          this.hideInvokeIdMap[invoke.invocationId] = true;
          return displayNodes;
        }

        if (this.hideInvokeIdMap[invoke.invocationId]) {
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
        if (this.hideInvokeIdMap[edge.parentInvoke.invocationId] ||
          this.hideInvokeIdMap[edge.childInvoke.invocationId]) {
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

      this.cy.on('click', 'node', function () {
        callGraphView.handleNodeClick(this.id());
      });

      this.cy.on('click', 'edge', function () {
        callGraphView.handleEdgeClick(this.data("source"), this.data("target"));
      });

      this.drawJoshAsync();
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