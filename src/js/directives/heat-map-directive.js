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
 * @requires otaniemi3dApp.heatmapService
 * @requires otaniemi3dApp.sensorApi
 */
angular.module('otaniemi3dApp')
  .directive('heatMap', function(heatmapService, $q, $rootScope, sensorApi) {

  return {
    restrict: 'E',
    scope: {
      floorplan: '=',
      selectedRoom: '=',
      sensorType: '='
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
          d3.xml(floorplan.url, 'image/svg+xml', function (xml) {
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
        var sensorRequest = {
          'Object': {
            'id': {
              'keyValue': 'K1'
            },
            'Object': []
          }
        };

        d3.select(floorplan.svg)
          .selectAll('[data-room-id]')
          .each(function () {
            sensorRequest.Object.Object.push({
              'id': {
                'keyValue': d3.select(this).attr('data-room-id')
              }
            });
          });

        return sensorApi.send('read', sensorRequest)
          .then(function success (data) {
            floorplan.data = data;
            return floorplan;
          }, function error () {
            floorplan.data = floorplan.data || [];
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
          .datum(function () {

            var datum = d3.select(this).datum();

            if (datum && datum.sensors.length) {
              return datum;
            }

            var roomData = { sensors: [] };

            var id = d3.select(this).attr('data-room-id');
            var roomName;

            for (var i = 0; i < floorplan.data.length; i ++) {
              var sensor = floorplan.data[i];

              if (sensor.roomId === id) {
                roomData.sensors.push(sensor);
                roomName = sensor.room;
              }
            }

            roomData.room = roomName ? roomName : id;
            roomData.roomId = id;

            floorplan.rooms.push({
              name: roomData.room,
              id: roomData.roomId
            });

            return roomData;
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
          .each(function () {
            var data = d3.select(this).datum();

            for (var i = 0; i < data.sensors.length; i++) {
              if (data.sensors[i].type === scope.sensorType.name) {
                var sensor = data.sensors[i];
                var value = sensor.values[0].value;
                var color = heatmapService.getColor(sensor.type, value);
                d3.select(this)
                  .style('fill', color.rgb)
                  .style('fill-opacity', color.opacity);
              }
            }
          });
      }

      /**
       * Center camera to the room that was selected
       *
       * @param {Object} room - Room where we want to center the camera.
       */
      function centerCamera(room) {
        // body...
      }

      /**
       * Set floor plan svg's scale and translation.
       *
       * @param {number} scale - New scale for the floor plan.
       * @param {number[]} translate - New translation for the floor plan.
       */
      function zoomAndPan(scale, translate) {
        if (zoomListener) {
          scope.floorplan.translate = translate;
          scope.floorplan.scale = scale;

          zoomListener
            .scale(scale)
            .translate(translate)
            .event(d3.select(element[0]).select('#floorplan'));
        }
      }

      scope.$on('reset-zoom', function () {
        zoomAndPan(1, [0,0]);
      });

      scope.$on('room-selected', function (_, roomInfo) {
        d3.select(scope.floorplan.svg)
          .selectAll('[data-room-id]')
          .each(function () {
            var room = d3.select(this);

            //remove old room selection highlight
            room
              .style('stroke-width', null)
              .style('stroke', null)
              .style('stroke-opacity', null);

            if (room.datum().roomId === roomInfo.id) {
              room
                .style('stroke-width', '15')
                .style('stroke', '#ffcc00')
                .style('stroke-opacity', '0')
                .transition()
                .ease('cubic-in-out')
                .style('stroke-opacity', '1');

              //move room to the center of screen if zoomed in
              if (scope.floorplan.scale > 1.2) {
                centerCamera(room);
              }
            }
          });
      });

      scope.$watch('sensorType', function () {
        if (isFloorplanLoaded) {
          updateRoomColors(scope.floorplan);
        }
      });
    }
  };});
