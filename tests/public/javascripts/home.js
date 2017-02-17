function load() {
  var testElement = document.getElementById("test1");
  var photoEl = document.getElementById("effect1");

  var eventHandlerFn = function () {
    if (photoEl.classList) {
      photoEl.classList.toggle("hidden");
    }
  };

  testElement.addEventListener("click", eventHandlerFn);
}

load();


function other() {
  var button2 = document.getElementById("test3");
  var shipEl = document.getElementById("effect3");

  var eventHandlerFn = function () {
    if (shipEl.classList) {
      shipEl.classList.toggle("hidden");
    }
  };

  button2.addEventListener("click", eventHandlerFn);
}

other();
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