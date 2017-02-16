define([
  "../injectors/jQueryInjector",
  "../injectors/underscoreInjector",
  "../injectors/observerInjector",
  "../injectors/siteSwapInjector",
  "../injectors/fondueInjector",
  "../injectors/whittleInjector",
  "../injectors/introJSInjector",
  "../injectors/introJSBridgeInjector",
  "../injectors/highlightJSInjector",
  "../injectors/html2canvasInjector"
], function (jQueryInjector,
             underscoreInjector,
             observerInjector,
             siteSwapInjector,
             fondueInjector,
             whittleInjector,
             introJSInjector,
             introJSBridgeInjector,
             highlightJSInjector,
             html2canvasInjector) {
  function UnravelAgent() {
    if (!(this instanceof UnravelAgent)) {
      throw new TypeError("UnravelAgent constructor cannot be called as a function.");
    }
  }

  UnravelAgent.reloadInjecting = function () {
    var agentFn = function () {
      window.unravelAgent = {};
    };

    var goFondue = function () {
      unravelAgent.$().ready(function () {
        unravelAgent.reWritePage();
      });
    };

    //Order is important here
    var start = "if (window.self === window.top) {";
    var f1 = "(" + agentFn.toString() + ").apply(this, []); ";
    var f2 = "(" + jQueryInjector.toString() + ").apply(this, []); ";
    var f3 = "(" + underscoreInjector.toString() + ").apply(this, []); ";
    var f5 = "(" + siteSwapInjector.toString() + ").apply(this, []); ";
    var f6 = "(" + observerInjector.toString() + ").apply(this, []); ";
    var f7 = "(" + fondueInjector.toString() + ").apply(this, []); ";
    var f8 = "(" + whittleInjector.toString() + ").apply(this, []); ";
    var f9 = "(" + introJSInjector.toString() + ").apply(this, []); ";
    var f10 = "(" + highlightJSInjector.toString() + ").apply(this, []); ";
    var f11 = "(" + introJSBridgeInjector.toString() + ").apply(this, []); ";
    var f12 = "(" + html2canvasInjector.toString() + ").apply(this, []); ";
    var f13 = "(" + goFondue.toString() + ").apply(this, []); ";
    var end = " } ";

    chrome.devtools.inspectedWindow.reload({
      ignoreCache: true,
      injectedScript: start + f1 + f2 + f3 + f5 + f6 + f7 + f8 + f9 + f10 + f11 + f12 + f13 + end
    });

    var checkTimeout = function (isActive) {
      if (isActive) {
        window.location.href = "";
      } else {
        window.setTimeout(function () {
          UnravelAgent.checkActive(checkTimeout)
        }, 1000);
      }
    };

    checkTimeout(false);
  };

  //public static
  UnravelAgent.checkActive = function (callback) {
    UnravelAgent.runInPage(function () {
      return !!window.unravelAgent;
    }, callback);
  };

  UnravelAgent.runInPage = function (fn, callback) {
    var args = Array.prototype.slice.call(arguments, 2);
    var evalCode = "(" + fn.toString() + ").apply(this, " + JSON.stringify(args) + ");";
    chrome.devtools.inspectedWindow.eval(evalCode, {}, callback);
  };

  UnravelAgent.prototype = {
    //instance methods
    constructor: UnravelAgent,

    isInjecting: false
  };

  return UnravelAgent;
});