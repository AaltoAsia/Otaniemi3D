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
          '<tr>',
            '<th colspan="2" style="text-align:center">{{tooltip.room}}</th>',
          '</tr>',
          '<tr ng-repeat="sensor in tooltip.sensors"',
              'ng-style="{\'background-color\': sensor.color}">',
            '<th>{{sensor.name}}</th>',
            '<td>{{sensor.values[0].value}} {{sensor.suffix}}</td>',
          '</tr>',
          '<tr>',
            '<td colspan="2">',
              '<i>Click to lock the tooltip</i>',
            '</td>',
          '</tr>',
        '</table>'
      ].join(''),
      scope: {
        sensorData: '='
      },
      controller: function () {
        this.sensors = [];
        this.room = '';
      },
      controllerAs: 'tooltip',
      bindToController: true,
      link: function postLink(scope, element, attrs, tooltipCtrl) {

        function showTooltip(d) {
          d3.select(element[0]).style('display', null);

          if (!d) {
            return;
          }

          scope.$apply(function () {
            tooltipCtrl.sensors = [];
            tooltipCtrl.room = '';

            if (d.sensors.length) {
              for (var i = 0; i < d.sensors.length; i++) {
                tooltipCtrl.sensors.push(d.sensors[i]);
              }
            }

            if (d.room) {
              tooltipCtrl.room = d.room;
            }

          });
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

          d3.select(element[0]).style('left',
              (d3.event.pageX) + 'px')
            .style('right', 'auto');
        }

        function hideTooltip() {
          d3.select(element[0]).style('display', 'none');
        }

        function lockTooltip() {
          // body...
        }

        d3.select(element[0]).style('display', 'none');

        d3.select(element.parent()[0])
          .selectAll('[data-room-id]')
            .on('mouseover', showTooltip)
            .on('mousemove', moveTooltip)
            .on('mouseout', hideTooltip);

        scope.$on('$destroy', function () {
          d3.select(element.parent()[0])
            .selectAll('[data-room-id]')
              .on('.mouseover', null)
              .on('.mousemove', null)
              .on('.mouseout', null);
        });

      }
    };
  });
