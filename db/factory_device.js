/**
 * Dependencies
 */
var mongoose = require('mongoose');
var uuid = require('uuid');

/**
 * Private variables and functions
 */
var Schema = mongoose.Schema;
var incDeviceid = function (deviceid) {
  // Deviceid should be a string of 10 characters
  // First 2 characters form the type of device
  var type = deviceid.substr(0, 2);
  deviceid = (parseInt(deviceid.substr(2), 16) + 1).toString(16);

  if (deviceid.length > 8) {
    return false;
  }

  //if (deviceid.length < 8) {
  //  deviceid = '00000000'.substr(deviceid.length) + deviceid;
  //}

  return type + deviceid;
};

/**
 * Exports
 */
var schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, index: true, match: /^[0-9a-f]{2}$/ },
  deviceid: { type: String, required: true, index: true, match: /[0-9a-f]{10}/ },
  apikey: { type: String, unique: true, default: uuid.v4 },
  createdAt: { type: Date, required: true }
});

schema.static('exists', function (apikey, deviceid, callback) {
  this.where({ apikey: apikey, deviceid: deviceid }).findOne(callback);
});

schema.static('getNextDeviceid', function (type, callback) {
  if (! /^[0-9a-f]{2}$/.test(type)) {
    callback('Device type ' + type + ' is forbidden!');
    return;
  }

  this.where('type', type).select('deviceid').sort('-deviceid').
    findOne(function (err, device) {
      if (err) {
        callback(err);
        return;
      }

      if (! device) {
        // Starting with 1 instead of 0 makes more sense to non-programmer
        // Factory devices take upper half of device id space
        callback(null, type + '80000001');
        return;
      }

      var deviceid = incDeviceid(device.deviceid);
      if (! deviceid) {
        callback('Not enough device ids available!');
        return;
      }

      callback(null, deviceid);
    });
});
schema.static('incDeviceid', function (deviceid) {
  return incDeviceid(deviceid);
});

module.exports = mongoose.model('FactoryDevice', schema);