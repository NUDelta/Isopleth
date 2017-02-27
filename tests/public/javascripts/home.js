// function load() {
//   var testElement = document.getElementById("test1");
//   var photoEl = document.getElementById("effect1");
//
//   var eventHandlerFn = function () {
//     if (photoEl.classList) {
//       photoEl.classList.toggle("hidden");
//     }
//   };
//
//   testElement.addEventListener("click", eventHandlerFn);
// }
//
// load();
//
// function loadB() {
//   var button2 = document.getElementById("test3");
//   var shipEl = document.getElementById("effect3");
//
//   var eventHandlerFn = function () {
//     if (shipEl.classList) {
//       shipEl.classList.toggle("hidden");
//     }
//   };
//
//   button2.addEventListener("click", eventHandlerFn);
// }
//
// loadB();
//
// function jsonA() {
//   var button3 = document.getElementById("test4");
//   var request = new XMLHttpRequest();
//   var jsonResponseHandler = function () {
//     if (request.status >= 200 && request.status < 400) {
//       document.getElementById("jsonRes").innerText = request.responseText;
//     }
//   };
//
//   var jsonGetterFn = function () {
//     document.getElementById("jsonRes").innerText = "";
//     request.open('GET', 'http://localhost:3004/javascripts/sample.json', true);
//     request.onload = jsonResponseHandler;
//     request.send();
//   };
//
//   button3.addEventListener("click", jsonGetterFn);
// }
//
// jsonA();

function jsonB() {
  var jsonResponseHandler = function (data,status,xhr) {
    $("#jsonRes").text(JSON.stringify(data));
  };

  var jsonGetterFn = function () {
    $.getJSON('http://localhost:3004/javascripts/sample.json', jsonResponseHandler);
  };

  $("#test4").click(jsonGetterFn);
}

jsonB();





//
// function scenario() {
//   $("#test1").click(function () {
//     var $effect1 = $("#effect1");
//     $effect1.toggleClass("hidden");
//   });
// }
//
// scenario();

/*

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

 */