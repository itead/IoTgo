/**
 * Dependencies
 */
var uuid = require('uuid');
var bcrypt = require('bcrypt');
var mongoose = require('mongoose');

/**
 * Private variables and functions
 */
var Schema = mongoose.Schema;
var hash = function (value) {
  return bcrypt.hashSync(value, 10);
};
var transform = function (doc, ret) {
  delete ret.password;
  delete ret.__v;
  return ret;
};
var now = function () {
  return new Date();
};

/**
 * Exports
 */
var schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, set: hash },
  apikey: { type: String, unique: true, default: uuid.v4 },
  createdAt: { type: Date, index: true, default: now }
});

schema.static('register', function (email, password, callback) {
  this.create({ email: email, password: password }, function (err, user) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, user.toObject({ transform: transform }));
  });
});

schema.static('authenticate', function (email, password, callback) {
  this.where('email', email).findOne(function (err, user) {
    if (err) {
      callback(err);
      return;
    }

    if (! user || ! bcrypt.compareSync(password, user.password)) {
      callback(null, false);
      return;
    }

    callback(null, user.toObject({ transform: transform }));
  });
});

schema.static('setPassword', function (email, password, callback) {
  this.where('email', email).findOne(function (err, user) {
    if (err) {
      callback(err);
      return;
    }

    if (! user) {
      callback('User does not exist!');
      return;
    }

    user.password = password;
    user.save(function (err, user) {
      if (err) {
        callback(err);
        return;
      }

      callback(null, user.toObject({ transform: transform }))
    });
  });
});

module.exports = mongoose.model('User', schema);