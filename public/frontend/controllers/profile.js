angular.module('iotgo').
  controller('ProfileCtrl', ['$scope', '$window', '$location', 'User',
    function ($scope, $window, $location, User) {
      if (!User.isLoggedIn()) {
        $window.alert('Restricted area, please login first!');
        $location.path('/login');
        return;
      }

      $scope.getEmail = function () {
        return User.getUser().email;
      };

      var isActive = User.isActive();
      if (isActive) {
        $('#checkActiveDiv').hide();
      } else {
        $('#checkActiveDiv').show();
        var isExpire = User.isExpire();
        if (isExpire) {
          $('#checkActiveSpan').show();
        }
      }
      $scope.isDisabled = !isActive;

      $scope.getApikey = function () {
        return User.getUser().apikey;
      };

      $scope.setPassword = function () {
        User.setPassword($scope.oldPassword, $scope.newPassword,
          function (err) {
            if (err) {
              $window.alert(err);
              return;
            }

            $window.alert('Password changed! Please log in again!');
            User.logout();
            $location.path('/login');
          });
      };
    }
  ]);