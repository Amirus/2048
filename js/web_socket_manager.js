function WebSocketManager() {
  this.events = {};
  this.conn = null;
  this.retryConnectMillis = 2000;

  // This should be the endpoint of the router server
  this.routeEndpoint = "http://" + window.location.hostname + ":6969/route";
  console.log(this.routeEndpoint);
}

WebSocketManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

WebSocketManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

WebSocketManager.prototype.send = function (payload) {
  conn.send(JSON.stringify(payload));
};

WebSocketManager.prototype.startSocketConnection = function () {
  var self = this;

  $.getJSON(this.routeEndpoint, function (json) {
    var socketEndpoint = "ws://" + window.location.hostname + ":" + json.port;
    console.log(socketEndpoint);
    console.log("make socket connection");
    conn = new WebSocket(socketEndpoint);
    console.log("sockets are a go-go");
    conn.onclose = function(evt) {
      setTimeout(function () {
        self.startSocketConnection();
      }, self.retryConnectMillis);
    };
    conn.onmessage = function(evt) {
      self.emit("changeState", JSON.parse(evt.data));
    };
  }).fail(function () {
    setTimeout(function () {
      self.startSocketConnection();
    }, self.retryConnectMillis);
  });
}
