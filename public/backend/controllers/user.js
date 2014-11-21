angular.module('iotgo').
  controller('UserCtrl', [ '$scope', '$routeParams', '$window',
    '$location', 'Users', 'Devices',
    function ($scope, $routeParams, $window, $location, Users, Devices) {
      Users.get({ id: $routeParams.apikey }, function (user) {
        if (user.error) {
          $window.alert(user.error);
          return;
        }

        $scope.user = user;
      }, function () {
        $window.alert('Error occurs! Please try again later.');
      });

      Devices.query({ apikey: $routeParams.apikey }, function (devices) {
        if (devices.error) {
          $window.alert(devices.error);
          return;
        }

        $scope.devices = groupBy(devices, 'group');
      }, function () {
        $window.alert('Error occurs! Please try again later.');
      });

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

      $scope.delete = function () {
        if (! $scope.user) {
          return;
        }

        if (! $window.confirm('Watch out! This action will delete user ' +
          $scope.user.email + ' and all he/she\' devices.')) {
          return;
        }

        $scope.user.$delete(function (result) {
          if (result.error) {
            $window.alert(result.error);
            return;
          }

          $location.path('/admin/users');
        }, function () {
          $window.alert('Delete user ' + $scope.user.email +
          ' failed! Please try again later');
        });
      };

      $scope.showDevice = function (device) {
        $scope.activeDevice = device;
        angular.element('#activeDevice').modal();
      };
    }
  ]);