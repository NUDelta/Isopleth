DOT.core = function () {
 var e = $("body"),
  t = $("html"),
  n = $(".content"),
  r = $("#svg"),
  i = Raphael("svg", $(window).innerWidth(), $(window).innerHeight()),
  s = .4,
  o = .9,
  u = null,
  a = 0,
  f = new SFX(),
  l = 0,
  c = function (e, t, n, r) {
   if (e > 0) {
    $("#game").find(".active").removeClass("active");
    $("#progress").find("." + e).addClass("active");
    $("#game").find(".bg" + e).addClass("active");
    $(".dot").remove();
    $(".number").remove();
    for (var i = 0; i < n.length; i++) {
     n[i].controls.remove();
     n[i].curve.remove();
    }
    if (!r) {
     $("#retry").css({
      display: "none"
     });
    }
   }
   switch (e) {
   case 0:
    break;
   case 1:
    if (r) {
     $("#start").css({
      display: "none"
     });
     $(".awards").css({
      display: "none"
     });
     $("#game").css({
      display: "block"
     });
    }
    break;
   case 2:
    break;
   case 3:
    break;
   case 4:
    break;
   case 5:
    break;
   case 6:
    var s = 2.273,
     o = Math.floor(1e3 * s),
     u = Math.floor(2e3 * s),
     a = Math.floor(3e3 * s),
     f = Math.floor(l * s),
     p = 1e-6 * (6e3 - Math.round(l)) + "",
     d = p.substr(2, 2) + ":" + p.substr(4, 2) + ":" + p.substr(6, 2);
    switch (true) {
    case f < o:
     $("#medal").attr("src", "img/img_end.png");
     $("#finish .score").html(f);
     $("#finish .play-time").html(d);
     $(".next-medal").show();
     $(".next-medal .points").html("+" + (o - f));
     break;
    case f < u:
     $("#medal").attr("src", "img/img_end-br.png");
     $("#finish .score").html(f);
     $("#finish .play-time").html(d);
     $("#finish .next-medal").show();
     $("#finish .next-medal .points").html("+" + (u - f));
     break;
    case f < a:
     $("#medal").attr("src", "img/img_end-si.png");
     $("#finish .score").html(f);
     $("#finish .play-time").html(d);
     $("#finish .next-medal").show();
     $("#finish .next-medal .points").html("+" + (a - f));
     break;
    case f >= a:
     $("#medal").attr("src", "img/img_end-go.png");
     $("#finish .score").html(f);
     $("#finish .play-time").html(d);
     $("#finish .next-medal").hide();
    }
    $("#game").css({
     display: "none"
    });
    $("#finish").css({
     display: "block"
    });
    $("#again").on("touchstart mouseup", function () {
     l = 0;
     $("#finish").css({
      display: "none"
     });
     $("#start").css({
      display: "block"
     });
     c(0);
     return;
    });
   }
   if (e < 6) {
    h(e);
   }
  },
  h = function (r) {
   var a = [],
    h = [],
    p = [],
    d = [
     [-130, 0, 130, 0],
     [212, -144, 177, -46, 107, -6, 34, 4, -23, 27, -10, -15, -107, -130, -178, -
      150, -132, -163, -115, -202, -85, -155
     ],
     [147, -197, 154, -145, 136, -80, 86, -21, 0, 0, -36, 33, -81, 38, -62, -9, -
      107, -32, -157, -87, -184, -152, -235, -164, -222, -219, -188, -193, -
      166, -234, -136, -197, -147, -150, -92, -138
     ],
     [-244, -175, -230, -86, -194, -29, -133, 5, -43, 5, -15, 18, 25, 21, 25, -
      20, 76, -42, 123, -66, 171, -101, 206, -130, 249, -109, 296, -118, 267, -
      143, 230, -162, 262, -194, 270, -234, 226, -221, 199, -197, 187, -154
     ],
     [240, -20, 100, -13, 55, 30, 56, -12, 10, 30, 19, -14, -234, -13, -276, -
      84, -312, -87, -346, -128, -293, -125, -257, -113, -227, -125, -170, -
      135, -209, -88, -242, -80, -203, -47, -141, -85, -55, -170, 41, -209,
      146, -208, 210, -175, 244, -105
     ],
     [-216, 0, -268, -75, -283, -146, -279, -203, -245, -218, -75, -191, 97, -
      152, 213, -145, 238, -164, 243, -205, 174, -222, 154, -249, 216, -252,
      245, -245, 269, -264, 332, -278, 313, -243, 278, -216, 300, -169, 302, -
      104, 275, -41, 208, 6, 152, 19, 173, 52, 129, 51, 80, 21, -7, 6, -110, 5
     ]
    ];
   var v = function () {
    i.setSize($(window).innerWidth(), $(window).innerHeight());
    for (var t = 0; t < d[r].length; t += 2) {
     $(a[t / 2]).css({
      left: d[r][t] + e.width() / 2 - 12,
      top: d[r][t + 1] + e.height() / 2 - 12
     });
     $(h[t / 2]).css({
      left: d[r][t] + e.width() / 2 - 12,
      top: d[r][t + 1] + e.height() / 2 - 27
     });
    }
    for (t = 0; t < p.length; t++) {
     if (p[t].loop) {
      window.clearInterval(p[t].loop);
     }
     p[t].curve.remove();
     p[t].controls.remove();
    }
    $(a).removeClass("full");
    p = [];
   };
   $(window).resize(function () {
    v();
   });
   var m = function (e) {
    var t = e.toString();
    while (t.length < 4) {
     t = "0" + t;
    }
    var n = t.substr(0, 2) + ":" + t.substr(2, 2);
    return n;
   };
   var g = function () {
    var e = 3,
     t = $("#countdown");
    t.css({
     display: "block"
    });
    t.find("h1").html(e);
    $("#timer").html(m(100 * r + 900)).css({
     display: "block"
    });
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
   };
   var y = function (e) {
    var t = Date.now();
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
   };
   var b = function () {
    for (var t = 0; t < d[r].length; t += 2) {
     var i = $("<div/>", {
      class: "dot"
     }).css({
      position: "absolute",
      left: d[r][t] + e.width() / 2 - 12,
      top: d[r][t + 1] + e.height() / 2 - 12
     });
     a.push(i[0]);
     var s = $("<div/>", {
      class: "number",
      html: a.length
     }).css({
      position: "absolute",
      left: d[r][t] + e.width() / 2 - 12,
      top: d[r][t + 1] + e.height() / 2 - 27
     });
     h.push(s[0]);
    }
    var o = 0;
    var u = window.setInterval(function () {
     if (o > a.length - 1) {
      clearInterval(u);
      return;
     }
     n.append(a[o]);
     n.append(h[o]);
     o++;
     f.pop();
    }, 1e3 / 15);
    w();
   };
   var w = function () {
    var n = function (e, t, n, r, s, o, u) {
     var a = {
      path: [
       ["M", e, t],
       ["Q", n, r, s, o]
      ],
      curve: i.path(this.path).attr({
       stroke: u,
       "stroke-width": 10,
       "stroke-linecap": "round"
      }),
      controls: i.set(i.circle(e, t, 5).attr({
       fill: "#fff",
       stroke: "none"
      }), i.circle(n, r, 5).attr({
       fill: "none",
       stroke: "none"
      }), i.circle(s, o, 5).attr({
       fill: "none",
       stroke: "none"
      })),
      elastic: {
       currentX: e,
       currentY: t,
       targetX: e,
       targetY: t,
       vX: 0,
       vY: 0
      },
      startDot: null,
      endDot: null,
      correct: false,
      loop: null
     };
     return a;
    };
    var u = function (n, i, s, o) {
     var u = p.length - 1;
     $(a).off("mouseover");
     e.off();
     $(document).off();
     if (true === n) {
      var f = p[u],
       c = $(a[s]).position().left + 12,
       h = $(a[s]).position().top + 12;
      f.controls[2].attr({
       cx: c,
       cy: h
      });
      f.path[1][3] = c;
      f.path[1][4] = h;
      f.elastic.targetX = f.controls[0].attr("cx") + 1 * (c - f.controls[0].attr(
       "cx")) / 2;
      f.elastic.targetY = f.controls[0].attr("cy") + 1 * (h - f.controls[0].attr(
       "cy")) / 2;
      var d = p[u].loop;
      window.setTimeout(function () {
       window.clearInterval(d);
      }, 4e3);
      f.correct = s - i === 1 || s - i === 1 - a.length ? true : false;
      if (p.length === a.length || 0 === r) {
       var v = true;
       for (var m = 0; m < p.length; m++) {
        if (!p[m].correct) {
         v = false;
        }
       }
       if (v) {
        E();
        return false;
       }
      }
      if (t.hasClass("touch")) {
       l(a[s], o);
      } else {
       $(a[s]).trigger("mousedown");
      }
     } else {
      $(a[i]).removeClass("full");
      window.clearInterval(p[u].loop);
      p[p.length - 1].curve.remove();
      p[p.length - 1].controls.remove();
      p.splice(p.length - 1, 1);
     }
    };
    var l = function (t) {
     $(t).addClass("full");
     f.pop();
     var r = -1;
     for (var i = 0; i < p.length; i++) {
      if (p[i].startDot === a.indexOf(t)) {
       r = i;
      }
     }
     if (r >= 0) {
      if (p[r].loop) {
       window.clearInterval(p[r].loop);
      }
      p[r].curve.remove();
      p[r].controls.remove();
      p.splice(r, 1);
     }
     p.push(n($(t).position().left + 12, $(t).position().top + 12, $(t).position()
      .left + 12, $(t).position().top + 12, $(t).position().left + 12, $(t)
      .position().top + 12, "#e1f6f1"));
     var l = p[p.length - 1];
     l.startDot = a.indexOf(t);
     e.on("touchmove", function (e) {
      e.preventDefault();
      var n = e.originalEvent.changedTouches[0].pageX,
       r = e.originalEvent.changedTouches[0].pageY;
      l.controls[2].attr({
       cx: n,
       cy: r
      });
      l.path[1][3] = n;
      l.path[1][4] = r;
      l.elastic.targetX = l.controls[0].attr("cx") + 1 * (n - l.controls[0]
       .attr("cx")) / 2;
      l.elastic.targetY = l.controls[0].attr("cy") + 1 * (r - l.controls[0]
       .attr("cy")) / 2;
      if (!l.loop) {
       l.loop = window.setInterval(function () {
        var e = l.elastic;
        e.vX += (e.targetX - e.currentX) * s;
        e.currentX += e.vX *= o;
        e.vY += (e.targetY - e.currentY) * s;
        e.currentY += e.vY *= o;
        l.controls[1].attr({
         cx: e.currentX,
         cy: e.currentY
        });
        l.path[1][1] = e.currentX;
        l.path[1][2] = e.currentY;
        l.curve.attr({
         path: l.path
        });
       }, 1e3 / 30);
      }
      $(a).each(function (e, i) {
       if (a.indexOf(t) !== a.indexOf(i)) {
        var s = $(i).position().left,
         o = $(i).position().top;
        if (n > s && r > o && n < s + 24 && r < o + 24) {
         u(true, a.indexOf(t), a.indexOf(i));
        }
       }
      });
     });
     e.on("touchend", function (e) {
      e.preventDefault();
      u(false, a.indexOf(t));
     });
    };
    if (t.hasClass("touch")) {
     $(a).each(function (e, t) {
      $(t).on("touchstart", function (e) {
       e.preventDefault();
       l(t);
      });
     });
    } else {
     $(a).each(function (t, r) {
      $(r).on("mousedown", function (t) {
       $(r).addClass("full");
       f.pop();
       var i = -1;
       for (var l = 0; l < p.length; l++) {
        if (p[l].startDot === a.indexOf(this)) {
         i = l;
        }
       }
       if (i >= 0) {
        if (p[i].loop) {
         window.clearInterval(p[i].loop);
        }
        p[i].curve.remove();
        p[i].controls.remove();
        p.splice(i, 1);
       }
       p.push(n($(r).position().left + 12, $(r).position().top + 12, t.pageX,
        t.pageY, t.pageX, t.pageY, "#e1f6f1"));
       var c = p[p.length - 1];
       c.startDot = a.indexOf(this);
       e.on("mousemove", function (e) {
        var t = e.pageX,
         n = e.pageY;
        c.controls[2].attr({
         cx: t,
         cy: n
        });
        c.path[1][3] = t;
        c.path[1][4] = n;
        c.elastic.targetX = c.controls[0].attr("cx") + 1 * (t - c.controls[
         0].attr("cx")) / 2;
        c.elastic.targetY = c.controls[0].attr("cy") + 1 * (n - c.controls[
         0].attr("cy")) / 2;
        if (!c.loop) {
         c.loop = window.setInterval(function () {
          var e = c.elastic;
          e.vX += (e.targetX - e.currentX) * s;
          e.currentX += e.vX *= o;
          e.vY += (e.targetY - e.currentY) * s;
          e.currentY += e.vY *= o;
          c.controls[1].attr({
           cx: e.currentX,
           cy: e.currentY
          });
          c.path[1][1] = e.currentX;
          c.path[1][2] = e.currentY;
          c.curve.attr({
           path: c.path
          });
         }, 1e3 / 30);
        }
       });
       $(a).on("mouseover", function () {
        if (a.indexOf(r) !== a.indexOf(this)) {
         u(true, a.indexOf(r), a.indexOf(this));
        }
       });
       e.on("mouseup", function () {
        u(false, a.indexOf(r));
       });
       $(document).on("mouseout", function (e) {
        e = e ? e : window.event;
        var t = e.relatedTarget || e.toElement;
        if (!t || "HTML" == t.nodeName) {
         u(false, a.indexOf(r));
        }
       });
      });
     });
    }
   };
   var E = function () {
    f.pop();
    if (u || 0 === r) {
     if (0 === r) {
      c(r + 1, a, p, true);
     } else {
      var e = parseInt($("#timer").html().split(":").join(""));
      l += e;
      window.clearInterval(u);
      u = null;
      $("#nice").css({
       display: "block"
      });
      setTimeout(function () {
       $("#nice").css({
        display: "none"
       });
       c(r + 1, a, p, true);
      }, 2e3);
     }
    }
   };
   b();
   if (r > 0) {
    g();
   }
  },
  p = function () {
   var e = function (e) {
    var t = parseInt(100 * e);
    loadVal = t;
   };
   var t = ["img/img_dot.png", "img/img_dot-full.png", "img/img_end.png",
    "img/img_end-br.png", "img/img_end-si.png", "img/img_end-go.png",
    "img/img_retry.png", "img/img_play-again.png"
   ];
   Preloader.initialize(t, null, e);
  };
 return {
  init: function () {
   p();
   c(0);
   $(window).load(function () {
    $(".content, footer").removeClass("hide");
   });
   $(document).on("touchmove", function (e) {
    e.preventDefault();
   });
  }
 };
}();
