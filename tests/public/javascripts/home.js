var scenario2 = function () {
  $("#test1").click(function () {
    var $effect1 = $("#effect1");
    if ($effect1.is(":visible")) {
      $effect1.hide();
    } else {
      $effect1.show();
    }
  });

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
};


scenario2();