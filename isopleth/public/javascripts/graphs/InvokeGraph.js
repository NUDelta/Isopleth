define([
  "backbone",
  "underscore",
  "../util/util",
  // "text!../util/samples/invokeSample.txt",
  "text!../util/samples/xkcd/invokeSample.txt",
], function (Backbone, _, util, invokeSample) {
  return Backbone.View.extend({
    invokes: [],
    invokeIdMap: {},

    nativeInvokes: [],
    rootInvokes: [],
    nativeRootInvokes: [],
    argSourceToInvokes: {},

    edges: [],

    asyncEdgeMap: [],
    asyncEdges: [],

    asyncSerialEdgeMap: {},
    asyncSerialEdges: [],

    rawInvokes: [],

    initialize: function (codeMirrors, sourceCollection, activeNodeCollection, jsBinRouter) {
      this.activeNodeCollection = activeNodeCollection;

      _(this.returnValueParsers).each(function (fn, i) {
        this.returnValueParsers[i] = _.bind(fn, this);
      }, this);

      _(this.argumentParsers).each(function (fn, i) {
        this.argumentParsers[i] = _.bind(fn, this);
      }, this);

      var instanceId = window.location.pathname.split("/")[1];
      if (!instanceId || instanceId.length < 1) {
        this.addInvokes(JSON.parse(invokeSample));
      }
    },

    toJSON: function () {
      var serializableInvokes = _(this.invokes).map(function (invoke) {
        var str = invoke.node.source;
        var isos = [];
        if (str) {
          _(str.split("iso_")).each(function (s) {
            var arr = s.split("_iso");
            if (arr.length > 1) {
              isos.push(arr[0])
            }
          });
        }

        return {
          childCalls: _(invoke.childCalls).map(function (i) {
            return i.invocationId
          }),
          childAsyncLinks: _(invoke.childAsyncLinks).map(function (i) {
            return i.invocationId
          }),
          childAsyncSerialLinks: _(invoke.childAsyncSerialLinks).map(function (i) {
            return i.invocationId
          }),
          parentCalls: _(invoke.parentCalls).map(function (i) {
            return i.invocationId
          }),
          parentAsyncLink: invoke.parentAsyncLink ? invoke.parentAsyncLink.invocationId : null,
          parentAsyncSerialLinks: _(invoke.parentAsyncSerialLinks).map(function (i) {
            return i.invocationId
          }),


          invocationId: invoke.invocationId,
          topLevelInvocationId: invoke.invocationId,
          isLib: invoke.invocationId,
          nodeId: invoke.nodeId,
          nodeName: invoke.node.name,
          nodeType: invoke.node.type,
          nodeSource: invoke.node.source ? invoke.node.source.substr(0, 300) : null,
          tick: invoke.tick,
          timestamp: invoke.timestamp,
          parents: invoke.parents,
          arguments: invoke.arguments,
          returnValue: invoke.returnValue,

          functionSerials: isos,

          repeatCallCount: invoke.repeatCallCount,

          aspectMap: invoke.aspectMap
        };
      }, this);

      return JSON.stringify(serializableInvokes, null, 2);
    },

    addInvokes: function (invokes) {
      var pendingEdges = [];
      var nativeRootInvokes = [];
      // Parse through invokes and populate simple lists of native/lib/top-levels
      _(invokes).each(function (invoke) {
        this.rawInvokes.push(JSON.parse(JSON.stringify(invoke)));

        invoke.aspectMap = {};
        invoke.getLabel = _.bind(function () {
          return this.getInvokeLabel(invoke);
        }, this);
        this.invokes.push(invoke);
        this.invokeIdMap[invoke.invocationId] = invoke;

        if (invoke.topLevelInvocationId === invoke.invocationId) {
          this.rootInvokes.push(invoke);
          invoke.rootInvoke = true;
        }

        var nodeModel = this.activeNodeCollection.get(invoke.nodeId);
        if (!nodeModel) {
          console.warn("Don't have a nodemodel for", invoke.nodeId);
          invoke.node = {};
        } else {
          var nodeInvokes = nodeModel.get('invokes');
          nodeInvokes.push(invoke);
          invoke.node = nodeModel.toJSON();
        }
        invoke.isLib = util.isKnownLibrary(invoke.nodeId);

        if (!invoke.isLib) {
          this.nativeInvokes.push(invoke);

          var hasParentCaller = !!_(invoke.parents).find(function (parent) {
            return parent.type === "call";
          });

          if (!hasParentCaller) {
            nativeRootInvokes.push(invoke);
            invoke.nativeRootInvoke = true;
          }
        }

        // Store parent links to process when the full invokeMap is done
        _(invoke.parents).each(function (parent) {
          pendingEdges.push({
            parentAttributes: parent,
            childInvoke: invoke
          });
        }, this);

        _(invoke.arguments).each(function (arg) {
          if (arg.value && arg.value.type === "function" && arg.value.json) {
            var source;
            if (arg.value.json.indexOf("function") === -1) {
              var isoStr = arg.value.json;
              var isoStartIndex = isoStr.indexOf("iso_");
              var isoEndIndex = isoStr.indexOf("_iso");

              if (isoStartIndex > -1 && isoEndIndex > -1) {
                var serial = isoStr.substring(isoStartIndex, isoEndIndex + 4);
                var nodeModel = this.activeNodeCollection.serialToNode[serial];
                if (nodeModel) {
                  source = nodeModel.get("source");
                }
              }
            } else {
              source = arg.value.json;
            }

            if (!this.argSourceToInvokes[source]) {
              this.argSourceToInvokes[source] = [];
            }

            // Check if we already have this invoke
            var foundInvoke = _(this.argSourceToInvokes[source])
              .find(function (nrInvoke) {
                return nrInvoke.invocationId === invoke.invocationId
              });

            // Store the invoke arg source to be looked up later
            if (!foundInvoke) {
              this.argSourceToInvokes[source].push(invoke);
            }
          }
        }, this);
      }, this);

      // Parse through edges found and create two-way links between parent and child invokes
      // in two different types: direct call and tom's asyn context
      _(pendingEdges).each(function (edge) {
        if (!edge.parentAttributes || !edge.childInvoke) {
          console.warn("Got some disconnected parent/child invocations.");
          return;
        }

        var parentInvoke = this.invokeIdMap[edge.parentAttributes.invocationId];
        var parentType = edge.parentAttributes.type;
        var childInvoke = edge.childInvoke;

        if (!parentInvoke || !childInvoke || !parentType) {
          console.warn("Couldn't find parent/child invocation nodes.");
          return;
        }

        if (parentType === "async") {
          if (!parentInvoke.childAsyncLinks) {
            parentInvoke.childAsyncLinks = [];
          }

          if (childInvoke.parentAsyncLink) {
            console.warn("Child invoke has multiple parents async links, should not happen!");
          }

          childInvoke.parentAsyncLink = parentInvoke;
          parentInvoke.childAsyncLinks.push(childInvoke);

          var asyncEdge = {
            parentInvoke: parentInvoke,
            childInvoke: childInvoke
          };

          var edgeId = asyncEdge.parentInvoke.invocationId + asyncEdge.childInvoke.invocationId;
          if (!this.asyncEdgeMap[edgeId]) {
            this.asyncEdgeMap[edgeId] = asyncEdge;
            this.asyncEdges.push(asyncEdge);
          }
        } else if (parentType === "call") {
          if (!parentInvoke.childCalls) {
            parentInvoke.childCalls = [];
          }

          if (!childInvoke.parentCalls) {
            childInvoke.parentCalls = [];
          }

          childInvoke.parentCalls.push(parentInvoke);
          parentInvoke.childCalls.push(childInvoke);
          this.edges.push({
            parentInvoke: parentInvoke,
            childInvoke: childInvoke
          });
        } else {
          console.log("Found a new parent type", parentType);
        }

        if (!childInvoke.isLib && parentInvoke.isLib) {
          if (!childInvoke.nativeRootInvoke) {
            childInvoke.nativeRootInvoke = true;
            nativeRootInvokes.push(childInvoke);
          }
        }
      }, this);

      // Parse through invoke arguments to determine final missing async serial links
      var rollingNodeIdInvokeMap = {};
      _(nativeRootInvokes).each(function (childInvoke) {

        // Mark repeat recurring/duplicate root nodes
        if (rollingNodeIdInvokeMap[childInvoke.nodeId]) {
          rollingNodeIdInvokeMap[childInvoke.nodeId].sequentialRepeats += 1;

          this.descendTree(childInvoke, function (oInvoke) {
            oInvoke.isSequentialRepeat = true;
          });
        } else {
          childInvoke.sequentialRepeats = 1;
          rollingNodeIdInvokeMap[childInvoke.nodeId] = childInvoke;
        }

        if (!childInvoke.node.source) {
          return;
        }

        var parentInvokes = this.argSourceToInvokes[childInvoke.node.source];

        if (parentInvokes) {
          _(parentInvokes).each(function (parentInvoke) {
            if (!parentInvoke.childAsyncSerialLinks) {
              parentInvoke.childAsyncSerialLinks = [];
            }

            if (!childInvoke.parentAsyncSerialLinks) {
              childInvoke.parentAsyncSerialLinks = [];
            }

            childInvoke.parentAsyncSerialLinks.push(parentInvoke);
            parentInvoke.childAsyncSerialLinks.push(childInvoke);

            var asyncSerialEdge = {
              parentInvoke: parentInvoke,
              childInvoke: childInvoke
            };

            var edgeId = asyncSerialEdge.parentInvoke.invocationId + asyncSerialEdge.childInvoke.invocationId;
            if (!this.asyncSerialEdgeMap[edgeId]) {
              this.asyncSerialEdgeMap[edgeId] = asyncSerialEdge;
              this.asyncSerialEdges.push(asyncSerialEdge);
            }
          }, this);
        }
      }, this);

      // Save our new nativeRootInvokes
      this.nativeRootInvokes = this.nativeRootInvokes.concat(nativeRootInvokes);

      // Add setup attribute to all first tree nodes
      if (this.nativeInvokes[0]) {
        this.nativeInvokes[0].aspectMap["page load"] = true;
        var setupCollection = this.aspectCollectionMap.setup;
        this.descendTree(this.nativeInvokes[0], function (node) {
          node.aspectMap["setup"] = true;
          setupCollection.push(node);
        });
      }

      // Place invokes into queryable buckets
      _(this.invokes).map(this.classifyInvoke, this);
    },


    climbTree: function (node, decorator, stopCondition) {
      decorator(node);

      if (stopCondition && stopCondition(node)) {
        return;
      }

      // Otherwise keep climbing
      _(node.parentCalls).find(function (parentNode) {
        return this.climbTree(parentNode, decorator, stopCondition)
      }, this);
    },

    descendTree: function (node, decorator, stopCondition) {
      decorator(node);

      if (stopCondition && stopCondition(node)) {
        return;
      }

      _(node.childCalls).each(function (node) {
        this.descendTree(node, decorator, stopCondition)
      }, this);
    },

    climbDescendAndDecorate: function (node, decorator) {
      var stopCondition = function (node) {
        return !node.isLib;
      };

      this.climbTree(node, decorator, null);
      this.descendTree(node, decorator, stopCondition)
    },

    decorateAspect: function (node, aspect, nodeAspectArr) {
      var decorator = function (invokeNode) {
        invokeNode.aspectMap[aspect] = true;
        nodeAspectArr.push(invokeNode);
      };

      decorator(node);

      if (node.isLib) {
        decorator = _.bind(decorator, this);
        this.climbDescendAndDecorate(node, decorator);
      }
    },

    parseEventFromArg: function (arg) {
      if (arg && arg.value && arg.value.ownProperties) {
        // jQuery 2, zepto event bindings
        if (arg.value.ownProperties.eventName) {
          if (arg.value.ownProperties.eventName.value.indexOf("Event") > -1) {
            if (arg.value.ownProperties.type) {
              return arg.value.ownProperties.type.value;
            }
          }
        } else if (arg.value.ownProperties.originalEvent) {
          // jQuery 1 event bindings
          if (arg.value.ownProperties.originalEvent.preview) {
            if (arg.value.ownProperties.originalEvent.preview.indexOf("Event") > -1) {
              if (arg.value.ownProperties.type) {
                return arg.value.ownProperties.type.value;
              }
            }
          }
        }
      }

      return null;
    },

    mouseEvents: [
      "click",
      "mousemove",
      "mousedown",
      "mouseup",
      "mouseout",
      "mouseover",
      "mouseenter",
      "mouseleave"
    ],

    keyEvents: [
      "keydown",
      "keypress",
      "keyup"
    ],

    ajaxEvents: [
      "ajaxRequest",
      "ajaxResponse"
    ],

    domQueries: [
      "domQuery",
      "jqDom"
    ],

    aspectCollectionMap: {
      click: [],
      mousemove: [],
      mousedown: [],
      mouseup: [],
      mouseout: [],
      mouseover: [],
      mouseenter: [],
      mouseleave: [],
      keydown: [],
      keypress: [],
      keyup: [],
      ajaxRequest: [],
      ajaxResponse: [],
      domQuery: [],
      jqDom: [],
      setup: []
    },

    argumentParsers: [
      function (arg) {
        var ev = this.parseEventFromArg(arg);
        if (ev && this.aspectCollectionMap[ev]) {
          return ev;
        }

        return null;
      },
      function (arg) {
        try {
          if ((arg.value.ownProperties.type.value === "load" ||
            arg.value.ownProperties.type.value === "readystatechange" ||
            arg.value.ownProperties.type.value === "xmlhttprequest") &&
            arg.value.ownProperties.status.value !== 0 &&
            arg.value.ownProperties.status.type === "number") {
            return "ajaxResponse";
          }
        } catch (ignored) {
        }
        return null;
      }
    ],

    returnValueParsers: [
      function (invoke) {
        try {
          if (invoke.returnValue.ownProperties.type.value === "xmlhttprequest" ||
            invoke.returnValue.ownProperties.status.value === 0) {
            return "ajaxRequest";
          }
        } catch (ignored) {
          return null;
        }
      },
      function (invoke) {
        try {
          if (invoke.returnValue.ownProperties.length &&
            invoke.returnValue.ownProperties.selector.value) {
            return "jqDom";
          }
        } catch (ignored) {
          return null;
        }
      },
      function (invoke) {
        try {
          if (invoke.returnValue.ownProperties.elementType &&
            invoke.returnValue.ownProperties.elementType.value.indexOf("HTML") > -1) {
            return "domQuery";
          }
        } catch (ignored) {
          return null;
        }
      },
    ],

    classifyInvoke: function (invoke) {
      if (!this.maxHitCount || invoke.node.invokes.length > this.maxHitCount) {
        this.maxHitCount = invoke.node.invokes.length;
      }

      if (invoke.node && invoke.node.name &&
        (invoke.node.name === "('$' callback)" || invoke.node.name.indexOf(".js toplevel") > -1)) {
        invoke.aspectMap["setup"] = true;
        this.aspectCollectionMap.setup.push(invoke);
      }

      //Check return values for ajax requests
      _(this.returnValueParsers).each(function (parser) {
        var aspect = parser(invoke);
        if (aspect) {
          this.decorateAspect(invoke, aspect, this.aspectCollectionMap[aspect]);
        }
      }, this);

      // Comb through arguments for click handlers and ajax responses
      _(invoke.arguments).each(function (arg) {
        _(this.argumentParsers).each(function (parser) {
          var aspect = parser(arg);
          if (aspect) {
            this.decorateAspect(invoke, aspect, this.aspectCollectionMap[aspect]);
          }
        }, this);
      }, this);
    },

    getInvokeLabel: function (invoke) {
      var aspects = invoke.aspectMap ? _(invoke.aspectMap).keys().join(", ") : "";
      var name = invoke.node.name;
      // var root = invoke.rootInvoke ? "rootInvoke" : "";
      // var nativeRoot = invoke.nativeRootInvoke ? "nativeRootInvoke" : "";

      var hits = invoke.node.invokes.length;

      if (aspects) {
        aspects = "[" + aspects + "]"
      }

      return [aspects, name, "×", hits].join(" ");
    },

    sort: function () {
      this.invokes.sort(function (a, b) {
        if (a.timestamp > b.timestamp) {
          return 1;
        } else if (a.timestamp < b.timestamp) {
          return -1;
        } else {
          // Secondary sort on tick
          if (a.tick > b.tick) {
            return 1;
          } else if (a.tick < b.tick) {
            return -1;
          } else {
            return 0;
          }
        }
      });
    }
  });
});