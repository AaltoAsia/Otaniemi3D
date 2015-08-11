'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:tooltip
 * @description
 * # tooltip
 */
angular.module('otaniemi3dApp').directive('tooltip', function ($state, heatmapService) {
  return {
    restrict: 'E',
    template: '<table class="tooltip-table">\n          <tr>\n            <th colspan="2" style="text-align:center">{{tooltip.room}}</th>\n          </tr>\n          <tr ng-repeat="sensor in tooltip.sensors | orderBy: \'name\'"\n              ng-style="{\'background-color\': sensor.color}">\n            <th>{{sensor.name}}</th>\n            <td>{{sensor.values[0].value}} {{sensor.suffix}}</td>\n          </tr>\n          <tr>\n            <td colspan="2">\n              <button ng-click="tooltip.openPanorama(tooltip.roomId)"\n                      ng-show="tooltip.hasPanorama"\n                      class="btn black-btn panorama-btn">\n                360°\n                <span class="glyphicon glyphicon glyphicon-camera"></span>\n              </button>\n              <i class="tooltip-caption">{{tooltip.caption}}\n              </i>\n            </td>\n          </tr>\n        </table>',
    scope: {
      sensorType: '='
    },
    controller: function controller() {
      this.sensors = [];
      this.room = '';
      this.roomId = '';
      this.caption = 'Downloading sensor data...';
      this.isLocked = false;
      this.roomsWithPanorama = ['Room-238d', 'Room-237c', 'Room-235', 'Room-232a', '2nd Floor Corridor Start', '2nd Floor Corridor Middle', '2nd Floor Corridor End', 'Corridor Cafeteria Side', 'Corridor Entrance Side', 'Cafeteria', 'Entrance'];
      this.hasPanorama = false;

      this.openPanorama = function (roomId) {
        $state.go('panorama', { roomId: roomId });
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
                  color = heatmapService.getColor(sensor.type, value);
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

        if (d3.event.pageY > window.innerHeight / 2) {
          d3.select(element[0]).style('bottom', window.innerHeight - d3.event.pageY + 'px').style('top', 'auto');
        } else {
          d3.select(element[0]).style('top', d3.event.pageY - 10 + 'px').style('bottom', 'auto');
        }

        d3.select(element[0]).style('left', d3.event.pageX + 'px').style('right', 'auto');
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

      d3.select(element.parent()[0]).selectAll('[data-room-id]').on('mouseover', showTooltip).on('mousemove', moveTooltip).on('mouseout', hideTooltip).on('mouseup', lockTooltip);

      d3.select(element.parent()[0]).select('#floorplan').on('mousedown.tooltip', unlockTooltip);

      scope.$on('$destroy', function () {
        d3.select(element.parent()[0]).selectAll('[data-room-id]').on('mouseover', null).on('mousemove', null).on('mouseout', null).on('click', null);
      });
    }
  };
});
