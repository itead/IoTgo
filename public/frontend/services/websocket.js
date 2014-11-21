angular.module('iotgo').
  factory('WS', [ '$window', function ($window) {
    if (! WebSocket) {
      return false;
    }

    var uri = 'ws://iotgo.iteadstudio.com/api/ws';
    var ws = new WebSocket(uri);
    var listeners = {};

    return {
      send: function (req) {
        if (ws.readyState !== WebSocket.OPEN) {
          return;
        }

        if (typeof req !== 'object' || req === null) {
          return;
        }

        ws.send(JSON.stringify(req));
      },
      listen: function (callback) {
        ws.addEventListener('message', function (message) {
          try {
            var data = JSON.parse(message.data);
            callback(data);
          }
          catch (err) {
            // Do nothing
          }
        });
      }
    };
  } ]);
