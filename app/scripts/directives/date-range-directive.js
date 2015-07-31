'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:date-range
 * @description
 * # date-range
 */
angular.module('otaniemi3dApp')
  .directive('dateRange', function () {
    return {
      restrict: 'EA',
      link: function postLink(scope, element, attrs) {

        var params = scope.$eval(attrs.ngModel);
        if (params) {
          params.begin = null;
          params.end = null;
        }

        element.dateRangePicker({
          inline: true,
          container: element,
          alwaysOpen: true,
          singleMonth: true,
	        showShortcuts: false,
          startOfWeek: 'monday'
        })
        .bind('datepicker-change', function (_, dates) {
          if (params) {
            params.begin = dates.date1;
            params.end = dates.date2;
          }
        });

        element.find('.footer').remove();

        scope.$on('destroy', function () {
          element.data('dateRangePicker').destroy();
        });
      }
    };
  });
