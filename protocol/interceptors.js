/**
 * Private variables and functions
 */
var interceptors = [];

/**
 * Exports
 */
module.exports = exports = function (req, res) {
  interceptors.forEach(function (interceptor) {
    interceptor(req, res);
  });

  return res;
};

exports.addInterceptor = function (interceptor) {
  if (typeof interceptor !== 'function') {
    throw new TypeError('Interceptor must be a function!');
  }

  interceptors.push(interceptor);
};

// add deviceid and apikey to response.
exports.addInterceptor(function (req, res) {
  if (req.deviceid && ! res.deviceid) {
    res.deviceid = req.deviceid;
  }

  if (req.apikey && ! res.apikey) {
    res.apikey = req.apikey;
  }
});

// add sequence property to response if exists.
exports.addInterceptor(function (req, res) {
  if (typeof req.sequence !== 'undefined') {
    res.sequence = req.sequence;
  }
});