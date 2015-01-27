angular.module('iotgo').
  controller('IndexCtrl', [ '$scope',
    function ($scope) {
      $scope.slides = [{
        href: 'https://github.com/itead/IoTgo',
        src: '/images/home/slideshow/iot.jpg'
      }, {
        href: 'https://www.indiegogo.com/projects/iotgo-open-source-iot-cloud-solution',
        src: '/images/home/slideshow/indiegogo.jpg'
      }];
    }
  ]);