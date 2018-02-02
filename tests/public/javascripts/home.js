// function jsonB() {
//   var secondHandler = function(){
//     console.log('foo bar')
//   };
//
//   var jsonResponseHandler = function (data, status, xhr) {
//     var shipImage = "<img src='" + data.imagePath + "' height=100/>";
//
//     $("#appendShipHere").append(shipImage);
//
//     // setTimeout(secondHandler, 1000);
//   };
//
//   var jsonGetterFn = function () {
//     $.getJSON('http://localhost:3004/javascripts/sample.json', jsonResponseHandler);
//   };
//
//   $("#test4").click(jsonGetterFn);
// }
//
// jsonB();


function scenario() {
  $("#test1").click(function () {
    var $effect1 = $("#effect1");
    $effect1.toggleClass("hidden");
  });
}

scenario();


$("#test2").click(function () {
  var $effect2 = $("#effect2");
  $effect2.empty();
  var currentMoment = moment().format('MMMM Do YYYY, h:mm:ss.S a');
  $effect2.append("<p>" + currentMoment + "</p>");
});


$("#test3").click(function () {
  var $effect3 = $("#effect3");

  if ($effect3.is(":visible")) {
    $effect3.hide("slow");
  } else {
    $effect3.show("slow");
  }
});
