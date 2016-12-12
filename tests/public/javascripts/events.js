function Event(name) {
  this.name = name;
  this.callbacks = [];
}
Event.prototype.registerCallback = function (callback) {
  this.callbacks.push(callback);
};

function Reactor() {
  this.events = {};
}

Reactor.prototype.registerEvent = function (eventName) {
  this.events[eventName] = new Event(eventName);
};

Reactor.prototype.dispatchEvent = function (eventName, eventArgs) {
  this.events[eventName].callbacks.forEach(function (callback) {
    callback(eventArgs);
  });
};

Reactor.prototype.addEventListener = function (eventName, callback) {
  this.events[eventName].registerCallback(callback);
};


var reactor = new Reactor();

reactor.registerEvent('big bang');

reactor.addEventListener('big bang', function () {
  console.log('This is big bang listener yo!');
});

reactor.addEventListener('big bang', function () {
  console.log('This is another big bang listener yo!');
});

reactor.dispatchEvent('big bang');


////////////////////////////////////////////////////////////////////////////////////


var MyEventTarget = function () {
  // Create a DOM EventTarget object
  var target = document.createTextNode(null);

  // Pass EventTarget interface calls to DOM EventTarget object
  this.addEventListener = target.addEventListener.bind(target);
  this.removeEventListener = target.removeEventListener.bind(target);
  this.dispatchEvent = target.dispatchEvent.bind(target);

  // Room your your constructor code
};

// Create an instance of your event target
myTarget = new MyEventTarget();

// Add an event listener to your event target
myTarget.addEventListener("myevent", function () {
  alert("hello")
});

// Dispatch an event from your event target
var evt = document.createEvent('Event');
evt.initEvent("myevent", true, true);
myTarget.dispatchEvent(evt);
