/**
 * Dependencies
 */
var methods = require('./methods');
var validateType = require('./types');
var interceptors = require('./interceptors');
var EventEmitter = require('events').EventEmitter;
var Device = require('../db/index').Device;
var mixin = require('utils-merge');
var config = require('../config');
var utils = require('./utils');

/**
 * Private variables and functions
 */

var validate = function (req) {
  if (! req.action || ! req.apikey || ! req.deviceid) {
    return false;
  }

  if (! /^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/.test(req.apikey)) {
    return false;
  }

  if (! /^[0-9a-f]{10}$/.test(req.deviceid)) {
    return false;
  }

  return true;
};

/**
 * { 'sequenceValue': { req: reqObj, callback: callbackFunc, timer: setTimeout() } }
 */
var pendingRequests = {};
var removePendingRequest = function (sequence) {
  var pending = pendingRequests[sequence];
  if (! pending) return;

  pending.callback(interceptors(pending.req, { error: 504, reason: 'Request Timeout' }));
  delete pendingRequests[sequence];
};

/**
 * Exports
 */
module.exports = exports;
mixin(exports, EventEmitter.prototype);

exports.postRequest = function (req, callback) {
  if (! validate(req)) {
    callback(interceptors(req, { error: 400, reason: 'Bad Request' }));
    return;
  }

  if (typeof methods[req.action] !== 'function') {
    callback(interceptors(req, {
      error: 400,
      reason: 'Bad Request'
    }));
    return;
  }

  if (req.action !== 'update' ||  utils.fromDevice(req) ||
      ! utils.isFactoryDeviceid(req.deviceid)) {
    methods[req.action](req, callback);
    return;
  }

  // Update message from apps
  if (typeof req.params !== 'object' || ! validateType(req)) {
    callback(interceptors(req, {
      error: 400,
      reason: 'Bad Request'
    }));
    return;
  }

  Device.exists(req.apikey, req.deviceid, function (err, device) {
    if (err || ! device) {
      callback(interceptors(req, {
        error: 403,
        reason: 'Forbidden'
      }));
      return;
    }

    if (! device.online) {
      callback(interceptors(req, {
        error: 503,
        reason: 'Device Offline'
      }));
      return;
    }

    req.sequence = req.sequence || ('' + Date.now());
    exports.emit('app.update', req);

    pendingRequests[req.sequence] = {
      req: req,
      callback: callback,
      timer: setTimeout(removePendingRequest,
        config.pendingRequestTimeout || 3000,
        req.sequence)
    };
  });
};

exports.postResponse = function (res) {
  if (! res.sequence || ! pendingRequests[res.sequence]) return;

  var pending = pendingRequests[res.sequence];
  clearTimeout(pending.timer);

  if (res.error === 0) {
    methods['update'](pending.req, pending.callback);
  }
  else {
    pending.callback(res);
  }

  delete pendingRequests[res.sequence];
};

exports.postMessage = function (msg) {
  if (! msg.type || typeof msg.type !== 'string') return;

  switch (msg.type) {
    // Device online offline
    case 'device.online':
      if (! msg.deviceid || typeof msg.deviceid !== 'string') return;

      Device.getDeviceByDeviceid(msg.deviceid, function (err, device) {
        if (err || ! device) return;

        device.online = msg.online ? true : false;
        device.save();

        exports.emit('device.online', {
          action: 'sysmsg',
          deviceid: device.deviceid,
          apikey: device.apikey,
          params: {
            online: device.online
          }
        });
      });
      break;
  }
};

exports.utils = utils;

methods.on('update', function (req) {
  exports.emit('device.update', req);
});
