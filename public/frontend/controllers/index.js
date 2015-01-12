angular.module('iotgo').
  controller('IndexCtrl', [ '$scope',
    function ($scope) {
      $scope.slides = [{
        href: 'https://github.com/itead/IoTgo',
        src: '/images/home/slideshow/iot.jpg'
      }/*, {
        href: 'https://www.google.com',
        src: '/images/home/slideshow/1.jpg'
      }, {
        href: 'https://imall.iteadstudio.com',
        src: '/images/home/slideshow/2.jpg'
      }*/];
    }
  ]);