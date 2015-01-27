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
        enabled: true,
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