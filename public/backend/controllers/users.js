angular.module('iotgo').
  controller('UsersCtrl', [ '$scope', '$window', '$location', 'Users',
    function ($scope, $window, $location, Users) {
      $scope.quickSearch = function () {
        if (! $scope.email) {
          $window.alert('Device ID must be specified!');
          return;
        }

        _search({ email: $scope.email });
      };

      $scope.advancedSearch = function () {
        _search($scope.search);
      };

      $scope.resetSearch = function () {
        $scope.search = null;
      };

      $scope.goToUser = function (user) {
        $location.path('/admin/users/' + user.apikey);
      };

      $scope.delete = function (user) {
        if (! $window.confirm('Watch out! This action will delete user ' +
            user.email + ' and all he/she\' devices.')) {
          return;
        }

        user.$delete(function (result) {
          if (result.error) {
            $window.alert(result.error);
            return;
          }

          $scope.users.splice($scope.users.indexOf(user), 1);
        }, function () {
          $window.alert('Delete user ' + user.email +
            ' failed! Please try again later');
        });
      };

      var _search = function (query) {
        Users.query(query, function (users) {
          if (users.error) {
            $window.alert(users.error);
            return;
          }

          $scope.users = users;
        }, function () {
          $window.alert('Error occurs! Please try again later.');
        });
      };

      _search({ limit: 50 });
    }
  ]);