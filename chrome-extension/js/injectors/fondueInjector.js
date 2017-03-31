define([], function () {
    return function () {
      var FondueBridge = function () {
        this.updateTrackedNodes = unravelAgent._.bind(this.updateTrackedNodes, this);
        this.startTracking = unravelAgent._.bind(this.startTracking, this);
        this.getNodes = unravelAgent._.bind(this.getNodes, this);
        this.resetTracer = unravelAgent._.bind(this.resetTracer, this);
        this.startTrackInterval = unravelAgent._.bind(this.startTrackInterval, this);
        this.totalInvocations = 0;
      };

      // FondueBridge.MAX_LOG_COUNT = 3000;
      // FondueBridge.MAX_STACK_DEPTH = 20;
      // FondueBridge.EMIT_INTERVAL_MILLIS = 3000;


      FondueBridge.MAX_LOG_COUNT = 2000;
      FondueBridge.BUFFER_INTERVAL_MILLIS = 1000;

      FondueBridge.EMIT_INTERVAL_MILLIS = 2000;
      FondueBridge.EMIT_INVOKE_COUNT = 2000;
      FondueBridge.EMIT_NODE_MILLIS = 3000;

      FondueBridge.prototype = {
        constructor: FondueBridge,

        emitBuffer: [],

        nodeById: {},

        getTracerNodeList: function(){
          return __tracer.getNodeList();
        },

        getNodes: function () {
          var nodeList = __tracer.getNodeList();
          var newNodes = [];

          unravelAgent._(nodeList).map(function (node) {
            if (!this.nodeById[node.id]) {
              this.nodeById[node.id] = node;
              newNodes.push(node);
            }
          }, this);

          return newNodes;
        },

        startTracking: function () {
          console.log("FondueInjector: startTracking()");
          this.startTrackInterval();
        },

        resetTracer: function () {
          // window.__tracer.resetTrace();
          // this.logHandles.push(window.__tracer.trackLogs({ids: this.ids}));
        },

        updateTrackedNodes: function () {
          // this.ids = unravelAgent._(__tracer.getNodeMap()).keys();
          // this.logHandles.push(window.__tracer.trackLogs({ids: this.ids}));
        },

        startTrackInterval: function () {
          // this.updateTrackedNodes();
          // if (!this.ids || this.ids.length < 1) {
          //   console.log("fondueInjector: startTrackInterval: no nodes yet.");
          //   setTimeout(unravelAgent._.bind(function () {
          //     this.startTrackInterval();
          // }, this), FondueBridge.EMIT_INTERVAL_MILLIS);
          // return;
          // }

          console.log("fondueInjector: startTrackInterval: Got nodes... emitting");
          // this.logHandle = window.__tracer.trackLogs({ids: this.ids});
          if (this.interval) {
            window.clearInterval(this.interval);
            window.clearInterval(this.interval2);
          }

          this.interval = setInterval(unravelAgent._.bind(function () {
            this.transferInvokesToEmitBuffer();
          }, this), FondueBridge.BUFFER_INTERVAL_MILLIS);

          this.interval2 = setInterval(unravelAgent._.bind(function () {
            this.emitNodeActivity();
          }, this), FondueBridge.EMIT_INTERVAL_MILLIS);

          this.interval3 = setInterval(unravelAgent._.bind(function () {
            this.emitNodeList();
          }, this), FondueBridge.EMIT_NODE_MILLIS);
        },

        emitNodeList: function () {
          var nodeArr = this.getNodes();

          unravelAgent._(nodeArr).each(function (node) {
            node.startLine = node.start.line;
            node.startColumn = node.start.column;
            node.endLine = node.end.line;
            node.endColumn = node.end.column;
            node.invokes = [];
          });

          window.dispatchEvent(new CustomEvent("fondueDTO", {
            detail: {
              eventStr: "fondueDTO:newNodeList",
              obj: {nodes: nodeArr}
            }
          }));
        },

        //keep in sync with activeNodeModel
        _domFnNames: unravelAgent._([
          "getElementsByTagName",
          "getElementsByTagNameNS",
          "getElementsByClassName",
          "getElementsByName",
          "getElementById",
          "querySelector",
          //"createElement",
          "querySelectorAll"
        ]),

        isDomQueryNode: function (node) {
          if (!node.name) {
            return false;
          }

          return !!this._domFnNames.find(function (fnName) {
            if (node.name.indexOf(fnName) > -1) {
              node.domQuery = true;
              return true;
            }
          });
        },

        emitScreenCapture: function () {
          unravelAgent.html2canvas(document.body).then(function (canvas) {
            window.dispatchEvent(new CustomEvent("fondueDTO", {
                detail: {
                  eventStr: "fondueDTO:screenCapture",
                  obj: {dataURL: canvas.toDataURL('image/jpeg', 1.0)}
                }
              })
            );
          });
        },

        transferInvokesToEmitBuffer: function () {
          try {
            //Get the last n javascript calls logged
            var logEntryArr = __tracer.getLogEntryArr();
            console.log("Buffer length", this.emitBuffer.length, "of", logEntryArr[0].entries.length);
            this.emitBuffer.push.apply(this.emitBuffer, window.__tracer.logDelta(0, FondueBridge.MAX_LOG_COUNT));
          } catch (err) {
            console.warn("Err on buffering invocations:", err);
          }
        },

        emitNodeActivity: function () {
          var invocations = this.emitBuffer.splice(0, FondueBridge.EMIT_INVOKE_COUNT);
          console.log("emitNodeActivity:", invocations.length, "invocations");

          window.dispatchEvent(new CustomEvent("fondueDTO", {
              detail: {
                eventStr: "fondueDTO:arrInvocations",
                obj: {invocations: invocations}
              }
            })
          );
        }
      };

      window.unravelAgent.fondueBridge = new FondueBridge();
    }
  }
);