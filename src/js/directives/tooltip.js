'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:tooltip
 * @description
 * # tooltip
 */
angular.module('otaniemi3dApp')
  .directive('tooltip', function ($state, valueConverter) {
    return {
      restrict: 'E',
      template: [
        '<table class="tooltip-table">',
          '<tr>',
            '<th colspan="2" style="text-align:center">{{tooltip.room}}</th>',
          '</tr>',
          '<tr ng-repeat="sensor in tooltip.sensors | orderBy: \'name\'"',
              'ng-style="{\'background-color\': sensor.color}">',
            '<th>{{sensor.name}}</th>',
            '<td>{{sensor.values[0].value}} {{sensor.suffix}}',
		    '<button ng-click="sensor.togglePlug(tooltip.roomId, sensor.name, sensor.values[0].value)"',
	              'ng-show="sensor.isPlug"',
	              'class="btn black-btn panorama-btn">',
		      'Toggle',
		    '</button>',
	    '</td>',
          '</tr>',
          '<tr>',
            '<td colspan="2">',
              '<button ng-click="tooltip.openPanorama(tooltip.roomId)"',
                      'ng-show="tooltip.hasPanorama"',
                      'class="btn black-btn panorama-btn">',
                '360°',
                '<span class="glyphicon glyphicon glyphicon-camera"></span>',
              '</button>',
              '<i class="tooltip-caption">{{tooltip.caption}}',
              '</i>',
            '</td>',
          '</tr>',
        '</table>',
      ].join(''),
      scope: {
        sensorType: '='
      },
      controller: function () {
        this.sensors = [];
        this.room = '';
        this.roomId = '';
        this.caption = 'Downloading sensor data...';
        this.isLocked = false;
        this.roomsWithPanorama = [
          'Room-147a', 'Room-238d','Room-237c','Room-235','Room-232a',
          '2nd Floor Corridor Start',
          '2nd Floor Corridor Middle',
          '2nd Floor Corridor End',
          'Corridor Cafeteria Side',
          'Corridor Entrance Side',
          'Cafeteria',
          'Entrance'
        ];
        this.hasPanorama = false;

        this.openPanorama = function (roomId) {
          $state.go('panorama', {roomId: roomId});
        };
      },
      controllerAs: 'tooltip',
      bindToController: true,
      link: function postLink(scope, element, attrs, tooltipCtrl) {

        function showTooltip() {
          d3.select(element[0]).style('display', null);
        }

        function moveTooltip(d) {
          if (tooltipCtrl.isLocked) {
            return;
          }

          showTooltip();

          if (d) {
            tooltipCtrl.caption = 'Click to lock the tooltip';

            scope.$apply(function () {
              tooltipCtrl.sensors = [];
              tooltipCtrl.room = '';

              if (d.sensors.length) {
                for (var i = 0; i < d.sensors.length; i++) {
                  var sensor = d.sensors[i];
                  var value = sensor.values[0].value;
                  var color = {};

                  if (sensor.type === tooltipCtrl.sensorType.name) {
                    color = valueConverter.getColor(sensor.type, value);
                  } else {
                    color.rgbaString = '';
                  }

                  sensor.color = color.rgbaString;
                  tooltipCtrl.sensors.push(sensor);
                }
              }

              if (d.room) {
                tooltipCtrl.room = d.room;
              }
              if (d.roomId) {
                tooltipCtrl.roomId = d.roomId;
                if (tooltipCtrl.roomsWithPanorama.indexOf(d.roomId) > -1) {
                  tooltipCtrl.hasPanorama = true;
                } else {
                  tooltipCtrl.hasPanorama = false;
                }
              }

            });
          }

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
          if (tooltipCtrl.isLocked) {
            return;
          }
          d3.select(element[0]).style('display', 'none');
        }

        function lockTooltip() {
          tooltipCtrl.isLocked = false;
          moveTooltip();
          tooltipCtrl.isLocked = true;
          d3.event.preventDefault();
        }

        function unlockTooltip() {
          if (!d3.event.defaultPrevented) {
            tooltipCtrl.isLocked = false;
            hideTooltip();
          }
        }

        d3.select(element[0]).style('display', 'none');

        d3.select(element.parent()[0])
          .selectAll('[data-room-id]')
            .on('mouseover', showTooltip)
            .on('mousemove', moveTooltip)
            .on('mouseout', hideTooltip)
            .on('mouseup', lockTooltip);

        d3.select(element.parent()[0]).select('#floorplan')
          .on('mousedown.tooltip', unlockTooltip);

        scope.$on('$destroy', function () {
          d3.select(element.parent()[0])
            .selectAll('[data-room-id]')
              .on('mouseover', null)
              .on('mousemove', null)
              .on('mouseout', null)
              .on('click', null);
        });

      }
    };
  });
