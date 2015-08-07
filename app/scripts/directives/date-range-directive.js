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
      scope: {
        ngModel: '=',
        current: '='
      },
      link: function postLink(scope, element) {

        var params = scope.ngModel;
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

        scope.$watch('current', function (newDate) {
          if (newDate) {
            var begin = newDate.begin || new Date().toISOString();
            var end = newDate.end || new Date().toISOString();
            begin = begin.split('T')[0];
            end = end.split('T')[0];
            console.log(newDate.begin);
            console.log(end);

            element.data('dateRangePicker')
              .setDateRange(begin, end);
          }
        });

        scope.$on('destroy', function () {
          element.data('dateRangePicker').destroy();
        });
      }
    };
  });
