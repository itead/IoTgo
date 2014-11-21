angular.module('iotgo', [ 'ngRoute', 'ngResource' ]).
  config([ '$routeProvider', '$locationProvider', '$httpProvider',
    function ($routeProvider, $locationProvider, $httpProvider) {
      $routeProvider.
        when('/admin', {
          templateUrl: '/admin/views/index.html',
          controller: 'IndexCtrl'
        }).
        when('/admin/login', {
          templateUrl: '/admin/views/login.html',
          controller: 'LoginCtrl'
        }).
        when('/admin/users', {
          templateUrl: '/admin/views/users.html',
          controller: 'UsersCtrl'
        }).
        when('/admin/users/:apikey', {
          templateUrl: '/admin/views/user.html',
          controller: 'UserCtrl'
        }).
        when('/admin/devices', {
          templateUrl: '/admin/views/devices.html',
          controller: 'DevicesCtrl'
        }).
        when('/admin/factory-devices', {
          templateUrl: '/admin/views/factory-devices.html',
          controller: 'FactoryDevicesCtrl'
        }).
        otherwise({
          redirectTo: '/admin'
        });

      $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
      });

      $httpProvider.interceptors.push('authInterceptor');
    }
  ]);