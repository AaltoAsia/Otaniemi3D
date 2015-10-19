'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:tooltip
 * @description
 * # tooltip
 */
angular.module('otaniemi3dApp')
  .directive('tooltip', function ($state, valueConverter, omiMessage) {
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
            '<td>',
              '<span>',
                '{{sensor.values[0].value}} {{sensor.suffix}}',
              '</span>',
		          '<button ng-click="tooltip.togglePlug(sensor)"',
      	              'ng-if="sensor.metaData.isWritable"',
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
      controller: function ($scope) {
        var self = this;
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

        this.togglePlug = function (sensor) {
          //toggle sensor state between 1 and 0
          var newValue = 1 - sensor.values[0].value;

          var writeRequest =
            '<?xml version="1.0"?>'+
            '<omi:omiEnvelope xmlns:xs="http://www.w3.org/2001/XMLSchema-instance" xmlns:omi="omi.xsd" version="1.0" ttl="0">'+
              '<write xmlns="omi.xsd" msgformat="odf">'+
                '<omi:msg>'+
                  '<Objects xmlns="odf.xsd">'+
                    '<Object>'+
                      '<id>K1</id>'+
                      '<Object>'+
                        '<id>'+ sensor.roomId +'</id>'+
                        '<InfoItem name="'+ sensor.mac +'">'+
                          '<value>'+ newValue +'</value>'+
                        '</InfoItem>'+
                      '</Object>'+
                    '</Object>'+
                  '</Objects>'+
                '</omi:msg>'+
              '</write>'+
            '</omi:omiEnvelope>';

          omiMessage.send('write', writeRequest);
        };
      },
      controllerAs: 'tooltip',
      bindToController: true,
      link: function postLink(scope, element, attrs, tooltipCtrl) {

        function getMetaData(datum) {
          // Request must follow JXON notation and comply with ODF.
          // https://developer.mozilla.org/en-US/docs/JXON
          var metaDataRequest = {
            'Object': {
              'id': {
                'keyValue': 'K1'
              },
              'Object': {
                'id': {
                  'keyValue': datum.roomId
                },
                'InfoItem': []
              }
            }
          };

          for (var i = 0; i < datum.sensors.length; i++) {
            metaDataRequest.Object.Object.InfoItem.push({
              '@name': datum.sensors[i].type,
              'MetaData': {
                'keyValue': null
              }
            });
          }

          //Mark room's datum.metaData true to indicate that meta data was requested
          datum.metaData = true;

          omiMessage.send('read', metaDataRequest, {}, '', false)
            .then(function (data) {
              //Update sensors' meta data
              for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < datum.sensors.length; j++) {
                  if (data[i].id === datum.sensors[j].id) {
                    if (data[i].metaData) {
                      datum.sensors[j].metaData = data[i].metaData;
                    }
                    break;
                  }
                }
              }
            }, function (error) {
              console.log('Error while fetching sensor metadata:', error);
            });
        }

        function showTooltip(datum) {
          d3.select(element[0]).style('display', null);

          if (datum && !datum.metaData) {
            getMetaData(datum);
          }
        }

        function moveTooltip(datum) {
          if (tooltipCtrl.isLocked) {
            return;
          }

          showTooltip(datum);

          if (datum) {
            tooltipCtrl.caption = 'Click to lock the tooltip';

            scope.$apply(function () {
              tooltipCtrl.sensors = [];
              tooltipCtrl.room = '';

              if (datum.sensors.length) {
                for (var i = 0; i < datum.sensors.length; i++) {
                  var sensor = datum.sensors[i];
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

              if (datum.room) {
                tooltipCtrl.room = datum.room;
              }
              if (datum.roomId) {
                tooltipCtrl.roomId = datum.roomId;
                if (tooltipCtrl.roomsWithPanorama.indexOf(datum.roomId) > -1) {
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
