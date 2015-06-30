'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:highcharts
 * @description
 * # highcharts
 */
angular.module('otaniemi3dApp')
  .directive('highcharts', function ($window) {
    return {
      template: '<div></div>',
      restrict: 'E',
      scope: {
        config: '='
      },
      link: function postLink(scope, element) {
        var defaultOptions = {
          chart: {
            events: {}
          },
          title: {},
          subtitle: {},
          series: [],
          credits: {},
          plotOptions: {},
          navigator: {enabled: false}
        };

        var options = merge(defaultOptions, scope.config);

        options.chart.renderTo = element[0];
        var chart = new $window.Highcharts.Chart(options);

        scope.$watch('config', function() {
          console.log('a');
        }, true);

        scope.$watch('config.series', function(newSeries) {
          if (chart.series.length > 0 && angular.isArray(newSeries)) {
            for (var i = 0; i < chart.series.length; i++) {
              chart.series[i].remove();
            }
            for (var j = 0; j < newSeries.length; j++) {
              chart.addSeries(newSeries[j]);
            }
            chart.redraw();
          }
        }, true);

        scope.$watch('config.title', function(newTitle) {
          chart.setTitle(newTitle, true);
        }, true);

        angular.forEach(['xAxis', 'yAxis'], function(axisName) {
          scope.$watch('config.' + axisName, function(newAxes, oldAxes) {
            if (newAxes === oldAxes || !newAxes) {
              return;
            }
            if (angular.isArray(newAxes)) {
              for (var i = 0; i < newAxes.length; i++) {
                var axis = newAxes[i];
                if (i < chart[axisName].length) {
                  chart[axisName][i].update(axis, false);
                }
              }
            } else {
              // update single axis
              chart[axisName][0].update(newAxes, false);
            }
            chart.redraw();
          }, true);
        });
      }
    };
  });


function merge(dst) {
  return baseExtend(dst, [].slice.call(arguments, 1), true);
}

function baseExtend(dst, objs) {
  var h = dst.$$hashKey;

  for (var i = 0, ii = objs.length; i < ii; ++i) {
    var obj = objs[i];
    if (!angular.isObject(obj) && !angular.isFunction(obj)) {
      continue;
    }
    var keys = Object.keys(obj);
    for (var j = 0, jj = keys.length; j < jj; j++) {
      var key = keys[j];
      var src = obj[key];

      if (angular.isObject(src)) {
        if (angular.isDate(src)) {
          dst[key] = new Date(src.valueOf());
        } else {
          if (!angular.isObject(dst[key])) {
            dst[key] = angular.isArray(src) ? [] : {};
          }
          baseExtend(dst[key], [src]);
        }
      } else {
        dst[key] = src;
      }
    }
  }

  if (h) {
    dst.$$hashKey = h;
  } else {
    delete dst.$$hashKey;
  }

  return dst;
}
