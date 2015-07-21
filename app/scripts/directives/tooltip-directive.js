'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:tooltip
 * @description
 * # tooltip
 */
angular.module('otaniemi3dApp')
  .directive('tooltip', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/tooltip.html',
      scope: {
        nodeSelector: '@'
      },
      link: function postLink(scope, element) {

        function showTooltip(d) {
          d3.select(element[0]).style('display', null);
          if (d) {
            scope.sensors = d.sensors;
          }
        }

        function moveTooltip() {
          if (d3.event.pageY > window.innerHeight /2) {
            d3.select(element[0]).style('bottom',
                (window.innerHeight - d3.event.pageY) + 'px')
              .style('top', 'auto');
          }
          else {
            d3.select(element[0]).style('top',
                (d3.event.pageY - 10) + 'px')
              .style('bottom', 'auto');
          }
          if (d3.event.pageX > window.innerWidth /2) {
            d3.select(element[0]).style('right',
                (window.innerWidth - d3.event.pageX) + 'px')
              .style('left', 'auto');
          }
          else {
            d3.select(element[0]).style('left',
                (d3.event.pageX) + 'px')
              .style('right', 'auto');
          }
        }

        function hideTooltip() {
          d3.select(element[0]).style('display', 'none');
        }

        d3.select(element[0]).style('display', 'none');

        d3.select(element.parent()[0])
          .selectAll(scope.nodeSelector)
            .on('mouseover', showTooltip)
            .on('mousemove', moveTooltip)
            .on('mouseout', hideTooltip);

        scope.$on('$destroy', function () {
          d3.select(element.parent()[0])
            .selectAll(scope.nodeSelector)
              .on('.mouseover', null)
              .on('.mousemove', null)
              .on('.mouseout', null);
        });

      },
      controller: function () {
        this.sensors = [];
      },
      controllerAs: 'tooltip'
    };
  });
