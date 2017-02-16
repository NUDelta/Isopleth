var invocations = [{
    "timestamp": 1487281726819,
    "tick": 7,
    "invocationId": "0.9807245813414156-7",
    "topLevelInvocationId": "0.9807245813414156-6",
    "nodeId": "http://localhost:3004/javascripts/home.js-callsite-8-3-8-37",
    "arguments": [{"value": {"type": "string", "value": "hidden"}}],
    "this": {"type": "object", "preview": "[object Object]", "ownProperties": {}},
    "parents": [{"invocationId": "0.9807245813414156-6", "type": "call", "inbetween": []}],
    "node": {
      "path": "http://localhost:3004/javascripts/home.js",
      "start": {"line": 8, "column": 3},
      "end": {"line": 8, "column": 37},
      "id": "http://localhost:3004/javascripts/home.js-callsite-8-3-8-37",
      "source": "photoEl.classList.toggle(\"hidden\")",
      "type": "callsite",
      "name": "photoEl.classList.toggle",
      "nameStart": {"line": 8, "column": 21},
      "nameEnd": {"line": 8, "column": 27},
      "startLine": 8,
      "startColumn": 3,
      "endLine": 8,
      "endColumn": 37
    },
    "callStack": [{
      "timestamp": 1487281726818,
      "tick": 6,
      "invocationId": "0.9807245813414156-6",
      "topLevelInvocationId": "0.9807245813414156-6",
      "nodeId": "http://localhost:3004/javascripts/home.js-function-5-22-10-2",
      "arguments": [{
        "value": {
          "type": "object",
          "preview": "[object Object]",
          "ownProperties": {
            "eventName": {"type": "string", "value": "[object MouseEvent]"},
            "altKey": {"type": "boolean", "value": false},
            "bubbles": {"type": "boolean", "value": true},
            "button": {"type": "number", "value": 0},
            "buttons": {"type": "number", "value": 0},
            "cancelBubble": {"type": "boolean", "value": false},
            "cancelable": {"type": "boolean", "value": true},
            "clientX": {"type": "number", "value": 89},
            "clientY": {"type": "number", "value": 157},
            "composed": {"type": "boolean", "value": true},
            "ctrlKey": {"type": "boolean", "value": false},
            "currentTarget": {
              "type": "string",
              "value": "<button id=\"test2\" class=\"btn btn-primary\">Moment Call</button>"
            },
            "defaultPrevented": {"type": "boolean", "value": false},
            "detail": {"type": "number", "value": 1},
            "eventPhase": {"type": "number", "value": 2},
            "fromElement": {"type": "null", "preview": "null"},
            "isTrusted": {"type": "boolean", "value": true},
            "layerX": {"type": "number", "value": 91},
            "layerY": {"type": "number", "value": 12},
            "metaKey": {"type": "boolean", "value": false},
            "movementX": {"type": "number", "value": 0},
            "movementY": {"type": "number", "value": 0},
            "offsetX": {"type": "number", "value": 75},
            "offsetY": {"type": "number", "value": 11},
            "pageX": {"type": "number", "value": 89},
            "pageY": {"type": "number", "value": 157},
            "path": {"type": "string", "value": "body>div:eq(2)>div>button"},
            "relatedTarget": {"type": "null", "preview": "null"},
            "returnValue": {"type": "boolean", "value": true},
            "screenX": {"type": "number", "value": 2009},
            "screenY": {"type": "number", "value": 254},
            "shiftKey": {"type": "boolean", "value": false},
            "sourceCapabilities": {"type": "string", "value": "[object InputDeviceCapabilities]"},
            "target": {"type": "string", "value": "<button id=\"test2\" class=\"btn btn-primary\">Moment Call</button>"},
            "timeStamp": {"type": "number", "value": 114988.05000000002},
            "toElement": {
              "type": "string",
              "value": "<button id=\"test2\" class=\"btn btn-primary\">Moment Call</button>"
            },
            "type": {"type": "string", "value": "click"},
            "view": {"type": "string", "value": "[object Window]"},
            "which": {"type": "number", "value": 1},
            "x": {"type": "number", "value": 89},
            "y": {"type": "number", "value": 157}
          },
          "truncated": {"keys": {"amount": 2}}
        }
      }],
      "this": {"type": "object", "preview": "[object Object]", "ownProperties": {}}
    }],
    "nodeName": "photoEl.classList.toggle"
  }, {
    "timestamp": 1487281726818,
    "tick": 6,
    "invocationId": "0.9807245813414156-6",
    "topLevelInvocationId": "0.9807245813414156-6",
    "nodeId": "http://localhost:3004/javascripts/home.js-function-5-22-10-2",
    "arguments": [{
      "value": {
        "type": "object",
        "preview": "[object Object]",
        "ownProperties": {
          "eventName": {"type": "string", "value": "[object MouseEvent]"},
          "altKey": {"type": "boolean", "value": false},
          "bubbles": {"type": "boolean", "value": true},
          "button": {"type": "number", "value": 0},
          "buttons": {"type": "number", "value": 0},
          "cancelBubble": {"type": "boolean", "value": false},
          "cancelable": {"type": "boolean", "value": true},
          "clientX": {"type": "number", "value": 89},
          "clientY": {"type": "number", "value": 157},
          "composed": {"type": "boolean", "value": true},
          "ctrlKey": {"type": "boolean", "value": false},
          "currentTarget": {
            "type": "string",
            "value": "<button id=\"test2\" class=\"btn btn-primary\">Moment Call</button>"
          },
          "defaultPrevented": {"type": "boolean", "value": false},
          "detail": {"type": "number", "value": 1},
          "eventPhase": {"type": "number", "value": 2},
          "fromElement": {"type": "null", "preview": "null"},
          "isTrusted": {"type": "boolean", "value": true},
          "layerX": {"type": "number", "value": 91},
          "layerY": {"type": "number", "value": 12},
          "metaKey": {"type": "boolean", "value": false},
          "movementX": {"type": "number", "value": 0},
          "movementY": {"type": "number", "value": 0},
          "offsetX": {"type": "number", "value": 75},
          "offsetY": {"type": "number", "value": 11},
          "pageX": {"type": "number", "value": 89},
          "pageY": {"type": "number", "value": 157},
          "path": {"type": "string", "value": "body>div:eq(2)>div>button"},
          "relatedTarget": {"type": "null", "preview": "null"},
          "returnValue": {"type": "boolean", "value": true},
          "screenX": {"type": "number", "value": 2009},
          "screenY": {"type": "number", "value": 254},
          "shiftKey": {"type": "boolean", "value": false},
          "sourceCapabilities": {"type": "string", "value": "[object InputDeviceCapabilities]"},
          "target": {"type": "string", "value": "<button id=\"test2\" class=\"btn btn-primary\">Moment Call</button>"},
          "timeStamp": {"type": "number", "value": 114988.05000000002},
          "toElement": {"type": "string", "value": "<button id=\"test2\" class=\"btn btn-primary\">Moment Call</button>"},
          "type": {"type": "string", "value": "click"},
          "view": {"type": "string", "value": "[object Window]"},
          "which": {"type": "number", "value": 1},
          "x": {"type": "number", "value": 89},
          "y": {"type": "number", "value": 157}
        },
        "truncated": {"keys": {"amount": 2}}
      }
    }],
    "this": {"type": "object", "preview": "[object Object]", "ownProperties": {}},
    "parents": [{"invocationId": "0.9807245813414156-2", "type": "async", "inbetween": []}],
    "node": {
      "path": "http://localhost:3004/javascripts/home.js",
      "start": {"line": 5, "column": 22},
      "end": {"line": 10, "column": 2},
      "id": "http://localhost:3004/javascripts/home.js-function-5-22-10-2",
      "source": "function () {\n  \"iso_209d5249-a2c1-4599-b0f0-24fc747b2bd2_iso\";\n  if (photoEl.classList) {\n   photoEl.classList.toggle(\"hidden\");\n  }\n }",
      "type": "function",
      "name": "eventHandlerFn",
      "params": [],
      "startLine": 5,
      "startColumn": 22,
      "endLine": 10,
      "endColumn": 2
    },
    "callStack": [],
    "nodeName": "eventHandlerFn"
  }, {
    "timestamp": 1487281612061,
    "tick": 5,
    "invocationId": "0.9807245813414156-5",
    "topLevelInvocationId": "0.9807245813414156-0",
    "nodeId": "http://localhost:3004/javascripts/home.js-callsite-11-1-11-54",
    "arguments": [{"value": {"type": "string", "value": "click"}}, {"value": {"type": "function", "name": ""}}],
    "this": {"type": "object", "preview": "[object Object]", "ownProperties": {}},
    "parents": [{"invocationId": "0.9807245813414156-2", "type": "call", "inbetween": []}],
    "node": {
      "path": "http://localhost:3004/javascripts/home.js",
      "start": {"line": 11, "column": 1},
      "end": {"line": 11, "column": 54},
      "id": "http://localhost:3004/javascripts/home.js-callsite-11-1-11-54",
      "source": "testElement.addEventListener(\"click\", eventHandlerFn)",
      "type": "callsite",
      "name": "testElement.addEventListener",
      "nameStart": {"line": 11, "column": 13},
      "nameEnd": {"line": 11, "column": 29},
      "startLine": 11,
      "startColumn": 1,
      "endLine": 11,
      "endColumn": 54
    },
    "callStack": [{
      "timestamp": 1487281612059,
      "tick": 2,
      "invocationId": "0.9807245813414156-2",
      "topLevelInvocationId": "0.9807245813414156-0",
      "nodeId": "http://localhost:3004/javascripts/home.js-function-1-0-12-1",
      "arguments": []
    }],
    "nodeName": "testElement.addEventListener"
  }, {
    "timestamp": 1487281612060,
    "tick": 4,
    "invocationId": "0.9807245813414156-4",
    "topLevelInvocationId": "0.9807245813414156-0",
    "nodeId": "http://localhost:3004/javascripts/home.js-callsite-4-15-4-49",
    "arguments": [{"value": {"type": "string", "value": "effect2"}}],
    "this": {
      "type": "object",
      "preview": "[object Object]",
      "ownProperties": {"effect1": {"type": "undefined"}, "effect3": {"type": "undefined"}}
    },
    "parents": [{"invocationId": "0.9807245813414156-2", "type": "call", "inbetween": []}],
    "node": {
      "path": "http://localhost:3004/javascripts/home.js",
      "start": {"line": 4, "column": 15},
      "end": {"line": 4, "column": 49},
      "id": "http://localhost:3004/javascripts/home.js-callsite-4-15-4-49",
      "source": "document.getElementById(\"effect2\")",
      "type": "callsite",
      "name": "document.getElementById",
      "nameStart": {"line": 4, "column": 24},
      "nameEnd": {"line": 4, "column": 38},
      "startLine": 4,
      "startColumn": 15,
      "endLine": 4,
      "endColumn": 49
    },
    "callStack": [{
      "timestamp": 1487281612059,
      "tick": 2,
      "invocationId": "0.9807245813414156-2",
      "topLevelInvocationId": "0.9807245813414156-0",
      "nodeId": "http://localhost:3004/javascripts/home.js-function-1-0-12-1",
      "arguments": []
    }],
    "nodeName": "document.getElementById"
  }, {
    "timestamp": 1487281612059,
    "tick": 3,
    "invocationId": "0.9807245813414156-3",
    "topLevelInvocationId": "0.9807245813414156-0",
    "nodeId": "http://localhost:3004/javascripts/home.js-callsite-3-19-3-51",
    "arguments": [{"value": {"type": "string", "value": "test2"}}],
    "this": {
      "type": "object",
      "preview": "[object Object]",
      "ownProperties": {"effect1": {"type": "undefined"}, "effect3": {"type": "undefined"}}
    },
    "parents": [{"invocationId": "0.9807245813414156-2", "type": "call", "inbetween": []}],
    "node": {
      "path": "http://localhost:3004/javascripts/home.js",
      "start": {"line": 3, "column": 19},
      "end": {"line": 3, "column": 51},
      "id": "http://localhost:3004/javascripts/home.js-callsite-3-19-3-51",
      "source": "document.getElementById(\"test2\")",
      "type": "callsite",
      "name": "document.getElementById",
      "nameStart": {"line": 3, "column": 28},
      "nameEnd": {"line": 3, "column": 42},
      "startLine": 3,
      "startColumn": 19,
      "endLine": 3,
      "endColumn": 51
    },
    "callStack": [{
      "timestamp": 1487281612059,
      "tick": 2,
      "invocationId": "0.9807245813414156-2",
      "topLevelInvocationId": "0.9807245813414156-0",
      "nodeId": "http://localhost:3004/javascripts/home.js-function-1-0-12-1",
      "arguments": []
    }],
    "nodeName": "document.getElementById"
  }, {
    "timestamp": 1487281612059,
    "tick": 2,
    "invocationId": "0.9807245813414156-2",
    "topLevelInvocationId": "0.9807245813414156-0",
    "nodeId": "http://localhost:3004/javascripts/home.js-function-1-0-12-1",
    "arguments": [],
    "parents": [{"invocationId": "0.9807245813414156-1", "type": "call", "inbetween": []}],
    "node": {
      "path": "http://localhost:3004/javascripts/home.js",
      "start": {"line": 1, "column": 0},
      "end": {"line": 12, "column": 1},
      "id": "http://localhost:3004/javascripts/home.js-function-1-0-12-1",
      "source": "function load() {\n \"iso_fe108853-9581-417c-8c03-5e270b82e987_iso\";\n var testElement = document.getElementById(\"test2\");\n var photoEl = document.getElementById(\"effect2\");\n var eventHandlerFn = function () {\n  \"iso_209d5249-a2c1-4599-b0f0-24fc747b2bd2_iso\";\n  if (photoEl.classList) {\n   photoEl.classList.toggle(\"hidden\");\n  }\n };\n testElement.addEventListener(\"click\", eventHandlerFn);\n}",
      "type": "function",
      "name": "load",
      "params": [],
      "startLine": 1,
      "startColumn": 0,
      "endLine": 12,
      "endColumn": 1
    },
    "callStack": [],
    "nodeName": "load"
  }, {
    "timestamp": 1487281612059,
    "tick": 1,
    "invocationId": "0.9807245813414156-1",
    "topLevelInvocationId": "0.9807245813414156-0",
    "nodeId": "http://localhost:3004/javascripts/home.js-callsite-13-0-13-6",
    "arguments": [],
    "parents": [{"invocationId": "0.9807245813414156-0", "type": "call", "inbetween": []}],
    "node": {
      "path": "http://localhost:3004/javascripts/home.js",
      "start": {"line": 13, "column": 0},
      "end": {"line": 13, "column": 6},
      "id": "http://localhost:3004/javascripts/home.js-callsite-13-0-13-6",
      "source": "load()",
      "type": "callsite",
      "name": "load",
      "nameStart": {"line": 13, "column": 0},
      "nameEnd": {"line": 13, "column": 4},
      "startLine": 13,
      "startColumn": 0,
      "endLine": 13,
      "endColumn": 6
    },
    "callStack": [],
    "nodeName": "load"
  }, {
    "timestamp": 1487281612059,
    "tick": 0,
    "invocationId": "0.9807245813414156-0",
    "topLevelInvocationId": "0.9807245813414156-0",
    "nodeId": "http://localhost:3004/javascripts/home.js-toplevel-1-0-13-7",
    "node": {
      "path": "http://localhost:3004/javascripts/home.js",
      "start": {"line": 1, "column": 0},
      "end": {"line": 13, "column": 7},
      "id": "http://localhost:3004/javascripts/home.js-toplevel-1-0-13-7",
      "type": "toplevel",
      "name": "(home.js toplevel)",
      "startLine": 1,
      "startColumn": 0,
      "endLine": 13,
      "endColumn": 7
    },
    "callStack": [],
    "nodeName": "(home.js toplevel)"
  }]
  ;

var _ = require("/code/ibex/socket-fondue-jsbin/node_modules/underscore/underscore");


/*

 Timestamp in sequential order
 tick for duplicate timestamps

 If node is function
 for invokes with top level invocation id === invocation id //
 search all nodes for an invoke matching node's function signature
 add asyncNodeCallerId to invoke

 Output
 Call graph over time



 Start ----- Load ------------------- click
 | 1                       | 3
 | 3                       | 6
 | 18                      | 1
 | async a ---- callback
 | 4              | 3
 | 12             | 5
 | 2

 */


invocations.sort(function (a, b) {
  if (a.timestamp > b.timestamp) {
    return 1;
  } else if (a.timestamp < b.timestamp) {
    return -1;
  } else {
    if (a.tick > b.tick) {
      return 1;
    } else if (a.tick < b.tick) {
      return -1;
    } else {
      return 0;
    }
  }

  if (a.timestamp === b.timestamp) {
    return -1;
  } else {
    return b.timestamp - a.timestamp;
  }
});

console.log(JSON.stringify(invocations))


var parse = function () {

  _(invocations).each(function (invoke) {
    if (invoke.node.type === "function") {
      if (invoke.topLevelInvocationId === invoke.invocationId) {
        var asyncParentInvoke = _(invocations).find(function (bInvoke) {
          return _(bInvoke.arguments).find(function (arg) {
            return arg.value && arg.value.type === "function"
              && arg.value.json === invoke.node.source;
          });
        });

        if (asyncParentInvoke) {
          invoke.asyncParentId = asyncParentInvoke.node.id;
          console.log(invoke);
        }
      }
    }
  });

};

// parse();
