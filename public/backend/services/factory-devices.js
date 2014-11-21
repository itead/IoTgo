angular.module('iotgo').
  factory('FactoryDevices', [ '$resource', function ($resource) {
      return $resource('/api/admin/factorydevices', { id: '@deviceid' }, {
        create: {
          method: 'POST',
          url: '/api/admin/factorydevices/create',
          isArray: true
        }
      });
    } ]);