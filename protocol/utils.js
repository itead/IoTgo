/**
 * Dependencies
 */
var mixin = require('utils-merge');

/**
 * Exports
 */
module.exports = exports = {};

exports.fromDevice = function (req) {
  return typeof req.userAgent === 'undefined' || req.userAgent === 'device';
};

exports.transformTimers = function (timers) {
  var result = [];
  timers.forEach(function (timer) {
    if (timer && timer.enabled && timer.type === 'once' &&
        timer.at && ! Number.isNaN(Date.parse(timer.at)) && timer.do) {
      var timeLeft = Math.floor((Date.parse(timer.at) - Date.now()) / 1000);
      if (timeLeft <= 0) return;

      result.push({
        enabled: 1,
        type: 'once',
        at: timeLeft,
        do: timer.do
      });
    }
  });
  return result;
};

exports.isFactoryDeviceid = function (deviceid) {
  return parseInt(deviceid.substr(2, 1), 16) >= 8;
};

exports.transformRequest = function (req) {
  var _req = mixin({}, req);
  if (_req.params) {
    _req.params = mixin({}, req.params);

    if (Object.keys(_req.params).length === 0) {
      _req.params = 0;
    }
    else {
      if (Array.isArray(_req.params.timers)) {
        _req.params.timers = exports.transformTimers(req.params.timers);
        if (_req.params.timers.length === 0) {
          _req.params.timers = 0;
        }
      }
    }
  }

  return _req;
};

exports.transformResponse = function (res) {
  if (res.params && res.params.timers) {
    res.params.timers = exports.transformTimers(res.params.timers);
  }

  Object.keys(res).forEach(function (key) {
    if (res[key] === true) {
      res[key] = 1;
      return;
    }

    if (res[key] === false) {
      res[key] = 0;
      return;
    }

    if (res[key] === null) {
      res[key] = 0;
      return;
    }

    if (Array.isArray(res[key])) {
      if (res[key].length === 0) {
        res[key] = 0;
        return;
      }

      res[key].forEach(function (item) {
        if (typeof item === 'object' && item !== null) {
          item = exports.transformResponse(item);
        }
      });

    }

    if (typeof res[key] === 'object') {
      if (Object.keys(res[key]).length === 0) {
        res[key] = 0;
        return;
      }

      res[key] = exports.transformResponse(res[key]);
    }

  });

  return res;
};