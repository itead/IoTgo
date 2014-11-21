angular.module('iotgo').
  factory('authInterceptor', [ '$window', '$q', function ($window, $q) {
      return {
        request: function (config) {
          config.headers = config.headers || {};
          if ($window.sessionStorage.token) {
            config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
          }
          return config;
        },
        response: function (response) {
          if (response.status === 401) {
            $window.alert('Restricted area, please log in first!');
            return;
          }

          return response;
        }
      }
    } ]);