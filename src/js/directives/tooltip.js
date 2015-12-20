'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:tooltip
 * @description
 * # tooltip
 */
angular.module('otaniemi3dApp')
  .directive('tooltip', function ($state, valueConverter, omiMessage, $timeout) {
    return {
      restrict: 'E',
      template: [
        '<table class="tooltip-table">',
          '<tr>',
            '<th colspan="2" style="text-align:center">',
              '<span>{{tooltip.room.id | roomName}}</span>',
              '<span style="float: right">',
                '<span class="loading-spinner"',
                      'ng-style="{\'opacity\': tooltip.isLoading ? 1 : 0}">',
                  '<span class="spinner-icon"></span>',
                '</span>',
                '<button class="btn refresh-btn"',
                        'ng-click="tooltip.refresh()"',
                        'title="Refresh">',
                  '<span class="glyphicon glyphicon-refresh"></span>',
                '</button>',
              '</span>',
            '</th>',
          '</tr>',
          '<tr>',
            '<td colspan="2">',
              '<sensor-tree id="sensor-tree"',
                'odf-object="tooltip.room">',
              '</sensor-tree>',
            '</td>',
          '</tr>',
          '<tr>',
            '<td colspan="2">',
              '<button ng-click="tooltip.openPanorama(tooltip.room)"',
                      'ng-show="tooltip.hasPanorama"',
                      'class="btn black-btn panorama-btn"',
                      'title="Open panorama picture">',
                '360°',
                '<span class="glyphicon glyphicon-camera"></span>',
              '</button>',
              '<i class="tooltip-caption">{{tooltip.caption}}',
              '</i>',
            '</td>',
          '</tr>',
        '</table>',
      ].join(''),
      scope: {
        sensorType: '=',
        elementToAttach: '=',
        parentElement: '=',
        odfObject: '='
      },
      controller: function () {
        var self = this;
        this.caption = 'Downloading sensor data...';
        this.isLocked = false;
        this.togglingPlug = false;

        if (this.odfObject) {
          this.room = this.odfObject;
        } else {
          this.room = {
            id: 'placeholder',
            text: 'Loading sensors...'
          };
        }

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

        //Here we define custom setter and getter for self.isLoading
        //Setting self.isLoading to true will keep it true at least until
        //the spinner has spun once (600ms). The custom setter will delay
        //setting self.isLoading to false if it is called before the time is up.
        (function() {
          //This is inside anonymous function so that we can have private
          //state for storing variables.
          var rotating = false;
          var inQueue = false;
          var _isLoading = true;

          Object.defineProperty(self, 'isLoading', {
            get: function () {
              return _isLoading;
            },
            set: function (value) {
              if (!rotating && value === true) {
                _isLoading = true;
                rotating = true;
                inQueue = false;

                //Timeout length should be as long as it takes for the spinner
                //to spin fully once.
                $timeout(function () {
                  rotating = false;
                  if (inQueue) {
                    _isLoading = false;
                  }
                }, 600);  //This should match the rotation time.
              } else if (value === true) {
                _isLoading = value;
                inQueue = false;
              } else {
                if (rotating) {
                  inQueue = true;
                } else {
                  _isLoading = false;
                }
              }
            }
          });
        })();

        this.refresh = function (datum) {
          datum = datum || self.room;
          var infoItems = datum.infoItems.reduce(
            function(previous, current) {
              return previous +
              '<InfoItem name="' + current.name + '">' +
                '<MetaData/>' +
              '</InfoItem>';
            }, ''
          );

          var metaDataRequest = (
            '<Object>' +
              '<id>K1</id>' +
              '<Object>' +
                '<id>' + datum.id + '</id>' +
                infoItems +
              '</Object>' +
            '</Object>'
          );

          //Mark room's datum.metaData true to indicate that meta data was requested
          datum.metaData = true;
          self.isLoading = true;

          return omiMessage.send('read', metaDataRequest, {}, false)
            .then(function (objects) {
              self.isLoading = false;
              datum = objects[0].childObjects[0];
              datum.metaData = true;
              return datum;
            }, function (error) {
              //TODO: Make an OMI error parser.
              //console.log(omiMessage.parseError(error));
              self.isLoading = false;
              console.log(error);
            });
        };

        this.openPanorama = function (room) {
          $state.go('panorama', {roomId: room.id});
        };

        this.getSensorStyle = function (sensor) {
          var value = sensor.values[0].value;
          var color;

          if (self.sensorType && sensor.type === self.sensorType.name) {
            color = valueConverter.getColor(sensor.type, value).rgbaString;
          } else {
            color = '';
          }
          return {'background-color': color};
        };

        this.togglePlug = function (sensor) {
          //toggle sensor state between 1 and 0
          var newValue = 1 - sensor.values[0].value;

          var writeRequest = (
            '<Object>'+
              '<id>K1</id>'+
              '<Object>'+
                '<id>'+ sensor.roomId +'</id>'+
                '<InfoItem name="'+ sensor.mac +'">'+
                  '<value>'+ newValue +'</value>'+
                '</InfoItem>'+
              '</Object>'+
            '</Object>');

          self.togglingPlug = true;

          omiMessage.send('write', writeRequest)
            .then(function () {
              self.togglingPlug = false;
              sensor.values[0].value = newValue;
            }, function () {
              self.togglingPlug = false;
            });
        };
      },
      controllerAs: 'tooltip',
      bindToController: true,
      link: function postLink(scope, element, attrs, tooltipCtrl) {

        function showTooltip() {
          d3.select(element[0]).style('display', null);
        }

        function moveTooltip(datum) {
          if (tooltipCtrl.isLocked) {
            return;
          }

          showTooltip();

          if (datum) {
            var elem = this;
            scope.$apply(function () {
              if (!datum.metaData) {
                tooltipCtrl.refresh(datum).then(function(data) {
                  if (data) {
                    d3.select(elem).datum(data);
                  }
                });
              } else {
                tooltipCtrl.room = datum;
              }

              tooltipCtrl.isLoading = false;
              tooltipCtrl.caption = 'Click to lock the tooltip';

              if (tooltipCtrl.roomsWithPanorama.indexOf(datum.id) > -1) {
                tooltipCtrl.hasPanorama = true;
              } else {
                tooltipCtrl.hasPanorama = false;
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

        var attachedElements = [
          tooltipCtrl.elementToAttach
        ];

        d3.select(element[0]).style('display', 'none');

        d3.selectAll(tooltipCtrl.elementToAttach)
            .on('mouseover', showTooltip)
            .on('mousemove', moveTooltip)
            .on('mouseout', hideTooltip)
            .on('mouseup', lockTooltip);

        d3.select(tooltipCtrl.parentElement)
          .on('mousedown.tooltip', unlockTooltip);

        scope.$on('$destroy', function () {
          for (var i = 0; i < attachedElements.length; i++) {
            d3.selectAll(attachedElements[i])
                .on('mouseover', null)
                .on('mousemove', null)
                .on('mouseout', null)
                .on('click', null);
          }
          d3.select(tooltipCtrl.parentElement)
            .on('mousedown.tooltip', null);
        });

        scope.$on('attachTooltip', function(event, elements) {
          for (var i = 0; i < elements.length; i++) {
            if (attachedElements.indexOf(elements[i]) > -1) {
              continue;
            }

            attachedElements.push(elements[i]);

            var element;
            if (typeof elements[i] === 'string') {
              element = d3.selectAll(elements[i]);
            } else {
              element = d3.select(elements[i]);
            }

            element
              .on('mouseover', showTooltip)
              .on('mousemove', moveTooltip)
              .on('mouseout', hideTooltip)
              .on('mouseup', lockTooltip);
          }
        });

      }
    };
  });
