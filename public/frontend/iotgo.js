angular.module('iotgo', [ 'ngRoute', 'ngResource' ]).
  config([ '$routeProvider', '$locationProvider', '$httpProvider',
    function ($routeProvider, $locationProvider, $httpProvider) {
      $routeProvider.
        when('/', {
          templateUrl: '/views/index.html',
          controller: 'IndexCtrl'
        }).
        when('/login', {
          templateUrl: '/views/login.html',
          controller: 'LoginCtrl'
        }).
        when('/signup', {
          templateUrl: '/views/signup.html',
          controller: 'SignupCtrl'
        }).
        when('/profile', {
          templateUrl: '/views/profile.html',
          controller: 'ProfileCtrl'
        }).
        when('/devices', {
          templateUrl: '/views/devices.html',
          controller: 'DevicesCtrl'
        }).
        otherwise({
          redirectTo: '/'
        });

      $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
      });

      $httpProvider.interceptors.push('authInterceptor');
    }
  ]);