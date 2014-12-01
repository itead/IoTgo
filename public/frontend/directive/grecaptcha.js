angular.module('gRecaptcha', [])
  .directive('gRecaptcha', function () {
    return {
      require: 'ngModel',
      restrict: 'A',
      scope: {
        response: '=ngModel'
      },
      link: function (scope, el, attr) {
        sitekey = attr.gRecaptchaSitekey;
        if (! grecaptcha || ! sitekey) {
          return;
        }

        theme = attr.gRecaptchaTheme || 'light';
        type = attr.gRecaptchaType || 'image';

        grecaptcha.render(el[0], {
          sitekey: sitekey,
          theme: theme,
          type: type,
          callback: function (gRecaptchaResponse) {
            scope.response = gRecaptchaResponse;
          }
        });
      }
    };
  });