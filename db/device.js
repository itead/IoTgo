/**
 * Dependencies
 */
var mongoose = require('mongoose');

/**
 * Private variables and functions
 */
var Schema = mongoose.Schema;
var lastDeviceids = {};

var incDeviceid = function (deviceid) {
  // Deviceid should be a string of 10 characters
  // First 2 characters form the type of device
  var type = deviceid.substr(0, 2);
  deviceid = (parseInt(deviceid.substr(2), 16) + 1).toString(16);

  //if (deviceid.length > 8) {
  //  return false;
  //}

  if (deviceid.length < 8) {
    deviceid = '00000000'.substr(deviceid.length) + deviceid;
  }

  // Third party devices take lower half of device id space
  if (deviceid.charAt(0) >= '8') {
    return false;
  }

  return type + deviceid;
};

var now = function () {
  return new Date();
};

var empty = function () {
  return {};
};

/**
 * Exports
 */
var schema = new Schema({
  name: { type: String, required: true },
  group: { type: String, default: '' },
  type: { type: String, required: true, index: true, match: /^[0-9a-f]{2}$/ },
  deviceid: { type: String, required: true, index: true, match: /^[0-9a-f]{10}$/ },
  apikey: { type: String, required: true, index: true },
  createdAt: { type: Date, index: true, default: now },
  online: { type: Boolean, index: true, default: false },
  params: { type: Schema.Types.Mixed, default: empty }
});

schema.static('exists', function (apikey, deviceid, callback) {
  this.where({ apikey: apikey, deviceid: deviceid }).findOne(callback);
});

schema.static('getDeviceByDeviceid', function (deviceid, callback) {
  this.where({ deviceid: deviceid }).findOne(callback);
});

schema.static('getDevicesByApikey', function (apikey, callback) {
  this.where('apikey', apikey).find(callback);
});

schema.static('getNextDeviceid', function (type, callback) {
  if (! /^[0-9a-f]{2}$/.test(type)) {
    callback('Device type ' + type + ' is forbidden!');
    return;
  }

  if (lastDeviceids[type]) {
    var deviceid = incDeviceid(lastDeviceids[type]);
    if (! deviceid) {
      callback('Not enough device ids available!');
      return;
    }

    lastDeviceids[type] = deviceid;
    callback(null, deviceid);
    return;
  }

  this.where({ type: type, deviceid: { $lt: type + '80000000' } })
      .select('deviceid').sort('-deviceid').findOne(function (err, device) {
    if (err) {
      callback(err);
      return;
    }

    var deviceid;
    if (! device) {
      // Starting with 1 instead of 0 makes more sense to non-programmer
      deviceid = type + '00000001';
      lastDeviceids[type] = deviceid;
      callback(null, deviceid);
      return;
    }

    deviceid = incDeviceid(device.deviceid);
    if (! deviceid) {
      callback('Not enough device ids available!');
      return;
    }

    lastDeviceids[type] = deviceid;
    callback(null, deviceid);
  });
});

module.exports = mongoose.model('Device', schema);