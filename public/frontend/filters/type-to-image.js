angular.module('iotgo').
  filter('typeToImage', function () {
    var images = {
      '00': 'custom.png',
      '01': 'switch.png',
      '02': 'light.png',
      '03': 'sensor-temperature-humidity.png'
      };

    return function (value) {
     return images[value] || images['00'];
    };
  });