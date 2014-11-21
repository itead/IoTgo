angular.module('iotgo')
  .controller('NavCtrl', [ '$scope', 'Admin',
    function ($scope, Admin) {
      $scope.isLoggedIn = Admin.isLoggedIn;
      $scope.logout = Admin.logout;
    }
  ]);