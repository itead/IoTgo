/**
 * Private variables and functions
 */
var types = {};

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
  return ('switch' in params) && (/^on|off$/.test(params['switch']));
});

// Light
exports.addType('02', function (params) {
  return ('light' in params) && (/^on|off$/.test(params['light']));
});

// Temperature and humidity sensor
exports.addType('03', function (params) {
  return ('humidity' in params) && ('temperature' in params) &&
    (! isNaN(Number(params['humidity']))) &&
    (! isNaN(Number(params['temperature'])));
});