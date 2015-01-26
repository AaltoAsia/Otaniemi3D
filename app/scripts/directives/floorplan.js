'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:floorplan
 * @description
 * # floorplan
 */
angular.module('otaniemi3dApp')
  .directive('floorplan', ['Rooms', function (Rooms) {
    return {
      restrict: 'EA',
      scope: {
        plan: '=',
        data: '='
      },
      link: function (scope, element, attrs) {
        
        /*
        * Set room color for a room according to its temperature.
        * Color range is from blue to red and temperature range is from
        * 15C to 35C.
        */
        function setRoomColor(room) {
          
          //Scale percentage to rgb value 0 - 255.
          function scaleTo255(percent) {
            return Math.round(255 * percent);
          }
          
          //Translate value between low and high parameters to a percentage
          function scaleValueLowHigh(value, low, high) {
            return Math.max(0, Math.min(1, (value - low) / (high - low)));
          }

          if (room.node) {
            var i;
            for (i = 0; i < room.sensors.length; i++) {

              if (room.sensors[i].type === 'temperature') {
                var temp = room.sensors[i].value;

                //Temperature color range is 15C - 35C
                var min = 15;
                var max = 35;

                var tempPercentage = Math.min((temp - min) / (max - min), 1);
                tempPercentage = 1.0 - Math.max(tempPercentage, 0);

                // r    g    b    temp
                // 255  0    0    0%
                // 255  255  0    25%
                // 0    255  0    50%
                // 0    255  255  75%
                // 0    0    255  100%
                
                var red, green, blue;

                if (tempPercentage < 0.25) {
                  red = 1.0;
                  green = scaleValueLowHigh(tempPercentage, 0, 0.25);
                  blue = 0;
                } else if (tempPercentage < 0.50) {
                  red = scaleValueLowHigh(tempPercentage, 0.50, 0.25);
                  green = 1.0;
                  blue = 0;
                } else if (tempPercentage < 0.75) {
                  red = 0;
                  green = 1.0;
                  blue = scaleValueLowHigh(tempPercentage, 0.50, 0.75);
                } else {
                  red = 0;
                  green = scaleValueLowHigh(tempPercentage, 1.0, 0.75);
                  blue = 1.0;
                }
                
                var color = 'rgb(' + scaleTo255(red).toString() + ', ' +
                                     scaleTo255(green).toString() + ', ' +
                                     scaleTo255(blue).toString() + ')';

                d3.select(room.node).style('fill', color);

              }
            }
          }
        }
        
        /*
        * Download a new floorplan from server and append it to the page.
        */
        function getFloorplan(floorplan) {
          d3.xml(floorplan.url, 'image/svg+xml', function (xml) {
            if (xml !== undefined) {
              try {
                floorplan.svg = xml.documentElement;
                appendFloorplan(floorplan);
                parseRooms(floorplan);
              }
              finally {
                //Remove title elements so that the browser's built-in tooltip doesn't show
                d3.select('svg').selectAll('title').remove();
              }
            }
          });
        }
        
        /*
        * Add tooltip that shows room's sensor values.
        * Source: http://bl.ocks.org/biovisualize/1016860
        */
        function addTooltip(room) {
          var tooltip = d3.select('.mousetooltip');
          
          //Check if tooltip div element has already been created.
          if (tooltip.empty()) {
            tooltip = d3.select('body')
              .append('div')
              .attr('class','mousetooltip');
          }
          
          //Add room-specific information to the tooltip and make tooltip visible
          function mouseOver () {
            tooltip.append('p').text('Room: ' + room.name);
            
            var i = 0;
            for (i = 0; i < room.sensors.length; i++) {
              tooltip.append('p').text(room.sensors[i].type + ': ' + room.sensors[i].value);
            }
            
            tooltip.style('visibility', 'visible');
          }
          
          //Make tooltip window follow mouse movement
          function mouseMove () {
            tooltip.style('top', (d3.event.pageY-10)+'px').style('left',(d3.event.pageX+10)+'px');
          }
          
          //Empty tooltip and make it invisible
          function mouseOut () {
            tooltip
              .selectAll('p').remove()
              .style('visibility', null);
          }

          if (room.node) {
            d3.select(room.node)
              .on('mouseover', mouseOver)
              .on('mousemove', mouseMove)
              .on('mouseout', mouseOut);
          }
        }
        
        /*
        * Append floorplan to the html element and register zoom and drag listener.
        */
        function appendFloorplan(floorplan) {
          while (element[0].firstChild) {
            element[0].removeChild(element[0].firstChild);
          }
          
          var svg = element[0].appendChild(floorplan.svg);
          
          svg = d3.select(svg)
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('pointer-events', 'all');

          //Remove pointer-events from text elements
          svg.selectAll('text').attr('pointer-events', 'none');
          
          //Configure dragging and zooming behavior.
          function zoomHandler() {
            svg.select('g').attr('transform', 'translate(' + d3.event.translate +
                                 ')scale(' + d3.event.scale + ')');
            floorplan.scale = d3.event.scale;
            floorplan.translate = d3.event.translate;
          }

          var zoomListener = d3.behavior.zoom()
            .scaleExtent([0.5, 10])
            .scale(floorplan.scale)
            .translate(floorplan.translate)
            .on('zoom', zoomHandler);

          svg.call(zoomListener);
          
        }
        
        /*
        * Read rooms and their html elements from the floorplan svg
        * and save data to the Rooms service.
        */
        function parseRooms(floorplan) {
          var isLetter = /^\w$/i;

          d3.select(floorplan.svg).selectAll('.' + floorplan.roomNumber).each(function () {

            //roomText is the d3 selection of the text element that has room number
            var roomText = this;

            //Iterate through room areas to check if they overlap with the text element
            d3.select(floorplan.svg).selectAll('.' + floorplan.roomArea).each(function () {

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
                //If text element is one letter then it should be appended to room number
                if (isLetter.test(roomText.textContent)) {
                  var i;
                  for (i = 0; i < Rooms.length; i++) {
                    if (Rooms[i].node === roomArea) {
                      Rooms[i].name = Rooms[i].name + roomText.textContent;
                    }
                  }
                //Else add a new room to the Rooms service
                } else {
                  Rooms.push({
                    name: roomText.textContent,
                    node: roomArea,
                    sensors: []
                  });
                }
              }
            });
          });
          
          //Add tooltip to each room
          Rooms.forEach(function(room) {
            addTooltip(room);
          });
          
          //Update sensor info for each room  
          updateRoomInfo(scope.data);
        }

        /*
        * Update or add new sensor data to rooms.
        */
        function updateRoomInfo(data) {
          var i, j;
          var sensorUpdated = false;
          
          iterateRooms:
          for (i = 0; i < data.length; i++) {
            var roomName = data[i].room.split(' ')[0];
            
            for (j = 0; j < Rooms.length; j++) {
              if (roomName === Rooms[j].name) {
                
                var k;
                //Check if sensor already exists
                for (k = 0; Rooms[j].sensors.length; k++) {
                  if (Rooms[j].sensors[k].id === data[i].sensorId) {
                    Rooms[j].sensors[k].value = data[i].value;
                    sensorUpdated = true;
                  }
                }
                
                //If sensor doesn't yet exist in Rooms service then add it
                if (!sensorUpdated) {
                  Rooms[j].sensors.push({
                    id: data[i].sensorId,
                    type: data[i].type,
                    value: data[i].value
                  });
                } else {
                  //Reset updated flag
                  sensorUpdated = false;
                }
                
                setRoomColor(Rooms[j]);
                
                continue iterateRooms;
              }
            }
          }
        }
        
        /*
        * Watch for changes in twodviewcontroller's $scope.floorplan and
        * show it in the 2dview. Also downloads the selected floorplan if
        * it hasn't already been downloaded.
        */
        scope.$watch('plan', function () {
          if (scope.plan.svg === null) {
            getFloorplan(scope.plan);
          } else {
            appendFloorplan(scope.plan);
          }
        });
        
        /*
        * Watch for sensor data updates and update every room's
        * info accordingly.
        */
        scope.$watch('data', function () {
          if (scope.data) {
            updateRoomInfo(scope.data);
          }
        });     
      }
    };
  }]);
