var mixin = require('utils-merge');
var mailgunConf = require('../config').mailgun;
var mailgun = require('mailgun-js')({apiKey: mailgunConf.api_key, domain: mailgunConf.domain});
var debug = require('debug')('email-util');

exports.sendMail = function (mailOptions, callback) {
  var from = {from: mailgunConf.from};
  mixin(mailOptions, from);
  debug('mailOptions:', mailOptions);
  mailgun.messages().send(mailOptions, function (error, body) {
    if (error) {
      debug('err:', error);
      callback(error);
      return;
    }
    debug('Email Send success!');
    callback(null, body);
  });
};