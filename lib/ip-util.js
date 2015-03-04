var os = require('os');
var child_proc = require('child_process');

exports.getLocalIP = function (callback) {
  var getIPApp = undefined;
  var matches = [];
  var pmHosts = [];
  var filterRE = undefined;
  var pingResult = null;
  var pmHost = null;
  var IPv4, hostName, i;
  hostName = os.hostname();
  if ('win32' == os.platform()) {
    getIPApp = child_proc.spawn("ipconfig", null);
    // only get the IPv4 address
    filterRE = /\b(IPv4|IP\s)[^:\r\r\n]+:\s+([^\s]+)/g;
    getIPApp.on('exit', function (code, signal) {
      matches = pingResult.match(filterRE) || [];
      for (var i = 0; i < matches.length; i++) {
        var host = matches[i].split(':')[1];

        // trim the spaces in the string's start/end position.
        host = host.replace(/(^[\s]*)|([\s]*$)/g, "");
        pmHosts.push(host);
      }

      if (pmHosts.length > 0)
        pmHost = pmHosts[0];
      // do other things
      callback(pmHost);

    });

    getIPApp.stdout.on('data', function (data) {
      // get ping result.
      pingResult = pingResult + data.toString();
    });
  }
  else {
    if (os.networkInterfaces().en0 && os.networkInterfaces().en0.length) {
      for (i = 0; i < os.networkInterfaces().en0.length; i++) {
        if (os.networkInterfaces().en0[i].family == 'IPv4') {
          IPv4 = os.networkInterfaces().en0[i].address;
        }
      }

    } else if (os.networkInterfaces().eth0 && os.networkInterfaces().eth0.length) {
      for (i = 0; i < os.networkInterfaces().eth0.length; i++) {
        if (os.networkInterfaces().eth0[i].family == 'IPv4') {
          IPv4 = os.networkInterfaces().eth0[i].address;
        }
      }
    }
    callback(IPv4);
  }
};



