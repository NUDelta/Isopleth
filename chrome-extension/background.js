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

let blockedHeaders = [
  "content-security-policy",
  "x-webkit-csp",
  "Content-Security-Policy",
  "Public-Key-Pins",
  "X-XSS-Protection",
  "X-Content-Type-Options",
  "Strict-Transport-Security",
];

function modifyCspHeaders(details) {
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