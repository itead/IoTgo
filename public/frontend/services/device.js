angular.module('iotgo').
  factory('Device', [ '$resource', function ($resource) {
    return $resource('/api/user/device/:id', { id: '@deviceid' }, {
      add: { method: 'POST', url: '/api/user/device/add' }
    });
  } ]);