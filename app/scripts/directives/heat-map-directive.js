'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:floorplan
 * @description
 * # floorplan
 */
angular.module('otaniemi3dApp')
  .directive('heatMap', function ($rootScope, heatmapService,
    legendbarService, $q) {

  return {
    restrict: 'E',
    scope: {
      sensorData: '=',
      floorplan: '=',
      selectedRoom: '=',
      sensorType: '='
    },
    link: function (scope, element) {

      /*
       * Download svg from the server and save it to floorplan.svg
       */
      function getFloorplan(floorplan){
        var deferred = $q.defer();

        if (floorplan.svg) {
          deferred.resolve(floorplan.svg);
        } else {
          d3.xml(floorplan.url, 'image/svg+xml', function (xml) {
            if (xml) {
              deferred.resolve(xml.documentElement);
            } else {
              deferred.reject('Error while fetching a floorplan');
            }
          });
        }

        return deferred.promise;
      }

      function saveFloorplan(svg) {
        var deferred = $q.defer();

        if (!scope.floorplan.svg) {
          scope.floorplan.svg = svg;
        }

        deferred.resolve(scope.floorplan);

        return deferred.promise;
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
      * Append floorplan to the html element and register
      * zoom and drag listener.
      */
      function appendFloorplan(floorplan) {
        var deferred = $q.defer();

        var svg = element[0].appendChild(floorplan.svg);

        svg = d3.select(svg)
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('pointer-events', 'all');

        svg.selectAll('path').each(function() {
          var elem = d3.select(this);
          if (elem.attr('class') !== floorplan.roomArea) {
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
              'translate(' + d3.event.translate + ')scale(' +
              d3.event.scale + ')');
            floorplan.scale = d3.event.scale;
            floorplan.translate = d3.event.translate;
          });

        svg.call(zoomListener);

        deferred.resolve(floorplan);

        return deferred.promise;
      }

      /*
      * Read rooms and their html elements from the floorplan svg
      * and save data to the Rooms service.
      */
      function bindSensors(floorplan) {
        var deferred = $q.defer();

        d3.select(floorplan.svg)
          .selectAll('.' + floorplan.roomNumber)
          .each(function () {

          //roomText is the d3 selection of the text element that
          //has room number
          var roomText = this;

          //Iterate through room areas to check if they overlap
          //with the text element
          d3.select(floorplan.svg)
            .selectAll('.' + floorplan.roomArea)
            .datum(function () {

            //roomArea is the d3 selection of the room (path or rect element)
            var roomArea = this;

            var textCoords = roomText.getBoundingClientRect();
            var roomCoords = roomArea.getBoundingClientRect();
            var textHeight = textCoords.bottom - textCoords.top;
            var textWidth = textCoords.right - textCoords.left;
            var isInside =
              textCoords.top + textHeight / 2 > roomCoords.top &&
              textCoords.top + textHeight / 2 < roomCoords.bottom &&
              textCoords.left + textWidth / 2 > roomCoords.left &&
              textCoords.left + textWidth / 2 < roomCoords.right;

            //Check if room name overlaps with room rectangle in svg.
            if (isInside) {
              var roomData = { sensors: [] };
              var roomName = '';

              angular.forEach(scope.sensorData, function (sensor) {
                var roomNum;

                //If room.name starts with 'Room' prefix then room
                //number is room.name without the 'Room-' prefix.
                if (sensor.room.lastIndexOf('Room', 0) === 0) {
                  roomNum = sensor.room.split(/ (.+)/)[1];
                //e.g. Cafeteria doesn't have 'Room' prefix.
                } else {
                  roomNum = sensor.room;
                }

                if (roomNum === roomText.textContent) {
                  roomData.sensors.push(sensor.id);
                  roomName = sensor.room;
                }
              });

              roomData.room = roomName;

              return roomData;
            }
            return d3.select(this).datum();
          });
        });

        $rootScope.$broadcast('floorplan-loaded');

        deferred.resolve(floorplan);

        return deferred.promise;
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

      getFloorplan(scope.floorplan)
        .then(saveFloorplan)
        .then(appendFloorplan)
        .then(bindSensors)
        .then(updateRoomColors);

      /*
      * Watch for sensor data updates and update every room's
      * info accordingly.
      */
      scope.$watch(function () { return JSON.stringify(scope.sensorData); },
        function () {
          if (scope.sensorData) {
            updateRoomColors();
          }
      });
    }
  };});
