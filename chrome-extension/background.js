/*
 The background is shared between the browser panes. This fosters
 communication between the contentscript injected in the web page
 your extension panel's javascript.
 */

// Hash <panel tab id, panel commmunication port>
var panelPorts = {};
var requestRedirecting = false;
var thisOrigin = "";
var redirectingOrigin = "none";

// Receive handshake requests from extension panels and store their ports
chrome.extension.onConnect.addListener(function (port) {
  if (port.name !== "devtoolspanel") return;

  port.onMessage.addListener(function (message) {
    if (message.name == "identification") {
      var tabId = message.data;

      //Assign the port to a tab identifier
      panelPorts[tabId] = port;
    }
  });
});

// Listen for messages from contentscript in the web page and send them over the port from above
chrome.extension.onMessage.addListener(function (message, sender, sendResponse) {
  if (sender.tab) {
    //Get the right port for the panel you want
    var port = panelPorts[sender.tab.id];
    if (port) {
      if (message.name && message.name === "UnravelRedirectRequests") {
        if (message.data && message.data.redirecting === true) {
          requestRedirecting = true;
          redirectingOrigin = message.data.origin;
        } else if (message.data && message.data.contentScript) {
          requestRedirecting = message.data.redirecting;
          thisOrigin = message.data.origin;
        } else {
          requestRedirecting = false;
          redirectingOrigin = "";
        }
      } else {
        //Send the message to the panel
        port.postMessage(message);
      }
    }
  }
});

chrome.tabs.onUpdated.addListener(function (updatedTabId, changeInfo) {
  // the event is emitted a second time when the update is complete, but we only need the first one.
  if (changeInfo.status == 'loading') {
    var port = panelPorts[updatedTabId];
    if (port) {
      var urlChanged = changeInfo.url !== undefined;

      if (urlChanged) {
        requestRedirecting = false;
      }

      port.postMessage({
        target: 'page',
        name: 'TabUpdate',
        data: {
          urlChanged: changeInfo.url !== undefined
        }
      });
    }
  }
});

// var augmentRule = function (policy, separator, policyAddition, secondAddition) {
//   var sources = policy.split(separator)[1];
//   secondAddition = secondAddition || "";
//   sources = policyAddition + secondAddition + sources;
//   return [policy.split(separator)[0], separator, sources].join("");
// };


// Alter page security policy headers to allow localhost to communicate with the page externally
//http://www.html5rocks.com/en/tutorials/security/content-security-policy/
// chrome.webRequest.onHeadersReceived.addListener(function (details) {
//   if (details.method == "GET") {
//     details.responseHeaders.forEach(function (v, i, a) {
//       if (v.name == "content-security-policy") {
//
//         if (v.value) {
//           if (v.value.indexOf("script-src") > -1) {
//             v.value = augmentRule(v.value, "script-src", " https://localhost:3001 ", "'unsafe-inline'");
//           }
//
//           if (v.value.indexOf("connect-src") > -1) {
//             v.value = augmentRule(v.value, "connect-src", " https://localhost:3001 ");
//           }
//
//           var rules = v.value.split(" ");
//           rules.forEach(function (val, i, arr) {
//             if (val.indexOf("nonce") > -1) {
//               arr[i] = "";
//             }
//           });
//
//           v.value = rules.join(" ");
//         }
//
//       }
//     });
//     return {responseHeaders: details.responseHeaders};
//   }
// }, {urls: ["<all_urls>"]}, ["responseHeaders", "blocking"]);


// @see https://developer.mozilla.org/en-US/docs/Web/Security/CSP
let cspHeaders = [
  'content-security-policy',
  'x-webkit-csp'
];

// @see https://developer.mozilla.org/en-US/docs/Web/Security/CSP/CSP_policy_directives
let cspSources = [
  'connect-src',
  'default-src',
  'font-src',
  'frame-src',
  'img-src',
  'media-src',
  'object-src',
  'script-src',
  'style-src'
];

let blockedHeaders = [
  // "X-Frame-Options",
  "Content-Security-Policy",
  "Public-Key-Pins",
  "X-XSS-Protection",
  "X-Content-Type-Options",
  "Strict-Transport-Security",
  // "X-UA-Compatible",
];

function isCspHeader(headerName) {
  return cspHeaders.includes(headerName.toLowerCase());
}

function modifyCspHeaders(details) {
  // details.responseHeaders.forEach((responseHeader) => {
    // if (responseHeader.name === "Age") {
    //   responseHeader.name = "script-src";
    //   responseHeader.value = "unsafe-eval";
    // }
    //
    // if (!isCspHeader(responseHeader.name)) {
    //   return;
    // }
    //
    // let csp = responseHeader.value;
    //
    // // Add example.com to the sources list.
    // // @see https://work.planbox.com/blog/development/coding/bypassing-githubs-content-security-policy-chrome-extension.html
    // cspSources.forEach((cspSource) => {
    //   csp = csp.replace(cspSource, cspSource + ' https://localhost http://localhost https://localhost:3001 http://localhost:3001');
    // });
    //
    // responseHeader.value = csp;
    //
    // if (blockedHeaders.includes(responseHeader.name)) {

    // }
  // });

  for (var i = 0; i < details.responseHeaders.length; i++) {
    if (blockedHeaders.includes(details.responseHeaders[i].name)) {
      details.responseHeaders.splice(i--, 1);
    }
  }

  return {responseHeaders: details.responseHeaders};
}

chrome.webRequest.onHeadersReceived.addListener(
  modifyCspHeaders,
  {
    urls: ['http://*/*', 'https://*/*'],
    types: ['main_frame']
  },
  ['blocking', 'responseHeaders']
);