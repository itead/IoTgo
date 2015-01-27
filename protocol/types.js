/**
 * Private variables and functions
 */
var types = {};
var validateTimers = function (timers) {
  /*
  "timers": [{
    "enabled": true or false,
    "type": "once or repeat"
    "at": "ISO format when type is once, Cron job format when type is repeat",
    "do": {
      "switch": "on/off"
    }
  }]
  */
  if (! Array.isArray(timers)) return false;

  return timers.every(function (timer) {
    return timer &&
      ('enabled' in timer) && (typeof timer.enabled === 'boolean') &&
      timer.type && (timer.type === 'once' || timer.type === 'repeat') &&
      timer.at && (typeof timer.at === 'string') &&
      timer.do && (typeof timer.do === 'object');
  });
};

/**
 * Exports
 */
module.exports = exports = function (req) {
  var type = req.deviceid.substr(0, 2);
  if (! (type in types)) {
    return true;
  }

  return types[type](req.params);
};

exports.addType = function (type, validate) {
  if (typeof type !== 'string' || typeof validate !== 'function') {
    return;
  }

  types[type] = validate;
};

// Switch
exports.addType('01', function (params) {
  if (params.timers) {
    return validateTimers(params.timers);
  }

  return ('switch' in params) && (/^on|off$/.test(params['switch']));
});

// Light
exports.addType('02', function (params) {
  if (params.timers) {
    return validateTimers(params.timers);
  }

  return ('light' in params) && (/^on|off$/.test(params['light']));
});

// Temperature and humidity sensor
exports.addType('03', function (params) {
  return ('humidity' in params) && ('temperature' in params) &&
    (! isNaN(Number(params['humidity']))) &&
    (! isNaN(Number(params['temperature'])));
});