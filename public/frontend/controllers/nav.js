angular.module('iotgo')
  .controller('NavCtrl', [ '$scope', 'User',
    function ($scope, User) {
      $scope.isLoggedIn = User.isLoggedIn;
      $scope.logout = User.logout;
    }
  ]);