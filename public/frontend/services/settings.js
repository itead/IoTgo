angular.module('iotgo')

.factory('Settings', [ '$location', function ($location) {
  var host = $location.host() + ':' + $location.port();

  return {
    httpServer: 'http://' + host + '/api/http',
    websocketServer: 'ws://' + host + '/api/ws'
  };
} ]);