$.ajaxSetup({cache: false});
$.getJSON("/javascripts/invoke-json.json", null, function (invokes) {
// $.getJSON("/javascripts/invoke-normal.json", null, function (invokes) {

  var invokeMap = {};
  _(invokes).each(function (invoke) {
    invokeMap[invoke.invocationId] = invoke;
  });

  var nodes = [];
  var edges = [];
  var nativeInvokes = [];
  var topLevelInvokes = [];
  _(invokes).each(function (invoke) {
    if (invoke.topLevelInvocationId === invoke.invocationId) {
      topLevelInvokes.push(invoke);
    }

    invoke.isLib = invoke.node.id.indexOf("zepto") > -1;
    var graphNode = {
      id: invoke.invocationId,
      label: invoke.node.name && invoke.node.name.length < 44 ? invoke.node.name : "",
      color: "yellow"
    };

    if (!invoke.isLib) {
      nativeInvokes.push(invoke);
    }

    nodes.push(graphNode);
    invoke.graphNode = graphNode;

    _(invoke.parents).each(function (parent) {
      if (parent.type === "async") {
        //do nothing;
      } else {
        edges.push({from: parent.invocationId, to: invoke.invocationId, color: 'blue'});
        if (!invokeMap[parent.invocationId].children) {
          invokeMap[parent.invocationId].children = [];
        }
        invokeMap[parent.invocationId].children.push(invoke);
      }
    });
  });

  var count = 0;
  var nativeRoots = [];
  var findNativeRoots = function (invoke) {
    invoke.visited = true;

    var hasAsyncOrLibParent = _(invoke.parents).find(function (p) {
      return p.type === "async" || invokeMap[p.invocationId].isLib
    });
    if (!invoke.isLib && (!invoke.parents || hasAsyncOrLibParent)) {
      nativeRoots.push(invoke);
    }

    _(invoke.children).each(function (childNode) {
      findNativeRoots(childNode);
    });

    invoke.visited = false;

    count++;
  };

  _(topLevelInvokes).each(findNativeRoots);

  var network = null;
  var layoutMethod = "directed";

  function destroy() {
    if (network !== null) {
      network.destroy();
      network = null;
    }
  }

  function draw() {
    destroy();

    // create a network
    var container = $("#graph")[0];

    var nodeDataSet = new vis.DataSet();
    nodeDataSet.add(nodes);
    var edgeDataSet = new vis.DataSet();
    edgeDataSet.add(edges);

    // create a network
    var data = {
      nodes: nodeDataSet,
      edges: edgeDataSet
    };

    var options = {
      layout: {
        hierarchical: {
          sortMethod: layoutMethod
        }
      },
      edges: {
        smooth: true,
        arrows: {to: true}
      }
    };
    network = new vis.Network(container, data, options);
    window.network = network;

    $("#topGreen").click(function () {
      _(nativeRoots).each(function (invoke) {
        nodeDataSet.update({
          id: invoke.invocationId,
          color: "green"
        });
      });
    });

    $("#customRed").click(function () {
      _(nativeInvokes).each(function (invoke) {
        nodeDataSet.update({
          id: invoke.invocationId,
          color: "red"
        });
      });
    });

    var ids = _(nativeInvokes).pluck("invocationId");
    var without = _(invokeMap).chain().keys().difference(ids).value();

    $("#prune").click(function () {
      _(without).each(function (id) {
        nodeDataSet.remove({id: id})
      });
    });

    var traverseInvokeTreeForArg = function (invoke, fromId, source, edges) {
      var argMatch = _(invoke.arguments).find(function (arg) {
        return arg.value && arg.value.type === "function"
          && arg.value.json === source;
      });

      if (argMatch) {
        edges.push({from: fromId, to: invoke.invocationId, color: "purple"});
      }

      _(invoke.children).each(function (child) {
        traverseInvokeTreeForArg(child, fromId, source, edges);
      });
    };

    $("#drawMissing").click(function () {
      _(nativeRoots).each(function (aInvoke) {
        var edges = [];

        _(nativeRoots).each(function (bInvoke) {
          if (aInvoke.invocationId !== bInvoke.invocationId) {
            if (aInvoke.node.source) {
              traverseInvokeTreeForArg(bInvoke, aInvoke.invocationId, aInvoke.node.source, edges);
            }
          }
        });

        if(edges.length === 0){
          if(aInvoke.parents && aInvoke.parents[0] &&
            aInvoke.parents[0].type && aInvoke.parents[0].type === "async"){
            edges.push({from: aInvoke.invocationId, to: aInvoke.parents[0].invocationId, color: "green"})
          }
        }
        _(edges).each(function (edge) {
          edgeDataSet.add(edge);
        });
      });
    });
  }


  draw();
});


function addNode() {
  try {
    nodes.add({
      id: document.getElementById('node-id').value,
      label: document.getElementById('node-label').value
    });
  }
  catch (err) {
    alert(err);
  }
}

function updateNode() {
  try {
    nodes.update({
      id: document.getElementById('node-id').value,
      label: document.getElementById('node-label').value
    });
  }
  catch (err) {
    alert(err);
  }
}
function removeNode() {
  try {
    nodes.remove({id: document.getElementById('node-id').value});
  }
  catch (err) {
    alert(err);
  }
}

function addEdge() {
  try {
    edges.add({
      id: document.getElementById('edge-id').value,
      from: document.getElementById('edge-from').value,
      to: document.getElementById('edge-to').value
    });
  }
  catch (err) {
    alert(err);
  }
}
function updateEdge() {
  try {
    edges.update({
      id: document.getElementById('edge-id').value,
      from: document.getElementById('edge-from').value,
      to: document.getElementById('edge-to').value
    });
  }
  catch (err) {
    alert(err);
  }
}
function removeEdge() {
  try {
    edges.remove({id: document.getElementById('edge-id').value});
  }
  catch (err) {
    alert(err);
  }
}

var options = {
  nodes: {
    shape: 'dot',
    scaling: {
      min: 10,
      max: 30,
      label: {
        min: 8,
        max: 30,
        drawThreshold: 12,
        maxVisible: 20
      }
    },
    font: {
      size: 12,
      face: 'Tahoma'
    }
  },
  edges: {
    width: 0.15,
    color: {inherit: 'from'},
    smooth: {
      type: 'continuous'
    }
  },
  physics: false,
  interaction: {
    tooltipDelay: 200,
    hideEdgesOnDrag: true
  }
};