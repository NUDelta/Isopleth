define([
  "jquery",
  "backbone",
  "underscore",
  "../models/ActiveNodeModel",
  "../routers/JSBinSocketRouter",
  // "text!../util/samples/nodeSample.txt",
  "text!../util/samples/xkcd/nodeSample.txt",
  "raphael"
], function ($, Backbone, _, ActiveNodeModel, JSBinSocketRouter, nodeSample) {
  return Backbone.Collection.extend({
    model: ActiveNodeModel,

    idAttribute: "id",

    queryNodeMap: {},

    earliestTimeStamp: 0,

    latestTimeStamp: 0,

    minInvokeTime: 0,

    maxInvokeTime: 0,

    rawNodes: [],

    serialToNode: {},

    initialize: function () {
      this.jsBinSocketRouter = JSBinSocketRouter.getInstance();
      this.jsBinSocketRouter.onSocketData("fondueDTO:nodeBacktrace", function (obj) {
        var model = this.get(obj.id);
        if (model) {
          model.set("callStack", obj.callStack);
        }
      }, this);

      this.empty = _.bind(this.empty, this);

      var instanceId = window.location.pathname.split("/")[1];
      if (!instanceId || instanceId.length < 1) {
        this.mergeNodes(JSON.parse(nodeSample));
      }
    },

    getEarliestTimeStamp: function () {
      return this.earliestTimeStamp;
    },

    getLatestTimeStamp: function () {
      return this.latestTimeStamp;
    },

    getActiveNodes: function (path, domModifiersOnly) {
      return this.filter(function (model) {
        var hasHits = !!model.getHitsWithinDisplayRange();
        var hasPath = !!model.get("path");
        var matchesPath = path ? path === model.get("path") : true;
        var domModifier = domModifiersOnly ? !!model.get("domModifier") : true;
        var isFunction = model.get("type") === "function";

        return hasHits && isFunction && hasPath && matchesPath && domModifier;
      });
    },

    getGeneralNodes: function () {
      return this.filter(function (model) {
        var hasHits = !!model.get("invokes").length;
        var hasPath = !!model.get("path");

        return hasHits && hasPath;
      });
    },

    setTimeStampBounds: function (minInvokeTime, maxInvokeTime) {
      this.minInvokeTime = minInvokeTime;
      this.maxInvokeTime = maxInvokeTime;
      // this.populateQueryNodeMap();
    },

    mergeNodes: function (arrNodes) {
      this.hasFullNodeList = true;

      var nodesCreated = 0;
      _(arrNodes).each(function (node) {
        this.rawNodes.push(JSON.parse(JSON.stringify(node)));

        var funStr = node.source;
        var serial;
        if (funStr) {
          var isoStartIndex = funStr.indexOf("iso_");
          var isoEndIndex = funStr.indexOf("_iso");

          if (isoStartIndex > -1 && isoEndIndex > -1) {
            serial = funStr.substring(isoStartIndex, isoEndIndex + 4);
          }
        }

        var activeNodeModel = this.get(node.id);
        if (!activeNodeModel) {
          activeNodeModel = new ActiveNodeModel(node);
          if(serial){
            this.serialToNode[serial] = activeNodeModel;
          }
          this.add(activeNodeModel);
          nodesCreated++;
        }
      }, this);
      if (nodesCreated) {
        console.log("\tActiveNodeCollection: Added " + nodesCreated + " new nodes.");
      }

      // this.populateQueryNodeMap();
    },

    mergeInvocations: function (arrInvocations) {
      //We have to relate them as the come with the full list
      // if (!this.hasFullNodeList) {
      //   return;
      // }

      // var nodesCreated = 0;
      // _(arrInvocations).each(function (invocation) {
      //   var node = invocation.node;
      //   invocation.nodeName = node && node.name ? node.name : "";
      //
      //   var timestamp = invocation.timestamp;
      //
      //   if (!this.earliestTimeStamp || timestamp < this.earliestTimeStamp) {
      //     this.earliestTimeStamp = timestamp;
      //   }
      //   if (!this.latestTimeStamp || timestamp > this.latestTimeStamp) {
      //     this.latestTimeStamp = timestamp;
      //   }
      //
      //   var activeNodeModel = this.get(invocation.nodeId);
      //   if (!activeNodeModel) {
      //     activeNodeModel = new ActiveNodeModel(node);
      //     this.add(activeNodeModel);
      //     nodesCreated++;
      //   }
      //
      //   var invokeArr = activeNodeModel.get("invokes") || [];
      //
      //   if (invokeArr.length < 100) {
      //     invokeArr.push(invocation);
      //     activeNodeModel.set("invokes", invokeArr);
      //   }
      // }, this);
      // if (nodesCreated) {
      //   console.log("\tActiveNodeCollection: Added " + nodesCreated + " new nodes.");
      // }

      // this.populateQueryNodeMap();
    },

    empty: function () {
      var model;

      while (model = this.first()) {
        model.set("id", null);
        model.destroy();
      }

      this.queryNodeMap = {};
    },

    eachDomQuery: function (iterFn, context) {
      if (context) {
        iterFn = _.bind(iterFn, context);
      }

      var domQueries = _(this.queryNodeMap).keys();
      _(domQueries).each(function (domFnQueryStr) {
        var domFnName = domFnQueryStr.split("|")[0];
        var queryString = domFnQueryStr.split("|")[1];
        var activeNodes = this.getModelsByDomQuery(domFnName, queryString);

        iterFn(domFnName, queryString, activeNodes);
      }, this);
    },

    getModelsByDomQuery: function (domFnName, queryString) {
      return this.queryNodeMap[domFnName + "|" + queryString];
    },

    findQueriesPerNode: function (nodeModel) {
      var id = nodeModel.get("id");
      var domQueryArr = [];
      _(this.queryNodeMap).each(function (value, key) {
        var found = _(value).find(function (nodeM) {
          return id === nodeM.get("id");
        });
        if (found) {
          var domFnName = key.split("|")[0];
          var queryString = key.split("|")[1];
          domQueryArr.push({
            domFnName: domFnName,
            queryString: queryString
          });
        }
      });

      return domQueryArr;
    },

    timeStampInRange: function (timestamp) {
      if (this.minInvokeTime) {
        if (this.maxInvokeTime) {
          return timestamp >= this.minInvokeTime && timestamp <= this.maxInvokeTime;
        } else {
          return timestamp >= this.minInvokeTime;
        }
      } else if (this.maxInvokeTime) {
        return timestamp <= this.maxInvokeTime;
      } else {
        return true;
      }
    },

    populateQueryNodeMap: function () {
      this.queryNodeMap = {};

      var searchNodes = [];
      this.each(function (model) {
        model.set("domModifier", false);

        var hasHits = !!model.getHitsWithinDisplayRange();
        var hasPath = !!model.get("path");

        if (hasHits && hasPath) {
          searchNodes.push(model);
        }
      }, this);

      //Run a check against each active node to see if it modifies the dom
      _(searchNodes).each(function (nodeModel) {
        //  If so, find all of its callers
        var domQueryFn = nodeModel.getDomQueryFn();
        if (domQueryFn) {
          var invokes = nodeModel.get("invokes");
          _(invokes).each(function (invoke) {
            if (!this.timeStampInRange(invoke.timestamp)) {
              return;
            }

            var domQueryString = nodeModel.getDomQueryStringFromInvoke(invoke);

            // Mark them as related
            if (domQueryString) {
              var key = domQueryFn + "|" + domQueryString;
              var arrNodes = this.queryNodeMap[key] || [];
              arrNodes.push(nodeModel);

              nodeModel.set("domModifier", true);

              _(invoke.callStack).each(function (caller) {
                var callerNodeModel = this.get(caller.nodeId);
                if (callerNodeModel) {
                  arrNodes.push(callerNodeModel);
                  callerNodeModel.set("domModifier", true);
                }
              }, this);

              this.queryNodeMap[key] = arrNodes;
            }
          }, this);
        }
      }, this);
    },

    drawSomeLines: function () {
      // var i = 0;
      // var marker;
      // var lastLine = null, lastCol = null, $lastRDrawing = null;
      // var nextLine;
      // var nextCol;
      //
      // var highlightNext = function () {
      //   if (marker) {
      //     marker.clear();
      //   }
      //
      //   if (!runList[i]) {
      //     return;
      //   }
      //
      //   if ($lastRDrawing) {
      //     $lastRDrawing.remove();
      //     $lastRDrawing = null;
      //   }
      //
      //   nextLine = runList[i].nodeModel.attributes.startLine - 1;
      //   nextCol = runList[i].nodeModel.attributes.startColumn;
      //
      //   if (lastLine !== null && nextLine !== null) {
      //     //draw line
      //     var $jsMirror = $($(".CodeMirror-code")[2]);
      //     var el = $jsMirror.find("div:nth-child(" + (lastLine + 1) + ")")[0];
      //     var fromEl = $(el)[0];
      //     var fromPos;
      //     if (fromEl) {
      //       fromPos = fromEl.getBoundingClientRect();
      //     }
      //
      //     var elNext = $jsMirror.find("div:nth-child(" + (nextLine + 1) + ")")[0];
      //     var toEl = $(elNext)[0];
      //     var toPos;
      //     if (toEl) {
      //       toPos = toEl.getBoundingClientRect();
      //     }
      //
      //     var x, y, zx, zy, leftAbsolutePosition, topAbsolutePosition;
      //     leftAbsolutePosition = fromPos.left;
      //     topAbsolutePosition = fromPos.top;
      //     x = fromPos.left - leftAbsolutePosition + 8 * lastCol;
      //     y = fromPos.top - topAbsolutePosition + (fromPos.height / 2);
      //     zx = toPos.left - leftAbsolutePosition + 8 * nextCol;
      //     zy = toPos.top - topAbsolutePosition + toPos.height / 2;
      //
      //     var ax = x + (zx - x) * (2 / 5);
      //     var ay = y;
      //     var bx = x + (zx - x) * (3 / 5);
      //     var by = zy;
      //
      //     var colors = [
      //       "hsb(0, .75, .75)",  //red
      //       "hsb(.8, .75, .75)", //purple
      //       "hsb(.3, .75, .75)", // green
      //       "hsb(.6, .75, .75)", // blue
      //       "hsb(.1, .75, .75)" // orange
      //     ];
      //
      //     var color = colors[_.random(0, 4)];
      //
      //     var $div = $("div");
      //
      //     var r = Raphael($div, 1, 1);
      //
      //     $(r.canvas).attr("style", "overflow: visible; position: absolute; z-index: 3;" +
      //       "left: " + leftAbsolutePosition + "px;" +
      //       "top: " + topAbsolutePosition + "px;"
      //     );
      //     // var path = [["M", x, y], ["C", ax, ay, bx, by, zx, zy]];
      //
      //     r.path(["M", x, y]).animate({path: ["C", 0, 0, 0, 0, zx, zy]}, 500).attr({
      //       stroke: color,
      //       "stroke-width": 1,
      //       "stroke-linecap": "round"
      //     });
      //
      //     $lastRDrawing = $(r.canvas);
      //   }
      //
      //   lastLine = nextLine;
      //   lastCol = nextCol;
      //
      //   marker = codeMirrorJSView.jsMirror.markText(
      //     {
      //       line: runList[i].nodeModel.attributes.startLine - 1,
      //       ch: runList[i].nodeModel.attributes.startColumn
      //     },
      //     {
      //       line: runList[i].nodeModel.attributes.endLine - 1,
      //       ch: runList[i].nodeModel.attributes.endColumn
      //     },
      //     {
      //       css: "background-color:#fded02"
      //     }
      //   );
      //
      //   i++;
      //   window.myTimeout = setTimeout(highlightNext, 1000);
      // };
      //
      // highlightNext();
    }

  })
});