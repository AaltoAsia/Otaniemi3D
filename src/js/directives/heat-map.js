'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:heat-map
 * @description
 * Display heat map of the provided floor plan.
 * @restrict E
 * @param {Object} floorplan {@link otaniemi3dApp.floorplanStorage Floor plan} that is viewed in the heat map.
 * @param {Object} selectedRoom Room that is highlighted.
 * @param {Object} sensorType Sensor type whose values are used in
 *                            coloring the heat map.
 * @requires $q
 * @requires $rootScope
 * @requires otaniemi3dApp.valueConverter
 * @requires otaniemi3dApp.omiMessage
 */
angular.module('otaniemi3dApp')
  .directive('heatMap', function(valueConverter, $q, $rootScope, omiMessage) {

  return {
    restrict: 'E',
    scope: {
      floorplan: '=',
      selectedRoom: '=',
      sensorType: '=',
      building: '='
    },
    link: function(scope, element) {

      var isFloorplanLoaded = false;
      //Later we store dragging and zooming behavior to this variable.
      var zoomListener;

      getFloorplan(scope.floorplan)
        .then(appendFloorplan)
        .then(fetchSensorData)
        .then(bindSensors)
        .then(updateRoomColors);

      /**
       * Download svg from the server and save it to floorplan.svg
       *
       * @param {Object} floorplan - Floor plan that should be downloaded.
       * @return {Promise} Returns a promise of floorplan.
       */
      function getFloorplan(floorplan){
        var deferred = $q.defer();

        if (floorplan.svg) {
          deferred.resolve(floorplan);
        } else {
          d3.xml('assets/buildings/' + scope.building.id + '/' + floorplan.url,
          'image/svg+xml', function (xml) {
            if (xml) {
              floorplan.svg = xml.documentElement;
              deferred.resolve(floorplan);
            } else {
              deferred.reject('Error while fetching a floorplan');
            }
          });
        }

        return deferred.promise;
      }

     /**
      * Append floorplan to the parent element and register
      * zoom and drag listener.
      *
      * @param {Object} floorplan - Floor plan that will be appended to the page.
      * @return {Object} Same floor plan object that was given as a parameter.
      */
      function appendFloorplan(floorplan) {
        floorplan.rooms = [];
        floorplan.translate = [0,0];
        floorplan.scale = 1;

        var svg = element[0].appendChild(floorplan.svg);

        svg = d3.select(svg)
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('pointer-events', 'all')
            .attr('id', 'floorplan');

        svg.selectAll('path').each(function() {
          var elem = d3.select(this);
          if (!elem.attr('data-room-id')) {
            elem.attr('pointer-events', 'none');
          }
        });

        svg.selectAll('text').attr('pointer-events', 'none');

        //Configure dragging and zooming behavior.
        zoomListener = d3.behavior.zoom()
          .scaleExtent([0.5, 10])
          .scale(floorplan.scale)
          .translate(floorplan.translate)
          .on('zoom', function() {
            svg.select('g').attr('transform', [
                'translate(',d3.event.translate,')',
                'scale(',d3.event.scale,')'
              ].join(''));
            floorplan.scale = d3.event.scale;
            floorplan.translate = d3.event.translate;
          });

        svg.call(zoomListener);

        $rootScope.$broadcast('floorplan-loaded');
        isFloorplanLoaded = true;

        highlightRoom(scope.selectedRoom);

        return floorplan;
      }

      /**
       * Fetch sensor data of rooms in the floor plan from the server.
       *
       * @param {Object} floorplan - Floor plan object where the data
       *                             will be stored.
       * @return {Promise} Promise of a floor plan object with the sensor data.
       */
      function fetchSensorData(floorplan) {
        var rooms = '';
        d3.select(floorplan.svg)
          .selectAll('[data-room-id]')
          .each(function () {
            rooms += (
              '<Object>' +
                '<id>' +
                  d3.select(this).attr('data-room-id') +
                '</id>' +
              '</Object>');
          });
        var sensorRequest = (
          '<Object>' +
            '<id>K1</id>' +
            rooms +
          '</Object>'
        );

        return omiMessage.send('read', sensorRequest)
          .then(function (data) {
            floorplan.data = data[0].childObjects;
            return floorplan;
          }, function (error) {
            console.log(error);
            floorplan.data = [];
            return floorplan;
          });
      }

      /**
       * Bind svg path elements of rooms with corresponding sensor data.
       *
       * @param {Object} floorplan - Floor plan whose path elements will
       *                             be mapped to sensor data.
       * @return {Object} Same floor plan object that was given as a parameter.
       */
      function bindSensors(floorplan) {
        d3.select(floorplan.svg)
          .selectAll('[data-room-id]')
          .datum(function() {
            var datum = d3.select(this).datum();

            if (datum) {
              return datum;
            }

            var id = d3.select(this).attr('data-room-id');
            var room = floorplan.data.find(
              function(odfObject) {
                return odfObject.id === id;
              }
            );

            return room ? room : {
              id: id,
              infoItems: [],
              childObjects: []
            };
          });

        return floorplan;
      }

      /**
       * Color rooms in heat map according to sensor values that are same
       * type as scope.sensorType.
       *
       * @param {Object} floorplan - Floor plan whose rooms will be colored.
       */
      function updateRoomColors(floorplan) {
        d3.select(floorplan.svg)
          .selectAll('[data-room-id]')
          .each(function (datum) {
            var sensor = datum.infoItems.find(
              function(infoItem) {
                return infoItem.name === scope.sensorType.name;
              }
            );
            if (sensor) {
              var value = sensor.values[0].value;
              var color = valueConverter.getColor(sensor.name, value);
              d3.select(this)
                .style('fill', color.rgb)
                .style('fill-opacity', color.opacity);
            }
          });
      }

      /**
       * Center camera to the room that was selected
       *
       * @param {Object} room - Room where we want to center the camera.
       */
      function centerCamera(room) {
        var svg = d3.select(scope.floorplan.svg);

        var svgBBox = svg.node().getBoundingClientRect();
        var origin = [svgBBox.width / 2, svgBBox.height / 2];

        var roomElem = room.node();
        var elemBBox = roomElem.getBBox();
        var x = elemBBox.x + elemBBox.width / 2;
        var y = elemBBox.y + elemBBox.height / 2;
        var scale = 1.6;
        var translate = [origin[0] - x * scale, origin[1] - y * scale];

        zoomAndPan(scale, translate);
      }

      /**
       * Set floor plan svg's scale and translation.
       *
       * @param {number} scale - New scale for the floor plan.
       * @param {number[]} translate - New translation for the floor plan.
       * @param {number=1000} duration - Duration for the translation
       */
      function zoomAndPan(scale, translate, duration) {
        duration = duration || 1000;

        if (zoomListener) {
          scope.floorplan.translate = translate;
          scope.floorplan.scale = scale;

          d3.select(scope.floorplan.svg)
            .transition()
            .duration(duration)
            .call(zoomListener
              .translate(translate)
              .scale(scale)
              .event
            );
        }
      }

      function highlightRoom (roomInfo) {
        d3.select(scope.floorplan.svg)
          .selectAll('[data-room-id]')
          .each(function () {
            var room = d3.select(this);

            //remove old room selection highlight
            room
              .style('stroke-width', null)
              .style('stroke', null)
              .style('stroke-opacity', null);

            if (room.attr('data-room-id') === roomInfo.id) {
              room
                .style('stroke-width', '15')
                .style('stroke', '#ffcc00')
                .style('stroke-opacity', '0')
                .transition()
                .ease('cubic-in-out')
                .style('stroke-opacity', '1');

              //center camera to the selected room
              centerCamera(room);
            }
          });
      }

      scope.$on('reset-position', function () {
        zoomAndPan(1, [0,0]);
      });

      scope.$watch('selectedRoom', highlightRoom);

      scope.$watch('sensorType', function () {
        if (isFloorplanLoaded) {
          updateRoomColors(scope.floorplan);
        }
      });
    }
  };});
