angular.module('iotgo')

.factory('Devices', [ '$resource', '$window', '$rootScope', 'Settings', 'WS',
  function ($resource, $window, $rootScope, Settings, WS) {
    var Resource = $resource(Settings.httpServer + '/api/user/device/:id', { id: '@deviceid' }, {
      add: { method: 'POST', url: Settings.httpServer + '/api/user/device/add' }
    });

    var _devices, _indexes = {};

    var _query = function (successCallback, errorCallback) {
      if (_devices) {
        successCallback(_devices);
        return;
      }

      Resource.query(function (devices) {
        _devices = devices;
        angular.forEach(_devices, function (_device) {
          _indexes[_device.deviceid] = _device;
        });

        _listenWebSocket();
        successCallback(_devices);
      }, errorCallback);
    };

    var _get = function (deviceId, successCallback, errorCallback) {
      var _device = _indexes[deviceId];
      if (_device) {
        successCallback(_device);
        return;
      }

      errorCallback();
    };

    var _remove = function (deviceId, successCallback, errorCallback) {
      var _device = _indexes[deviceId];
      if (_device) {
        _device.$remove(function (device) {
          if (device.error) {
            errorCallback();
            return;
          }

          _devices.splice(_devices.indexOf(_device), 1);
          delete _indexes[deviceId];
          successCallback(_device);
        }, errorCallback);

        return;
      }

      errorCallback();
    };

    var _add = function (deviceData, successCallback, errorCallback) {
      Resource.add(deviceData, function (device) {
        if (device.error) {
          errorCallback();
          return;
        }

        _devices.push(device);
        _indexes[device.deviceid] = device;

        successCallback(device);
      }, errorCallback)
    };

    var _save = function (deviceData, successCallback, errorCallback) {
      Resource.save(deviceData, function (device) {
        if (device.error) {
          errorCallback();
          return;
        }

        _devices.push(device);
        _indexes[device.deviceid] = device;

        successCallback(device);
      }, errorCallback);
    };

    var _pending = {};

    var _send = function (data, successCallback, errorCallback) {
      if (! angular.isObject(data)) {
        return;
      }

      data.sequence = '' + Date.now();
      _pending[data.sequence] = {
        success: successCallback,
        error: errorCallback
      };

      WS.send(data);
    };

    var _listenWebSocket = function () {
      WS.addListener(function (data) {
        // request
        if ('action' in data) {
          var _device = _indexes[data.deviceid];
          if (! _device) return;

          if (data.action === 'sysmsg') {
            if ('online' in data.params) {
              _device.online = data.params.online;
            }

            // manually trigger AngularJS digest
            // so modified device property will be visible on UI
            $rootScope.$apply();
            return;
          }

          if (data.action === 'update') {
            _device.params = _device.params || {};
            angular.extend(_device.params, data.params);
            // manually trigger AngularJS digest
            // so modified device property will be visible on UI
            $rootScope.$apply();
          }
        }
        // response
        else if ('error' in data) {
          // dummy query response
          if (! ('sequence' in data)) return;

          var _callback = _pending[data.sequence];
          if (! _callback) return;

          if (data.error) {
            _callback.error();
          }
          else {
            _callback.success(data);
          }
        }
      });

      // send dummy `query` requests
      // so IoTgo server knows devices are on this connection.
      angular.forEach(_devices, function (device) {
        WS.send({
          action: 'query',
          apikey: device.apikey,
          deviceid: device.deviceid,
          params: [ 'any_not_exist_property' ]
        });
      });
    };

    return {
      query: _query,
      add: _add,
      get: _get,
      save: _save,
      remove: _remove,
      send: _send
    };
  }
]);