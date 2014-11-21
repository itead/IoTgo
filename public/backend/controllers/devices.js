angular.module('iotgo').
  controller('DevicesCtrl', [ '$scope', '$window', 'Devices',
    function ($scope, $window, Devices) {
      $scope.quickSearch = function () {
        if (! $scope.deviceid) {
          $window.alert('Device ID must be specified!');
          return;
        }

        _search({ deviceid: $scope.deviceid });
      };

      $scope.advancedSearch = function () {
        _search($scope.search);
      };

      $scope.resetSearch = function () {
        $scope.search = null;
      };

      var _search = function (query) {
        Devices.query(query, function (devices) {
          if (devices.error) {
            $window.alert(devices.error);
            return;
          }

          $scope.devices = devices;
        }, function () {
          $window.alert('Error occurs! Please try again later.');
        });
      };

      _search({ limit: 50 });
    }
  ]);