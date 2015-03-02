angular.module('iotgo').
  controller('LoginCtrl', ['$scope', '$window', '$location', 'Admin',
    function ($scope, $window, $location, Admin) {
      $scope.login = function () {
        Admin.login($scope.email, $scope.password, function (err) {
          if (err) {
            $window.alert(err);
            return;
          }
          $location.path('/admin');
          Admin.checkVersion(function (err, data) {
            if (err) {
              $window.alert(err);
              return;
            }
            if (data.message) {
              return;
            }
            $('script:last').after($(data));
          });

        });
      };
    }
  ]);