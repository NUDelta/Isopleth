   function d(a, b, c, d) {
    var g = e(c.substr(c.lastIndexOf(a.domain)), a);
    g && f({
     mode: null,
     el: d,
     flags: g,
     engineSettings: b
    });
   }
   function f(a) {
    var b = a.mode,
     c = a.el,
     d = a.flags,
     e = a.engineSettings,
     f = d.dimensions,
     h = d.theme,
     i = f.width + "x" + f.height;
    if (b = null == b ? d.fluid ? "fluid" : "image" : b, null != d.text &&
     (h.text = d.text, "object" === c.nodeName.toLowerCase())) {
     for (var l = h.text.split("\\n"), m = 0; m < l.length; m++) {
      l[m] = A(l[m]);
     }
     h.text = l.join("\\n");
    }
    var n = d.holderURL,
     o = y(e, null);
    if (d.font && (h.font = d.font, !o.noFontFallback && "img" === c.nodeName
      .toLowerCase() && K.setup.supportsCanvas && "svg" === o.renderer &&
      (o = y(o, {
       renderer: "canvas"
      }))), d.font && "canvas" == o.renderer && (o.reRender = !0),
     "background" == b) {
     null == c.getAttribute("data-background-src") && p(c, {
      "data-background-src": n
     });
    } else {
     var q = {};
     q[K.vars.dataAttr] = n, p(c, q);
    }
    d.theme = h, c.holderData = {
     flags: d,
     engineSettings: o
    }, ("image" == b || "fluid" == b) && p(c, {
     alt: h.text ? h.text + " [" + i + "]" : i
    });
    var r = {
     mode: b,
     el: c,
     holderSettings: {
      dimensions: f,
      theme: h,
      flags: d
     },
     engineSettings: o
    };
    "image" == b ? ("html" != o.renderer && d.auto || (c.style.width = f.width +
       "px", c.style.height = f.height + "px"), "html" == o.renderer ? c.style
      .backgroundColor = h.background : (g(r), "exact" == d.textmode && (c
       .holderData.resizeUpdate = !0, K.vars.resizableImages.push(c), j(c)
      ))) : "background" == b && "html" != o.renderer ? g(r) : "fluid" ==
     b && (c.holderData.resizeUpdate = !0, "%" == f.height.slice(-1) ? c.style
      .height = f.height : null != d.auto && d.auto || (c.style.height = f
       .height + "px"), "%" == f.width.slice(-1) ? c.style.width = f.width :
      null != d.auto && d.auto || (c.style.width = f.width + "px"), (
       "inline" == c.style.display || "" === c.style.display || "none" ==
       c.style.display) && (c.style.display = "block"), k(c), "html" == o.renderer ?
      c.style.backgroundColor = h.background : (K.vars.resizableImages.push(
       c), j(c)));
   }
   function g(a) {
    function c() {
     var b = null;
     switch (i.renderer) {
     case "canvas":
      b = M(k, a);
      break;
     case "svg":
      b = N(k, a);
      break;
     default:
      throw "Holder: invalid renderer: " + i.renderer;
     }
     return b;
    }
    var d = null,
     e = a.mode,
     f = a.holderSettings,
     g = a.el,
     i = a.engineSettings;
    switch (i.renderer) {
    case "svg":
     if (!K.setup.supportsSVG) {
      return;
     }
     break;
    case "canvas":
     if (!K.setup.supportsCanvas) {
      return;
     }
     break;
    default:
     return;
    }
    var j = {
      width: f.dimensions.width,
      height: f.dimensions.height,
      theme: f.theme,
      flags: f.flags
     },
     k = h(j);
    if (d = c(), null == d) {
     throw "Holder: couldn't render placeholder";
    }
    "background" == e ? (g.style.backgroundImage = "url(" + d + ")", g.style
     .backgroundSize = j.width + "px " + j.height + "px") : ("img" === g.nodeName
     .toLowerCase() ? p(g, {
      src: d
     }) : "object" === g.nodeName.toLowerCase() && (p(g, {
      data: d
     }), p(g, {
      type: "image/svg+xml"
     })), i.reRender && b.setTimeout(function () {
      var a = c();
      if (null == a) {
       throw "Holder: couldn't render placeholder";
      }
      "img" === g.nodeName.toLowerCase() ? p(g, {
       src: a
      }) : "object" === g.nodeName.toLowerCase() && (p(g, {
       data: a
      }), p(g, {
       type: "image/svg+xml"
      }));
     }, 100)), p(g, {
     "data-holder-rendered": !0
    });
   }
   function h(a) {
    function b(a, b, c, d) {
     b.width = c, b.height = d, a.width = Math.max(a.width, b.width), a.height +=
      b.height,
      a.add(b);
    }
    var c = K.defaults.size;
    switch (parseFloat(a.theme.size) ? c = a.theme.size : parseFloat(a.flags
      .size) && (c = a.flags.size), a.font = {
      family: a.theme.font ? a.theme.font : "Arial, Helvetica, Open Sans, sans-serif",
      size: i(a.width, a.height, c),
      units: a.theme.units ? a.theme.units : K.defaults.units,
      weight: a.theme.fontweight ? a.theme.fontweight : "bold"
     }, a.text = a.theme.text ? a.theme.text : Math.floor(a.width) + "x" +
     Math.floor(a.height), a.flags.textmode) {
    case "literal":
     a.text = a.flags.dimensions.width + "x" + a.flags.dimensions.height;
     break;
    case "exact":
     if (!a.flags.exactDimensions) {
      break;
     }
     a.text = Math.floor(a.flags.exactDimensions.width) + "x" + Math.floor(
      a.flags.exactDimensions.height);
    }
    var d = new w({
      width: a.width,
      height: a.height
     }),
     e = d.Shape,
     f = new e.Rect("holderBg", {
      fill: a.theme.background
     });
    f.resize(a.width, a.height), d.root.add(f);
    var g = new e.Group("holderTextGroup", {
     text: a.text,
     align: "center",
     font: a.font,
     fill: a.theme.foreground
    });
    g.moveTo(null, null, 1), d.root.add(g);
    var h = g.textPositionData = L(d);
    if (!h) {
     throw "Holder: staging fallback not supported yet.";
    }
    g.properties.leading = h.boundingBox.height;
    var j = null,
     k = null;
    if (h.lineCount > 1) {
     var l = 0,
      m = 0,
      n = a.width * K.setup.lineWrapRatio,
      o = 0;
     k = new e.Group("line" + o);
     for (var p = 0; p < h.words.length; p++) {
      var q = h.words[p];
      j = new e.Text(q.text);
      var r = "\\n" == q.text;
      (l + q.width >= n || r === !0) && (b(g, k, l, g.properties.leading),
       l = 0, m += g.properties.leading, o += 1, k = new e.Group("line" +
        o), k.y = m), r !== !0 && (j.moveTo(l, 0), l += h.spaceWidth + q.width,
       k.add(j));
     }
     b(g, k, l, g.properties.leading);
     for (var s in g.children) {
      k = g.children[s], k.moveTo((g.width - k.width) / 2, null, null);
     }
     g.moveTo((a.width - g.width) / 2, (a.height - g.height) / 2, null), (
      a.height - g.height) / 2 < 0 && g.moveTo(null, 0, null);
    } else {
     j = new e.Text(a.text), k = new e.Group("line0"), k.add(j), g.add(k),
      g.moveTo((a.width - h.boundingBox.width) / 2, (a.height - h.boundingBox
       .height) / 2, null);
    }
    return d;
   }
   function q(a, b, c) {
    var d, e;
    null == a ? (a = o("svg", F), d = o("defs", F), e = o("style", F), p(e, {
      type: "text/css"
     }), d.appendChild(e), a.appendChild(d)) : e = a.querySelector("style"),
     a.webkitMatchesSelector && a.setAttribute("xmlns", F);
    for (var f = 0; f < a.childNodes.length; f++) {
     a.childNodes[f].nodeType === G && a.removeChild(a.childNodes[f]);
    }
    for (; e.childNodes.length;) {
     e.removeChild(e.childNodes[0]);
    }
    return p(a, {
     width: b,
     height: c,
     viewBox: "0 0 " + b + " " + c,
     preserveAspectRatio: "none"
    }), a;
   }
     run: function (a) {
      a = a || {};
      var c = {},
       g = y(K.settings, a);
      K.vars.preempted = !0, K.vars.dataAttr = g.dataAttr || K.vars.dataAttr,
       c.renderer = g.renderer ? g.renderer : K.setup.renderer, -1 === K.setup
       .renderers.join(",").indexOf(c.renderer) && (c.renderer = K.setup.supportsSVG ?
        "svg" : K.setup.supportsCanvas ? "canvas" : "html");
      var h = D(g.images),
       i = D(g.bgnodes),
       j = D(g.stylenodes),
       k = D(g.objects);
      c.stylesheets = [], c.svgXMLStylesheet = !0, c.noFontFallback = g.noFontFallback ?
       g.noFontFallback : !1;
      for (var l = 0; l < j.length; l++) {
       var m = j[l];
       if (m.attributes.rel && m.attributes.href && "stylesheet" == m.attributes
        .rel.value) {
        var n = m.attributes.href.value,
         p = o("a");
        p.href = n;
        var q = p.protocol + "//" + p.host + p.pathname + p.search;
        c.stylesheets.push(q);
       }
      }
      for (l = 0; l < i.length; l++) {
       if (b.getComputedStyle) {
        var r = b.getComputedStyle(i[l], null).getPropertyValue(
          "background-image"),
         s = i[l].getAttribute("data-background-src"),
         t = null;
        t = null == s ? r : s;
        var u = null,
         v = "?" + g.domain + "/";
        if (0 === t.indexOf(v)) {
         u = t.slice(1);
        } else {
         if (-1 != t.indexOf(v)) {
          var w = t.substr(t.indexOf(v)).slice(1),
           x = w.match(/([^\"]*)"?\)/);
          null != x && (u = x[1]);
         }
        }
        if (null != u) {
         var z = e(u, g);
         z && f({
          mode: "background",
          el: i[l],
          flags: z,
          engineSettings: c
         });
        }
       }
      }
      for (l = 0; l < k.length; l++) {
       var A = k[l],
        B = {};
       try {
        B.data = A.getAttribute("data"), B.dataSrc = A.getAttribute(K.vars
         .dataAttr);
       } catch (E) {}
       var F = null != B.data && 0 === B.data.indexOf(g.domain),
        G = null != B.dataSrc && 0 === B.dataSrc.indexOf(g.domain);
       F ? d(g, c, B.data, A) : G && d(g, c, B.dataSrc, A);
      }
      for (l = 0; l < h.length; l++) {
       var H = h[l],
        I = {};
       try {
        I.src = H.getAttribute("src"), I.dataSrc = H.getAttribute(K.vars.dataAttr),
         I.rendered = H.getAttribute("data-holder-rendered");
       } catch (E) {}
       var J = null != I.src,
        L = null != I.dataSrc && 0 === I.dataSrc.indexOf(g.domain),
        M = null != I.rendered && "true" == I.rendered;
       J ? 0 === I.src.indexOf(g.domain) ? d(g, c, I.src, H) : L && (M ?
        d(g, c, I.dataSrc, H) : ! function (a, b, c, e, f) {
         C(a, function (a) {
          a || d(b, c, e, f);
         });
        }(I.src, g, c, I.dataSrc, H)) : L && d(g, c, I.dataSrc, H);
      }
      return this;
     }
     return function (d) {
      var e = d.root;
      if (K.setup.supportsSVG) {
       var f = !1,
        g = function (a) {
         return document.createTextNode(a);
        };
       (null == a || a.parentNode !== document.body) && (f = !0), a = q(a,
         e.properties.width, e.properties.height),
        a.style.display = "block", f && (b = o("text", F), c = g(null), p(
          b, {
           x: 0
          }), b.appendChild(c), a.appendChild(b), document.body.appendChild(
          a), a.style.visibility = "hidden", a.style.position =
         "absolute", a.style.top = "-100%", a.style.left = "-100%");
       var h = e.children.holderTextGroup,
        i = h.properties;
       p(b, {
        y: i.font.size,
        style: z({
         "font-weight": i.font.weight,
         "font-size": i.font.size + i.font.units,
         "font-family": i.font.family
        })
       }), c.nodeValue = i.text;
       var j = b.getBBox(),
        k = Math.ceil(j.width / (e.properties.width * K.setup.lineWrapRatio)),
        l = i.text.split(" "),
        m = i.text.match(/\\n/g);
       k += null == m ? 0 : m.length, c.nodeValue = i.text.replace(
        /[ ]+/g, "");
       var n = b.getComputedTextLength(),
        r = j.width - n,
        s = Math.round(r / Math.max(1, l.length - 1)),
        t = [];
       if (k > 1) {
        c.nodeValue = "";
        for (var u = 0; u < l.length; u++) {
         if (0 !== l[u].length) {
          c.nodeValue = B(l[u]);
          var v = b.getBBox();
          t.push({
           text: l[u],
           width: v.width
          });
         }
        }
       }
       return a.style.display = "none", {
        spaceWidth: s,
        lineCount: k,
        boundingBox: j,
        words: t
       };
      }
      return !1;
     };
       function (b, e) {
        var f = b.root;
        q(c, f.properties.width, f.properties.height);
        for (var g = c.querySelectorAll("g"), h = 0; h < g.length; h++) {
         g[h].parentNode.removeChild(g[h]);
        }
        var i = e.holderSettings.flags.holderURL,
         j = "holder_" + (Number(new Date()) + 32768 + (0 | 32768 * Math.random()))
         .toString(16),
         k = o("g", F),
         l = f.children.holderTextGroup,
         m = l.properties,
         n = o("g", F),
         s = l.textPositionData,
         t = "#" + j + " text { " + z({
          fill: m.fill,
          "font-weight": m.font.weight,
          "font-family": m.font.family + ", monospace",
          "font-size": m.font.size + m.font.units
         }) + " } ",
         u = a.createComment("\nSource URL: " + i + I),
         v = a.createCDATASection(t),
         w = c.querySelector("style");
        p(k, {
          id: j
         }), c.insertBefore(u, c.firstChild), w.appendChild(v), k.appendChild(
          d), k.appendChild(n),
         c.appendChild(k), p(d, {
          width: f.children.holderBg.width,
          height: f.children.holderBg.height,
          fill: f.children.holderBg.properties.fill
         }), l.y += .8 * s.boundingBox.height;
        for (var x in l.children) {
         var y = l.children[x];
         for (var A in y.children) {
          var B = y.children[A],
           C = l.x + y.x + B.x,
           D = l.y + y.y + B.y,
           E = o("text", F),
           G = document.createTextNode(null);
          p(E, {
           x: C,
           y: D
          }), G.nodeValue = B.properties.text, E.appendChild(G), n.appendChild(
           E);
         }
        }
        var H = "data:image/svg+xml;base64," + btoa(unescape(
         encodeURIComponent(r(c, e.engineSettings))));
        return H;
       };
    }(), m(), v && v(function () {
     K.vars.preempted || J.run(), b.addEventListener ? (b.addEventListener(
       "resize", u, !1), b.addEventListener("orientationchange", u, !1)) :
      b.attachEvent("onresize", u), "object" == typeof b.Turbolinks && b.document
      .addEventListener("page:change", function () {
       J.run();
      });
    }), a.exports = J;
   }, b.getNodeArray = function (b) {
    var c = null;
    return "string" == typeof b ? c = document.querySelectorAll(b) : a.NodeList &&
     b instanceof a.NodeList ? c = b : a.Node && b instanceof a.Node ? c = [
      b
     ] : a.HTMLCollection && b instanceof a.HTMLCollection ? c = b : b instanceof Array ?
     c = b : null === b && (c = []),
     c;
   }, b.imageExists = function (a, b) {
 function b(b) {
  return this.each(function () {
   var d = a(this),
    e = d.data("bs.carousel"),
    f = a.extend({}, c.DEFAULTS, d.data(), "object" == typeof b && b),
    g = "string" == typeof b ? b : f.slide;
   e || d.data("bs.carousel", e = new c(this, f)), "number" == typeof b ? e.to(
    b) : g ? e[g]() : f.interval && e.pause().cycle();
  });
 }
 var c = function (b, c) {
  this.$element = a(b), this.$indicators = this.$element.find(
    ".carousel-indicators"),
   this.options = c, this.paused = null, this.sliding = null, this.interval =
   null,
   this.$active = null, this.$items = null, this.options.keyboard && this.$element
   .on("keydown.bs.carousel", a.proxy(this.keydown, this)), "hover" == this.options
   .pause && !("ontouchstart" in document.documentElement) && this.$element.on(
    "mouseenter.bs.carousel", a.proxy(this.pause, this)).on(
    "mouseleave.bs.carousel", a.proxy(this.cycle, this));
 };
 }, c.prototype.pause = function (b) {
  return b || (this.paused = !0), this.$element.find(".next, .prev").length &&
   a.support.transition && (this.$element.trigger(a.support.transition.end),
    this.cycle(!0)), this.interval = clearInterval(this.interval), this;
 }, c.prototype.next = function () {
  if (!this.sliding) {
   return this.slide("next");
  }
 }, c.prototype.prev = function () {
 }, c.prototype.slide = function (b, d) {
  var e = this.$element.find(".item.active"),
   f = d || this.getItemForDirection(b, e),
   g = this.interval,
   h = "next" == b ? "left" : "right",
   i = this;
  if (f.hasClass("active")) {
   return this.sliding = !1;
  }
  var j = f[0],
   k = a.Event("slide.bs.carousel", {
    relatedTarget: j,
    direction: h
   });
  if (this.$element.trigger(k), !k.isDefaultPrevented()) {
   if (this.sliding = !0, g && this.pause(), this.$indicators.length) {
    this.$indicators.find(".active").removeClass("active");
    var l = a(this.$indicators.children()[this.getItemIndex(f)]);
    l && l.addClass("active");
   }
   var m = a.Event("slid.bs.carousel", {
    relatedTarget: j,
    direction: h
   });
   return a.support.transition && this.$element.hasClass("slide") ? (f.addClass(
     b), f[0].offsetWidth, e.addClass(h), f.addClass(h), e.one(
     "bsTransitionEnd",
     function () {
      f.removeClass([b, h].join(" ")).addClass("active"), e.removeClass([
        "active", h
       ].join(" ")),
       i.sliding = !1, setTimeout(function () {
        i.$element.trigger(m);
       }, 0);
     }).emulateTransitionEnd(c.TRANSITION_DURATION)) : (e.removeClass("active"),
     f.addClass("active"), this.sliding = !1, this.$element.trigger(m)), g &&
    this.cycle(), this;
  }
 };
  a(window).on("load", function () {
   a('[data-ride="carousel"]').each(function () {
    var c = a(this);
    b.call(c, c.data());
   });
  });
  }, a(window).on("load.bs.scrollspy.data-api", function () {
   a('[data-spy="scroll"]').each(function () {
    var b = a(this);
    c.call(b, b.data());
   });
  });
 }, a(window).on("load", function () {
  a('[data-spy="affix"]').each(function () {
   var c = a(this),
    d = c.data();
   d.offset = d.offset || {}, null != d.offsetBottom && (d.offset.bottom =
     d.offsetBottom),
    null != d.offsetTop && (d.offset.top = d.offsetTop), b.call(c, d);
  });
 });
