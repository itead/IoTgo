angular.module('iotgo').
  controller('SignupCtrl', [ '$scope', '$window', '$location', 'User',
    function ($scope, $window, $location, User) {
      $scope.register = function () {
        if (! $scope.email || ! $scope.password) {
          $window.alert('Email and Password must not be empty!');
          return;
        }

        if (! $scope.response) {
          $window.alert('Are you robot? Robot is not welcome here!');
          return;
        }

        User.register($scope.email, $scope.password, $scope.response, function (err) {
          if (err) {
            $window.alert(err);
            return;
          }

          $location.path('/devices');
        });
      };
    }
  ]);
