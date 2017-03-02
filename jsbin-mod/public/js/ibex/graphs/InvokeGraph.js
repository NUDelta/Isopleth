def([
  "backbone",
  "underscore",
  "../util/util"
], function (Backbone, _, util) {
  return Backbone.View.extend({

    initialize: function (codeMirrors, sourceCollection, activeNodeCollection, jsBinRouter) {
      this.activeNodeCollection = activeNodeCollection;
      this.invokes = [];
      this.invokeIdMap = {};
      this.nativeInvokes = [];
      this.rootInvokes = [];
      this.nativeRootInvokes = [];
      this.argSourceToInvokes = {};

      this.visualGraph = {
        nodes: [],
        edges: [], // blue
        nativeNodes: [], // yellow
        asyncEdges: [],  // black
        asyncSerialEdges: [] //purple
      };
    },

    addInvokes: function (invokes) {
      var edges = [];

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

        var graphNode = {
          id: invoke.invocationId,
          label: invoke.node.name && invoke.node.name.length < 44 ? invoke.node.name : "",
          title: invoke.node.source,
          color: "yellow"
        };

        if (!invoke.isLib) {
          this.nativeInvokes.push(invoke);

          graphNode.color = "orange";
          this.visualGraph.nativeNodes.push(graphNode);

          var hasParentCaller = !!_(invoke.parents).find(function (parent) {
            return parent.type === "call";
          });

          if (!hasParentCaller) {
            this.nativeRootInvokes.push(invoke);
          }
        }

        this.visualGraph.nodes.push(graphNode);

        // Store parent links to process when the full invokeMap is done
        _(invoke.parents).each(function (parent) {
          edges.push({
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
      _(edges).each(function (edge) {
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
          this.visualGraph.asyncEdges.push({
            from: parentInvoke.invocationId,
            to: childInvoke.invocationId,
            color: "black"
          });
        } else if (parentType === "call") {
          if (!parentInvoke.childCalls) {
            parentInvoke.childCalls = [];
          }

          if (!childInvoke.parentCalls) {
            childInvoke.parentCalls = [];
          }

          childInvoke.parentCalls.push(parentInvoke);
          parentInvoke.childCalls.push(childInvoke);
          this.visualGraph.edges.push({
            from: parentInvoke.invocationId,
            to: childInvoke.invocationId,
            color: "blue"
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
      _(this.nativeRootInvokes).each(function (childInvoke) {
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
            this.visualGraph.asyncSerialEdges.push({
              from: parentInvoke.invocationId,
              to: childInvoke.invocationId,
              color: "purple"
            });
          }, this);

        }
      }, this);

      _(this.invokes).map(this.classifyArguments, this);
    },

    clickHandlers: [],
    ajaxRequests: [],
    ajaxResponses: [],

    classifyArguments: function (invoke) {
      var climbTree = _.bind(function (node, decorator) {
        decorator = _.bind(decorator, this);
        decorator(node);

        if (node.isLib) {
          _(node.parentCalls).each(function (parentNode) {
            climbTree(parentNode, decorator)
          });
        }
      }, this);

      var descendTree = _.bind(function (node, decorator) {
        decorator = _.bind(decorator, this);
        decorator(node);

        if (node.isLib) {
          _(node.childCalls).each(function (node) {
            descendTree(node, decorator)
          });
        }
      }, this);

      _(invoke.arguments).each(function (arg) {
        var isClick = false;
        try {
          isClick = arg.value.ownProperties.eventName.value.toLowerCase().indexOf("event") > -1 &&
            invoke.arguments[0].value.ownProperties.type.value === "click";
        } catch (ignored) {
        }
        if (isClick) {
          climbTree(invoke, function (invokeNode) {
            invokeNode.aspects = invokeNode.aspects || [];
            invokeNode.aspects.push("clickHandler");
            this.clickHandlers.push(invokeNode);
          });
        }

        var isAjaxReq = false;
        try {
          isAjaxReq = (arg.value.ownProperties.type.value === "load" ||
            arg.value.ownProperties.type.value === "readystatechange" ||
            arg.value.ownProperties.type.value === "xmlhttprequest") &&
            arg.value.ownProperties.status.value === 0;
        } catch (ignored) {
        }
        if (isAjaxReq) {
          climbTree(invoke, function (invokeNode) {
            invokeNode.aspects = invokeNode.aspects || [];
            invokeNode.aspects.push("ajaxRequest");
            this.ajaxRequests.push(invokeNode);
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
          descendTree(invoke, function (invokeNode) {
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