/**
 * Dependencies
 */
var express = require('express');
var expressJwt = require('express-jwt');
var jsonWebToken = require('jsonwebtoken');
var unless = require('express-unless');
var request = require('request');
var git_util = require('../lib/git-util');
var ip_util = require('../lib/ip-util');
var config = require('../config');
var db = require('../db/index');
var packagejson = require('../package');
var User = db.User;
var Device = db.Device;
var FactoryDevice = db.FactoryDevice;

/**
 * Private variables and functions
 */
var authenticate = function (email, password, callback) {
  if (!email in config.admin || config.admin[email] !== password) {
    callback(null, false);
    return;
  }

  callback(null, {email: email, isAdmin: true});
};

var adminOnly = function (req, res, next) {
  if (!req.user.isAdmin) {
    var err = new Error('Admin only area!');
    err.status = 401;
    next(err);
  }

  next();
};
adminOnly.unless = unless;

/**
 * Exports
 */
module.exports = exports = express.Router();

// Enable Json Web Token
exports.use(expressJwt(config.jwt).unless({
  path: ['/api/admin/login']
}));

// Restrict access to admin only
exports.use(adminOnly.unless({
  path: ['/api/admin/login']
}));

// Login
exports.route('/login').post(function (req, res) {
  var email = req.body.email;
  var password = req.body.password;
  if (!email || !password) {
    res.send({
      error: 'Email address and password must not be empty!'
    });
    return;
  }

  authenticate(email, password, function (err, user) {
    if (err || !user) {
      res.send({
        error: 'Email address or password is not correct!'
      });
      return;
    }

    res.send({
      jwt: jsonWebToken.sign(user, config.jwt.secret),
      user: user
    });
  });
});

var upgrade = function (params, req, res) {
  ip_util.getLocalIP(function (ip) {
    request.post({
      url: config.upgradeUrl,
      form: {domain: params.domain, name: params.name, version: params.version, ip: ip}
    }, function (err, httpResponse, body) {
      if (err) {
        res.send({
          error: 'get remote version  Failed!'
        });
        return;
      }
      var json = JSON.parse(body);
      var script;
      if (json && 200 === json.flag) {
        script = "<script>$('#checkDiv').show();</script>";
        return res.json(script);
      }
      script = "<script>console.log('" + json.message + "');</script>";
      res.json(script);
    });
  });
};

exports.route('/checkUpdate').get(function (req, res) {
  var domain = config.host;
  git_util.isRepo(function (flag) {
    if (flag) {
      git_util.getRepoName(function (err, name) {
        if (err) {
          res.send({
            error: 'get Reposity Name Failed!'
          });
          return;
        }
        git_util.getCurrentVersion(function (version) {
          version = version || '0.0.1';
          var params = {domain: domain, name: name, version: version};
          upgrade(params, req, res);
        });
      });
      return;
    }
    var name = 'IoTgo';
    var version = packagejson['version'];
    var params = {domain: domain, name: name, version: version};
    upgrade(params, req, res);
  });

});
// User management
exports.route('/users').get(function (req, res) {
  var limit = Number(req.query.limit) || config.page.limit;
  var skip = Number(req.query.skip) || 0;

  var condition = {};
  if (req.query.createdAtFrom) {
    condition.createdAt = condition.createdAt ? condition.createdAt : {};
    condition.createdAt.$gte = new Date(req.query.createdAtFrom);
  }
  if (req.query.createdAtTo) {
    condition.createdAt = condition.createdAt ? condition.createdAt : {};
    condition.createdAt.$lte = new Date(req.query.createdAtTo);
  }

  User.find(condition).select('-password').skip(skip).limit(limit)
    .sort({createdAt: config.page.sort}).exec(function (err, users) {
      if (err) {
        res.send({
          error: 'Get user list failed!'
        });
        return;
      }

      res.send(users);
    });
});

exports.route('/users/:apikey').get(function (req, res) {
  User.findOne({'apikey': req.params.apikey}).select('-password')
    .exec(function (err, user) {
      if (err || !user) {
        res.send({
          error: 'User does not exist!'
        });
        return;
      }

      res.send(user);
    });
}).delete(function (req, res) {
  User.findOneAndRemove({'apikey': req.params.apikey}, function (err, user) {
    if (err || !user) {
      res.send({
        error: 'User does not exist!'
      });
      return;
    }

    // Delete all devices belong to user
    Device.remove({apikey: req.params.apikey}, function (err) {
      if (err) {
        res.send({
          error: 'Delete user\'s devices failed!'
        });
        return;
      }

      res.send(user);
    });
  });
});

// Device management
exports.route('/devices').get(function (req, res) {
  var limit = Number(req.query.limit) || 0;
  var skip = Number(req.query.skip) || 0;

  var condition = {};
  if (req.query.createdAtFrom) {
    condition.createdAt = condition.createdAt || {};
    condition.createdAt.$gte = new Date(req.query.createdAtFrom);
  }
  if (req.query.createdAtTo) {
    condition.createdAt = condition.createdAt || {};
    condition.createdAt.$lte = new Date(req.query.createdAtTo);
  }
  if (req.query.name) {
    condition.name = new RegExp(req.query.name, 'i');
  }
  if (req.query.type) {
    condition.type = req.query.type;
  }
  if (req.query.deviceid) {
    condition.deviceid = new RegExp(req.query.deviceid, 'i');
  }
  if (req.query.apikey) {
    condition.apikey = req.query.apikey;
  }
  if (req.query.lastModifiedAtFrom) {
    condition.lastModified = condition.lastModified || {};
    condition.lastModified.$gte = new Date(req.query.lastModifiedAtFrom);
  }
  if (req.query.lastModifiedAtTo) {
    condition.lastModified = condition.lastModified || {};
    condition.lastModified.$lte = new Date(req.query.lastModifiedAtTo);
  }

  Device.find(condition).select('-params').skip(skip).limit(limit)
    .sort({createdAt: config.page.sort}).exec(function (err, devices) {
      if (err) {
        res.send({
          error: 'Get device list failed!'
        });
        return;
      }

      res.send(devices);
    });
});

exports.route('/devices/:deviceid').get(function (req, res) {
  Device.findOne({'deviceid': req.params.deviceid})
    .exec(function (err, device) {
      if (err || !device) {
        res.send({
          error: 'Device does not exist!'
        });
        return;
      }

      res.send(device);
    });
});

// Factory device management
exports.route('/factorydevices').get(function (req, res) {
  var limit = Number(req.query.limit) || 0;
  var skip = Number(req.query.skip) || 0;

  var condition = {};
  if (req.query.createdAtFrom) {
    condition.createdAt = condition.createdAt || {};
    condition.createdAt.$gte = new Date(req.query.createdAtFrom);
  }
  if (req.query.createdAtTo) {
    condition.createdAt = condition.createdAt || {};
    condition.createdAt.$lte = new Date(req.query.createdAtTo);
  }
  if (req.query.name) {
    condition.name = new RegExp(req.query.name, 'i');
  }
  if (req.query.type) {
    condition.type = req.query.type;
  }
  if (req.query.deviceid) {
    condition.deviceid = new RegExp(req.query.deviceid, 'i');
  }
  if (req.query.apikey) {
    condition.apikey = req.query.apikey;
  }

  FactoryDevice.find(condition).skip(skip).limit(limit)
    .sort({createdAt: config.page.sort})
    .exec(function (err, factoryDevices) {
      if (err) {
        res.send({
          error: 'Get factory device list failed!'
        });
        return;
      }

      res.send(factoryDevices);
    });
});

exports.route('/factorydevices/create').post(function (req, res) {
  var name = req.body.name,
    type = req.body.type,
    qty = Number(req.body.qty),
    createdAt = new Date();

  if (!name || !name.trim() || !type || !/^[0-9a-f]{2}$/.test(type)
    || 'number' !== typeof qty || 0 === qty) {
    res.send({
      error: 'Factory device name, type and qty must not be empty!'
    });
    return;
  }

  FactoryDevice.getNextDeviceid(type, function (err, nextDeviceid) {
    if (err) {
      res.send({
        error: 'Create factory device failed!'
      });
      return;
    }

    var i = 0;
    var devices = [];
    do {
      var factoryDevice = new FactoryDevice({
        name: name,
        type: type,
        deviceid: nextDeviceid,
        createdAt: createdAt
      });
      factoryDevice.save();
      devices.push(factoryDevice);

      nextDeviceid = FactoryDevice.incDeviceid(nextDeviceid);
      i += 1;
    } while (i < qty && nextDeviceid);

    /*
     if (req.query.file) {
     res.attachment(name + '-' + type + '-' + qty + '.csv');

     var download = [[ 'name', 'type', 'deviceid', 'apikey' ]];
     devices.forEach(function (device) {
     download.push([
     device.name, device.type, device.deviceid, device.apikey
     ]);
     });
     download.forEach(function (item, index) {
     download[index] = item.join(', ');
     });

     console.log(download.join('\r\n'));
     res.send(download.join('\r\n'));
     return;
     }
     */

    res.send(devices);
  });
});