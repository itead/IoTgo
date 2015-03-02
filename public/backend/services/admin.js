angular.module('iotgo')
  .factory('Admin', ['$http', '$window', function ($http, $window) {
    var session = undefined;
    return {
      login: function (email, password, callback) {
        $http.post('/api/admin/login', {email: email, password: password}).
          success(function (data) {
            if (data.error) {
              callback(data.error);
              return;
            }
            session = data;
            $window.sessionStorage.adminToken = session.jwt;
            callback(undefined, session.user);
          }).
          error(function () {
            callback('Log in failed!');
          });
      },
      logout: function () {
        session = undefined;
        $window.sessionStorage.adminToken = undefined;
      },
      isLoggedIn: function () {
        return session ? true : false;
      },
      getAdmin: function () {
        return session ? session.user : {};
      },
      checkVersion: function (callback) {
        $http.get('/api/admin/checkUpdate').
          success(function (data) {
            if (data.error) {
              callback(data.error);
              return;
            }
            callback(null, data);
          }).
          error(function () {
            callback('check Upgrade Failed');
          });
      }
    };
  }]);