angular.module('iotgo').
  controller('DevicesCtrl', [ '$scope', '$window', 'User', 'Device', 'WS',
    function ($scope, $window, User, Device, WS) {
      var _apikey;
      var _devices = [];

      Device.query(function (devices) {
        _devices = devices;
        $scope.devices = groupBy(_devices, 'group');
      }, function () {
        $window.alert('Retrieve device list failed!');
      });

      $scope.showModal = function (selector) {
        angular.element(selector).modal();
      };

      $scope.hideModal = function () {
        angular.element('.modal').modal('hide');
      };

      $scope.createDevice = function () {
        if (! $scope.device || ! $scope.device.name ||
            ! $scope.device.type || ! $scope.device.group) {
          $window.alert('Device name, type, and group are required!');
          return;
        }

        Device.save({
          name: $scope.device.name,
          type: $scope.device.type,
          group: $scope.device.group
        }, function (device) {
          if (device.error) {
            $window.alert(device.error);
            return;
          }

          $scope.hideModal();
          $scope.device = null;
          _devices.push(device);
          $scope.devices = groupBy(_devices, 'group');
        }, function () {
          $window.alert('Create device failed! Please try again later.');
        });
      };

      $scope.addDevice = function () {
        if (! $scope.device || ! $scope.device.name || !$scope.device.group ||
            ! $scope.device.deviceid || ! $scope.device.apikey) {
          $window.alert('Device name, group, id and api key are required!');
          return;
        }

        Device.add({
          name: $scope.device.name,
          group: $scope.device.group,
          deviceid: $scope.device.deviceid,
          apikey: $scope.device.apikey
        }, function (device) {
          if (device.error) {
            $window.alert(device.error);
            return;
          }

          $scope.hideModal();
          $scope.device = null;
          _devices.push(device);
          $scope.devices = groupBy(_devices, 'group');
        }, function () {
          $window.alert('Add device failed! Please try again later.');
        });
      };

      $scope.showDevice = function (device) {
        query(device);

        $scope.activeDevice = device;
        $scope.showModal('#activeDevice');
      };

      $scope.saveDevice = function () {
        if (! $scope.activeDevice || ! $scope.activeDevice.name ||
          ! $scope.activeDevice.group) {
          $window.alert('Device name and group are required!');
          return;
        }

        $scope.activeDevice.$save(function (device) {
          if (device.error) {
            $window.alert(device.error);
            return;
          }

          $scope.hideModal();
          $scope.devices = groupBy(_devices, 'group');
          $scope.activeDevice = null;
        }, function () {
          $window.alert('Save device failed! Please try again later.');
        });
      };

      $scope.deleteDevice = function () {
        if (! $window.confirm('You really want to delete this device?')) {
          return;
        }

        $scope.activeDevice.$delete(function (device) {
          if (device.error) {
            $window.alert(device.error);
            return;
          }

          $scope.hideModal();
          _devices.splice(_devices.indexOf($scope.activeDevice), 1);
          $scope.devices = groupBy(_devices, 'group');
          $scope.activeDevice = null;
        }, function () {
          $window.alert('Delete device failed! Please try again later.');
        });
      };

      var groupBy = function (input, property) {
        if (! angular.isArray(input) || ! angular.isString(property)) {
          return input;
        }

        var group = {};

        angular.forEach(input, function (item) {
          var name = item[property];
          if (! name) {
            group['Default Group'] = group['Default Group'] || [];
            group['Default Group'].push(item);
            return;
          }

          group[name] = group[name] || [];
          group[name].push(item);
        });

        return group;
      };

      var query = function (device) {
        WS && WS.send({
          apikey: _apikey || User.getUser().apikey,
          deviceid: device.deviceid,
          action: 'query',
          params: []
        });
      };

      var update = function (device) {
        WS && WS.send({
          apikey: _apikey || User.getUser().apikey,
          deviceid: device.deviceid,
          action: 'update',
          params: device.params
        });
      };

      WS && WS.listen(function (data) {
        if (! ('params' in data)) {
          return;
        }

        _apikey = _apikey || User.getUser().apikey;
        if (data.apikey !== _apikey) {
          return;
        }

        if (data.deviceid !== $scope.activeDevice.deviceid) {
          return;
        }

        $scope.$apply(angular.extend($scope.activeDevice.params, data.params));
      });

      $scope.turnOn = function (device, property) {
        device.params = device.params || {};

        device.params[property] = 'on';
        update(device);
      };
      $scope.turnOff = function (device, property) {
        device.params = device.params || {};

        device.params[property] = 'off';
        update(device);
      };
    }
  ]);