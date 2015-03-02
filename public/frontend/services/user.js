angular.module('iotgo')
  .factory('User', ['$http', '$window', 'Settings', function ($http, $window, Settings) {
    var session = undefined;
    return {
      register: function (email, password, response, callback) {
        $http.post(Settings.httpServer + '/api/user/register',
          {email: email, password: password, response: response}).
          success(function (data) {
            if (data.error) {
              callback(data.error);
              return;
            }

            session = data;
            $window.sessionStorage.token = session.jwt;
            callback(undefined, session.user);
          }).
          error(function () {
            callback('Register user failed!');
          });
      },
      login: function (email, password, callback) {
        $http.post(Settings.httpServer + '/api/user/login', {email: email, password: password}).
          success(function (data) {
            if (data.error) {
              callback(data.error);
              return;
            }

            session = data;
            $window.sessionStorage.token = session.jwt;
            callback(undefined, session.user);
          }).
          error(function () {
            callback('Log in failed!');
          });
      },
      logout: function () {
        session = undefined;
        $window.sessionStorage.token = undefined;
      },
      isLoggedIn: function () {
        return session ? true : false;
      },
      setPassword: function (oldPassword, newPassword, callback) {
        $http.post(Settings.httpServer + '/api/user/password',
          {oldPassword: oldPassword, newPassword: newPassword}).
          success(function (data) {
            if (data.error) {
              callback(data.error);
              return;
            }

            callback(undefined);
          }).
          error(function () {
            callback('Change password failed!');
          });
      },
      getUser: function () {
        return session ? session.user : {};
      },
      isActive: function () {
        var token = $window.sessionStorage.token;
        if (!token) {
          return false;
        }
        var info = token.substring(token.indexOf('.') + 1, token.lastIndexOf('.'));
        var decodedData = $window.atob(info);
        var json = JSON.parse(decodedData);
        return !!(json.isActivated);
      },
      isExpire: function () {
        var token = $window.sessionStorage.token;
        if (!token) {
          return false;
        }
        var info = token.substring(token.indexOf('.') + 1, token.lastIndexOf('.'));
        var decodedData = $window.atob(info);
        var json = JSON.parse(decodedData);
        if (!json.isActivated) {
          return Date.now() > new Date(json.validExpire).getTime();
        }
        return false;
      },
      activeAccount: function (callback) {
        $http.get('/api/user/activeAccount').
          success(function (data) {
            callback(data);
          }).
          error(function () {
            callback('Active Account failed,Please retry!');
          });
      }
    };
  }]);