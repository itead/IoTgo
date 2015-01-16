/**
 * Dependencies
 */
var config = require('../config');
var protocol = require('../protocol/index');

module.exports = function (req, res) {
  if (req.header('Host') !== config.host ||
      req.header('Content-Type') !== 'application/json') {
    res.status(400).end();
    return;
  }

  protocol.postRequest(req.body, function (resBody) {
    res.send(resBody);
  });
};