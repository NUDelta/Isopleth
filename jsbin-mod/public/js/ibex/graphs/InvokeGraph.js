def([
  "backbone",
  "underscore",
  "../util/util",
  "text!../util/invokeSample.txt",
], function (Backbone, _, util, invokeSample) {
  return Backbone.View.extend({

    initialize: function (codeMirrors, sourceCollection, activeNodeCollection, jsBinRouter) {
      this.activeNodeCollection = activeNodeCollection;
      this.invokes = [];
      this.invokeIdMap = {};

      this.nativeInvokes = [];
      this.rootInvokes = [];
      this.nativeRootInvokes = [];
      this.argSourceToInvokes = {};

      this.edges = [];

      this.asyncEdgeMap = [];
      this.asyncEdges = [];

      this.asyncSerialEdgeMap = {};
      this.asyncSerialEdges = [];

      this.addInvokes(JSON.parse(invokeSample));
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

          repeatCallCount: invoke.repeatCallCount
        };
      }, this);

      return JSON.stringify(serializableInvokes, null, 2);
    },

    addInvokes: function (invokes) {
      var pendingEdges = [];
      // Parse through invokes and populate simple lists of native/lib/top-levels
      _(invokes).each(function (invoke) {
        this.invokes.push(invoke);
        this.invokeIdMap[invoke.invocationId] = invoke;

        if (invoke.topLevelInvocationId === invoke.invocationId) {
          this.rootInvokes.push(invoke);
        }

        var nodeModel = this.activeNodeCollection.get(invoke.nodeId);
        if (!nodeModel) {
          console.warn("Don't have a nodemodel for", invoke.nodeId);
          invoke.node = {};
        } else {
          invoke.node = nodeModel.toJSON();
        }
        invoke.isLib = util.isKnownLibrary(invoke.nodeId);

        if (!invoke.isLib) {
          this.nativeInvokes.push(invoke);

          var hasParentCaller = !!_(invoke.parents).find(function (parent) {
            return parent.type === "call";
          });

          if (!hasParentCaller) {
            this.nativeRootInvokes.push(invoke);
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
          if (arg.value && arg.value.type === "function"
            && arg.value.json.indexOf("iso_") > -1
            && arg.value.json.indexOf("_iso") > -1
          ) {
            if (!this.argSourceToInvokes[arg.value.json]) {
              this.argSourceToInvokes[arg.value.json] = [];
            }

            // Check if we already have this invoke
            var foundInvoke = _(this.argSourceToInvokes[arg.value.json])
              .find(function (nrInvoke) {
                return nrInvoke.invocationId === invoke.invocationId
              });

            // Store the invoke arg source to be looked up later
            if (!foundInvoke) {
              this.argSourceToInvokes[arg.value.json].push(invoke);
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
          // Check if we already have this native root
          var nativeRoot = _(this.nativeRootInvokes).find(function (nrInvoke) {
            return nrInvoke.invocationId === childInvoke.invocationId
          });

          if (!nativeRoot) {
            this.nativeRootInvokes.push(childInvoke);
          }
        }
      }, this);

      // Parse through invoke arguments to determine final missing async serial links
      var rollingNodeIdInvokeMap = {};
      _(this.nativeRootInvokes).each(function (childInvoke) {

        // Mark repeat recurring root nodes
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

      // Place invokes into queryable buckets
      _(this.invokes).map(this.classifyInvoke, this);
    },

    clickHandlers: [],
    ajaxRequests: [],
    ajaxResponses: [],

    climbTree: function (node, decorator) {
      decorator = _.bind(decorator, this);
      var stopCondition = decorator(node);
      if (stopCondition) {
        return false;
      }

      _(node.parentCalls).find(function (parentNode) {
        return this.climbTree(parentNode, decorator)
      }, this);
      return true;
    },

    descendTree: function (node, decorator) {
      decorator = _.bind(decorator, this);
      decorator(node);

      _(node.childCalls).each(function (node) {
        this.descendTree(node, decorator)
      }, this);
    },

    classifyInvoke: function (invoke) {
      //Check return values for ajax requests
      var isAjaxReq = false;
      try {
        isAjaxReq = invoke.returnValue.ownProperties.type.value === "xmlhttprequest" ||
          invoke.returnValue.ownProperties.status.value === 0;
      } catch (ignored) {
      }
      if (isAjaxReq) {
        this.climbTree(invoke, function (invokeNode) {
          invokeNode.aspects = invokeNode.aspects || [];
          invokeNode.aspects.push("ajaxRequest");
          this.ajaxRequests.push(invokeNode);

          if(invokeNode.node.name === "jsonGetterFn"){
            debugger;
          }

          if(!invokeNode.isLib && invokeNode.node.type === "function"){
            return true;
          }
        });
      }

      // Comb through arguments for click handlers and ajax responses
      _(invoke.arguments).each(function (arg) {
        var isClick = false;
        try {
          isClick = arg.value.ownProperties.eventName.value.toLowerCase().indexOf("event") > -1 &&
            invoke.arguments[0].value.ownProperties.type.value === "click";
        } catch (ignored) {
        }
        if (isClick) {
          this.descendTree(invoke, function (invokeNode) {
            invokeNode.aspects = invokeNode.aspects || [];
            invokeNode.aspects.push("clickHandler");
            this.clickHandlers.push(invokeNode);
          });
        }

        var isAjaxRes = false;
        try {
          isAjaxRes = (arg.value.ownProperties.type.value === "load" ||
            arg.value.ownProperties.type.value === "readystatechange" ||
            arg.value.ownProperties.type.value === "xmlhttprequest") &&
            arg.value.ownProperties.status.value !== 0 &&
            arg.value.ownProperties.status.type === "number"
        } catch (ignored) {
        }
        if (isAjaxRes) {
          this.descendTree(invoke, function (invokeNode) {
            invokeNode.aspects = invokeNode.aspects || [];
            invokeNode.aspects.push("ajaxResponse");
            this.ajaxResponses.push(invokeNode);
          });
        }
      }, this);
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