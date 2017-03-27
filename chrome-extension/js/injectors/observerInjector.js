define([],
  function () {
    return function () {
      window.unravelAgent.startObserving = function (cssPath) {
        return;

        MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

        window.unravelAgent.stopObserving();

        var emitThrottled = unravelAgent._.throttle(function () {
          // window.unravelAgent.stopObserving();
          // window.unravelAgent.emitHTMLSelect();
          // window.unravelAgent.startObserving();
        }, 3000);

        window.unravelAgent.observer = new MutationObserver(function (mutations, observer) {
          // var serializedMutations = window.unravelAgent._(mutations).map(function (mutation) {
          //   return {
          //     addedNodes: mutation.addedNodes ? window.unravelAgent._(mutation.addedNodes).map(function (node) {
          //       return node.outerHTML;
          //     }) : null,
          //     removedNodes: mutation.removedNodes ? window.unravelAgent._(mutation.removedNodes).map(function (node) {
          //       return node.outerHTML;
          //     }) : null,
          //     previousSibling: mutation.previousSibling ? mutation.previousSibling.outerHTML : null,
          //     nextSibling: mutation.nextSibling ? mutation.nextSibling.outerHTML : null,
          //     target: mutation.target ? mutation.target.outerHTML : null,
          //     path: window.unravelAgent.$(mutation.target).getPath(),
          //     attributeName: mutation.attributeName,
          //     attributeNamespace: mutation.attributeNamespace,
          //     oldValue: mutation.oldValue,
          //     type: mutation.type
          //   };
          // });
          // window.dispatchEvent(new CustomEvent("DOMObserve", {"detail": serializedMutations}));
          emitThrottled();
        });

        var $el = window.unravelAgent.$(cssPath || window.document);
        var observable = $el[0];

        window.unravelAgent.observer.observe(observable, {
          subtree: true,
          attributes: true,
          childList: true,
          characterData: true,
          // attributeOldValue: false,
          // characterDataOldValue: false
        });
      };

      window.unravelAgent.stopObserving = function () {
        return;
        if (window.unravelAgent.observer && window.unravelAgent.observer.disconnect) {
          window.unravelAgent.observer.disconnect();
        }
      };
    };
  });
