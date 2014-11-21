angular.module('iotgo').
  factory('Users', [ '$resource', function ($resource) {
    return $resource('/api/admin/users/:id', { id: '@apikey' });
  } ]);