/**
 * Dependencies
 */
var db = require('../db/index');
var User = db.User;
var Device = db.Device;
var FactoryDevice = db.FactoryDevice;
var validate = require('./types');
var EventEmitter = require('events').EventEmitter;
var mixin = require('utils-merge');

/**
 * Exports
 */
module.exports = exports = {};
mixin(exports, EventEmitter.prototype);

exports.register = function (req, callback) {
  FactoryDevice.exists(req.apikey, req.deviceid, function (err, device) {
    if (err || ! device) {
      callback({
        error: 403,
        reason: 'Forbidden',
        apikey: req.apikey,
        deviceid: req.deviceid
      });
      return;
    }

    Device.getDeviceByDeviceid(req.deviceid, function (err, device) {
      if (err || ! device) {
        callback({
          error: 404,
          reason: 'Not Found',
          apikey: req.apikey,
          deviceid: req.deviceid
        });
        return;
      }

      callback({
        error: 0,
        apikey: device.apikey,
        deviceid: req.deviceid
      });
    });
  });
};

exports.update = function (req, callback) {
  if (! req.params || typeof req.params !== 'object' || ! validate(req)) {
    callback({
      error: 400,
      reason: 'Bad Request',
      apikey: req.apikey,
      deviceid: req.deviceid
    });
    return;
  }

  Device.exists(req.apikey, req.deviceid, function (err, device) {
    if (err || ! device) {
      callback({
        error: 403,
        reason: 'Forbidden',
        apikey: req.apikey,
        deviceid: req.deviceid
      });
      return;
    }

    device.params = req.params;
    device.lastModified = new Date();
    device.save();
    callback({
      error: 0,
      apikey: req.apikey,
      deviceid: req.deviceid
    });

    exports.emit('update', req);
  });
};

exports.query = function (req, callback) {
  if (! Array.isArray(req.params)) {
    callback({
      error: 400,
      reason: 'Bad Request',
      apikey: req.apikey,
      deviceid: req.deviceid
    });
    return;
  }

  Device.exists(req.apikey, req.deviceid, function (err, device) {
    if (err || ! device) {
      callback({
        error: 403,
        reason: 'Forbidden',
        apikey: req.apikey,
        deviceid: req.deviceid
      });
      return;
    }

    // Work around mongoose bug
    device.params = device.params || {};

    if (! req.params.length) {
      callback({
        error: 0,
        params: device.params,
        apikey: req.apikey,
        deviceid: req.deviceid
      });
      return;
    }

    var params = {};
    req.params.forEach(function (item) {
      if (item in device.params) {
        params[item] = device.params[item];
      }
    });
    callback({
      error: 0,
      params: params,
      apikey: req.apikey,
      deviceid: req.deviceid
    });
  });
};