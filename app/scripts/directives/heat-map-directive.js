'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:floorplan
 * @description
 * # floorplan
 */
angular.module('otaniemi3dApp')
  .directive('heatMap', function ($rootScope, heatmapService,
    legendbarService, $q, apiService) {

  return {
    restrict: 'E',
    scope: {
      sensorData: '=',
      floorplan: '=',
      selectedRoom: '=',
      sensorType: '='
    },
    link: function (scope, element) {

      getFloorplan(scope.floorplan)
        .then(appendFloorplan)
        .then(fetchSensorData)
        .then(bindSensors)
        .then(updateRoomColors);

      /*
       * Download svg from the server and save it to floorplan.svg
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

     /*
      * Append floorplan to the html element and register
      * zoom and drag listener.
      */
      function appendFloorplan(floorplan) {
        var svg = element[0].appendChild(floorplan.svg);

        svg = d3.select(svg)
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('pointer-events', 'all');

        svg.selectAll('path').each(function() {
          var elem = d3.select(this);
          if (!elem.attr('data-room-id')) {
            elem.attr('pointer-events', 'none');
          }
        });

        svg.selectAll('text').attr('pointer-events', 'none');

        //Remove title elements so that the browser's built-in
        //tooltip doesn't show
        svg.selectAll('title').remove();

        //Configure dragging and zooming behavior.
        var zoomListener = d3.behavior.zoom()
          .scaleExtent([0.5, 10])
          .scale(floorplan.scale)
          .translate(floorplan.translate)
          .on('zoom', function() {
            svg.select('g').attr('transform',
              [
                'translate(',d3.event.translate,')',
                'scale(',d3.event.scale,')'
              ].join(''));
            floorplan.scale = d3.event.scale;
            floorplan.translate = d3.event.translate;
          });

        svg.call(zoomListener);

        $rootScope.$broadcast('floorplan-loaded');

        return floorplan;
      }

      function fetchSensorData(floorplan) {
        var deferred = $q.defer();

        var sensorRequest = {
          'Objects': {
            'Object': {
              'id': {
                'keyValue': 'K1'
              },
              'Object': []
            }
          }
        };

        d3.select(floorplan.svg)
          .selectAll('[data-room-id]')
          .each(function () {
            sensorRequest.Objects.Object.Object.push({
              'id': {
                'keyValue': d3.select(this).attr('data-room-id')
              }
            });
          });

        apiService.get(sensorRequest, {}, 'sensordata-new', true)
          .then(function success (data) {
            floorplan.data = data;
            deferred.resolve(floorplan);
          }, function error () {
            deferred.resolve(floorplan);
          });

        return deferred.promise;
      }

      /*
      * Read rooms and their html elements from the floorplan svg
      * and save data to the Rooms service.
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

            return roomData;
          });

        return floorplan;
      }

      /*
      * Update or add new sensor data to rooms, and then color the
      * rooms according to the data.
      */
      function updateRoomColors() {
        /*
        angular.forEach(scope.sensorData, function (sensor) {
          setRoomColor(sensor);
        });
        */
      }

      /*
      * Set room color for a room according to its temperature.
      * Color range is from blue to red
      */
      function setRoomColor(room) {
        if (room.node) {
          var sensorType = scope.sensorType.name.toLowerCase();
          for (var i = 0; i < room.sensors.length; i++) {
            var sensor = room.sensors[i];

            if (sensor.type.toLowerCase() === sensorType ||
               (sensor.type.toLowerCase() === 'pir' &&
                  sensorType === 'occupancy')) {

              if (sensor.values.length > 0) {
                var color = heatmapService.getColor(room.sensors[i].type,
                  room.sensors[i].values[0].value);

                d3.select(room.node)
                  .style('fill', color.rgb)
                  .style('fill-opacity', color.opacity);
              }
            }
          }
        }
      }

      /*
      * Watch for sensor data updates and update every room's
      * info accordingly.
      */
      scope.$watch(function () { return JSON.stringify(scope.sensorData); },
        function () {
          if (scope.sensorData && scope.sensorData.length) {
            bindSensors(scope.floorplan);
            updateRoomColors();
          }
      });
    }
  };});
