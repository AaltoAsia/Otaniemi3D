'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:floorplan
 * @description
 * # floorplan
 */
angular.module('otaniemi3dApp')
  .directive('heatMap', function (Rooms, heatmapService,
    legendbarService, $interval) {

  return {
    restrict: 'E',
    scope: {
      sensorData: '=',
      floorplans: '=',
      selectedRoom: '=',
      sensorType: '='
    },
    link: function (scope, element, attrs) {

      var selectedFloorplan;
      for (var i = 0; i < scope.floorplans.length; i++) {
        if (scope.floorplans[i].isSelected) {
          selectedFloorplan = scope.floorplans[i];
          break;
        }
      }

      getSvg(selectedFloorplan);
      updateRoomColors();

      /*
       * Download svg from the server and save it to floorplan.svg
       */
      function getSvg(floorplan){
        d3.xml(floorplan.url, 'image/svg+xml', function (xml) {
          if (xml) {
            floorplan.svg = xml.documentElement;
            appendFloorplan(floorplan);
            parseRooms(floorplan);

            //Remove title elements so that the browser's built-in
            //tooltip doesn't show
            d3.select(element[0])
              .selectAll('title')
              .remove();
          }
        });
      }

      /*
      * Set room color for a room according to its temperature.
      * Color range is from blue to red
      */
      function setRoomColor(room) {
        if (room.node) {
          var i;
          var sensorType = scope.sensorType.name.toLowerCase();
          for (i = 0; i < room.sensors.length; i++) {
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
      }

      /*
      * Read rooms and their html elements from the floorplan svg
      * and save data to the Rooms service.
      */
      function parseRooms(floorplan) {
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
            .each(function () {

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
              for (var i = 0; i < scope.floorplans.length; i++) {
                if (scope.floorplans[i] === floorplan) {
                  var roomExists = false;

                  var keys = Object.keys(scope.sensorData);
                  for (var j = 0; j < keys.length; j++) {
                    var room = scope.sensorData[keys[j]];
                    var roomNum;

                    //If room.name starts with 'Room' prefix then room
                    //number is room.name without the 'Room-' prefix.
                    if (room.name.lastIndexOf('Room', 0) === 0) {
                      roomNum = room.name.split(/ (.+)/)[1];
                    //e.g. Cafeteria doesn't have 'Room' prefix.
                    } else {
                      roomNum = room.name;
                    }

                    if (roomNum === roomText.textContent) {
                      if (!room.node) {
                        room.node = roomArea;
                        room.floor = i;
                      }
                      roomExists = true;
                      break;
                    }
                  }

                  if (!roomExists) {
                    var id, name;

                    if (isNaN(Number(roomText.textContent.substring(0, 2)))) {
                      id = name = roomText.textContent;
                    } else {
                      id = 'Room-' + roomText.textContent;
                      name = 'Room ' + roomText.textContent;
                    }

                    //Add new room
                    scope.sensorData[id] = {
                      id: id,
                      name: name,
                      node: roomArea,
                      floor: i,
                      sensors: []
                    };
                  }
                }
              }
            }
          });
        });
      }

      /*
      * Update or add new sensor data to rooms, and then color the
      * rooms according to the data.
      */
      function updateRoomColors() {
        var keys = Object.keys(scope.sensorData);
        for (var i = 0; i < keys.length; i++) {
          setRoomColor(scope.sensorData[keys[i]]);
        }
      }

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

      scope.$on('$destroy', function () {
        if (scope.highlightedRoom) {
          $interval.cancel(scope.highlightedRoom.pulse);
        }
      });
    }
  };});
