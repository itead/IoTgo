/**
 * Dependencies
 */
var methods = require('./methods');
var interceptors = require('./interceptors');
var EventEmitter = require('events').EventEmitter;
var mixin = require('utils-merge');

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
 * Exports
 */
module.exports = exports = function (req, callback) {
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

  methods[req.action](req, callback);
};

mixin(exports, EventEmitter.prototype);

methods.on('update', function (req) {
  exports.emit('update', req);
});