angular.module('iotgo').
  factory('Devices', [ '$resource', function ($resource) {
    return $resource('/api/admin/devices/:id', { id: '@deviceid' });
  } ]);