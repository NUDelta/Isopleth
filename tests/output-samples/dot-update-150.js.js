    var n = window.setInterval(function () {
     e--;
     t.find("h1").html(e);
     if (0 === e) {
      clearInterval(n);
      u = null;
      t.css({
       display: "none"
      });
      y(100 * r + 900);
      return;
     }
    }, 1e3);
    u = window.setInterval(function () {
     var n = Date.now();
     var i = Math.round(.1 * (n - t));
     e -= i;
     t = n;
     $("#timer").html(m(e));
     if (e <= 0) {
      clearInterval(u);
      u = null;
      $("#retry").css({
       display: "block"
      }).off().on("click", function () {
       c(r, a, p, false);
      });
      $("#timer").css({
       display: "none"
      });
      return;
     }
    }, 1e3 / 100);
