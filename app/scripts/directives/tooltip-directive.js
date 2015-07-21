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
      template: [
        '<table id="infocontent" class="tooltip-table">',
          '<caption>',
            '<i>Click to lock the tooltip in place</i>',
          '</caption>',
          '<p>',
            '{{sensors}}',
            '{{heatmap.sensors}}',
            '{{tooltip.sensors}}',
          '</p>',
          '<tr>',
            '<th colspan="2">{{tooltip.room}}</th>',
          '</tr>',
          '<tr ng-repeat="sensor in tooltip.sensors"',
              'ng-style="{\'background-color\': tooltip.sensor.color}">',
            '<th>{{sensor.name}} {{sensor.id}}</th>',
            '<td>{{sensor.values[0].value}} {{sensor.suffix}}</td>',
          '</tr>',
        '</table>'
      ].join(''),
      scope: {
        nodeSelector: '@'
      },
      controller: function ($scope) {
        $scope.sensors = [];
        this.room = '';
      },
      controllerAs: 'tooltip',
      bindToController: true,
      link: function postLink(scope, element, attrs, tooltipCtrl) {

        function showTooltip(d) {
          d3.select(element[0]).style('display', null);
          console.log(d.sensors);
          if (d) {
            tooltipCtrl.sensors = d.sensors;
            tooltipCtrl.room = d.room;
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
          .selectAll(tooltipCtrl.nodeSelector)
            .on('mouseover', showTooltip)
            .on('mousemove', moveTooltip)
            .on('mouseout', hideTooltip);

        scope.$on('$destroy', function () {
          d3.select(element.parent()[0])
            .selectAll(tooltipCtrl.nodeSelector)
              .on('.mouseover', null)
              .on('.mousemove', null)
              .on('.mouseout', null);
        });

      }
    };
  });
