angular.module('iotgo').
  controller('FactoryDevicesCtrl', [ '$scope', '$window', 'FactoryDevices',
    function ($scope, $window, FactoryDevices) {
      $scope.batchCreate = function () {
        if (! $scope.batch || ! $scope.batch.name ||
            ! $scope.batch.type || ! $scope.batch.qty) {
          $window.alert('Please specify Batch Name, Device Type and Quantity.');
          return;
        }

        if (! /^[0-9a-f]{2}$/.test($scope.batch.type)) {
          $window.alert('Device Type must be two lowercase hexadecimal characters!');
          return;
        }

        FactoryDevices.create({
          name: $scope.batch.name,
          type: $scope.batch.type,
          qty: $scope.batch.qty
        }, function (factoryDevices) {
          if (factoryDevices.error) {
            $window.alert(factoryDevices.error);
            return;
          }

          var filename = $scope.batch.name + '-' +
            $scope.batch.type + '-' + $scope.batch.qty + '.csv';
          _download(factoryDevices, filename);

          $scope.batch = null;
          _search($scope.search);
        }, function () {
          $window.alert('Error occurs! Please try again later.');
        });
      };

      $scope.advancedSearch = function () {
        _search($scope.search);
      };

      $scope.resetSearch = function () {
        $scope.search = null;
      };

      var _search = function (query) {
        FactoryDevices.query(query, function (devices) {
          if (devices.error) {
            $window.alert(devices.error);
            return;
          }

          $scope.devices = devices;
        }, function () {
          $window.alert('Error occurs! Please try again later.');
        });
      };

      var _download = function (factoryDevices, filename) {
        var data = [[ 'name', 'type', 'deviceid', 'apikey' ]];
        factoryDevices.forEach(function (device) {
          data.push([
            device.name, device.type, device.deviceid, device.apikey
          ]);
        });
        data.forEach(function (item, index) {
          data[index] = item.join(', ');
        });

        var file = new Blob([data.join('\r\n')], { type : 'text/csv' });
        var hiddenElement = document.createElement('a');
        hiddenElement.href = (window.URL || window.webkitURL).createObjectURL(file);
        hiddenElement.target = '_blank';
        hiddenElement.download = filename;
        hiddenElement.click();
      };

      _search({ limit: 50 });
    }
  ]);