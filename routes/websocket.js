/**
 * Dependencies
 */
var Server = require('ws').Server;
var protocol = require('../protocol/index');
var util = require('util');

/**
 * Private variables and functions
 */
var devices = {};

var removeWsFromDevices = function (ws) {
  ws.devices.forEach(function (deviceid) {
    var pos = devices[deviceid].indexOf(ws);
    if (pos === -1) {
      return;
    }

    devices[deviceid].splice(pos, 1);
  });
};

/**
 * Exports
 */

module.exports = function (httpServer) {
  var server = new Server({
    server: httpServer,
    path: '/api/ws'
  });

  server.on('connection', function (ws) {
    ws.devices = [];

    ws.on('message', function (req) {
      try {
        req = JSON.parse(req);
        if (! req.apikey || ! req.deviceid || ! req.action) {
          // Only process IoTgo request
          return;
        }

        req.ws = ws;
        protocol(req, function (res) {
          ws.send(JSON.stringify(res));

          if (res.error) {
            return;
          }

          devices[req.deviceid] = devices[req.deviceid] || [];
          if (devices[req.deviceid].indexOf(ws) !== -1) {
            return;
          }

          devices[req.deviceid].push(ws);
          ws.devices.push(req.deviceid);
        });
      }
      catch (err) {
        // Ignore non-JSON message
      }
    });

    ws.on('close', function () {
      removeWsFromDevices(ws);
    });

    ws.on('error', function () {
      removeWsFromDevices(ws);
    });
  });

  protocol.on('update', function (req) {
    if (! devices[req.deviceid]) {
      return;
    }

    devices[req.deviceid].forEach(function (ws) {
      if (req.ws && req.ws === ws) {
        return;
      }

      ws.send(JSON.stringify(req, function (key, value) {
        if (key === 'ws') {
          // exclude property ws from resulting JSON string
          return undefined;
        }
        return value;
      }));
    });
  });
};