'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:floorplan
 * @description
 * # floorplan
 */
angular.module('otaniemi3dApp')
  .directive('floorplan', ['Rooms', 'Floorplans', function (Rooms, Floorplans) {
    return {
      restrict: 'EA',
      scope: {
        plan: '=',
        data: '=',
        highlightedRoom: '='
      },
      link: function (scope, element, attrs) {
        
        /*
        * Containers for floor plans. Parser container is used only
        * for parsing room info and isn't shown on the page.
        */
        var floorplanContainer = {
          class: 'floorplan-container',
          display: 'inline'
        };
        
        var parserContainer = {
          class: 'parser',
          display: 'none'
        };
        
        var defaultFloorplan = scope.plan;
        
        /*
        * Download and show default floorplan and then download 
        * other floorplans asynchronously.
        */
        var loadEvent = new Event('loaded');
        var defaultLoadedEvent = new Event('defaultLoadedEvent');
        document.addEventListener('loaded', function(e){updateRoomInfo(scope.data);});
        document.addEventListener('defaultLoadedEvent', function(e){getOtherFloorplans();});
        
        if (defaultFloorplan.svg === null) {
          getDefaultFloorplan();
        }
        
        /*
        * Use the given object to determine the svg to be fetched and append it according to the argument container
        */
        function getFloorplan(floorplan, container, isDefault){
          d3.xml(floorplan.url, 'image/svg+xml', function (xml) {
            if (xml !== undefined) {
              try {
                floorplan.svg = xml.documentElement;
                appendFloorplan(floorplan, container);
                parseRooms(floorplan);
                //Remove title elements so that the browser's built-in tooltip doesn't show
                d3.select('.' + floorplanContainer.class).selectAll('title').remove();
              }
              finally {
                document.dispatchEvent(loadEvent);
                if (isDefault)
                {
                  document.dispatchEvent(defaultLoadedEvent);
                }              
              }
            }
          });
        }
        
        /*
        * Download a new floorplan from server and append it to the page.
        */
        function getDefaultFloorplan() {
          getFloorplan(defaultFloorplan, floorplanContainer, true);
        }
        
        /*
        * Download remaining floorplans and parse their room info.
        */
        function getOtherFloorplans() {
          var i;
          for (i = 0; i < Floorplans.length; i++) {
            var floorplan = Floorplans[i];
            
            if (floorplan !== defaultFloorplan && floorplan.svg === null) {
              getFloorplan(floorplan, parserContainer, false);
            }
          }
        }
        
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
        function appendFloorplan(floorplan, container) {
          //Container tells if svg should be visible or if it's only appended
          //for room info parsing
          var containerElement = d3.select(element[0]).select('.' + container.class);
          
          //If container doesn't exist create a new
          if (containerElement.empty()) {
            containerElement = d3.select(element[0])
              .append('div')
              .attr('class', container.class)
              .style('display', container.display);
          }
          
          var containerNode = containerElement.node();
          
          //Empty container from old floorplan
          while (containerNode.firstChild) {
            containerNode.removeChild(containerNode.firstChild);
          }
          
          //Add new floorplan
          var svg = containerNode
            .appendChild(floorplan.svg);
          
          //Execute if the floorplan is supposed to be seen
          if (container.display !== 'none') {
            svg = d3.select(svg)
              .attr('width', '100%')
              .attr('height', '100%')
              .attr('pointer-events', 'all');

            //Remove pointer-events from text elements
            svg.selectAll('text').attr('pointer-events', 'none');
            
            //Configure dragging and zooming behavior.
            var zoomListener = d3.behavior.zoom()
              .scaleExtent([0.5, 10])
              .scale(floorplan.scale)
              .translate(floorplan.translate)
              .on('zoom', function() {
                svg.select('g').attr('transform', 'translate(' + d3.event.translate +
                                     ')scale(' + d3.event.scale + ')');
                floorplan.scale = d3.event.scale;
                floorplan.translate = d3.event.translate;
              });
            
            svg.call(zoomListener);
            
            if (scope.highlightedRoom) {
              floorplan.translate = [0, 0];
              floorplan.scale = 1;
              zoomListener.event(svg);
            }
          }
        }
        
        /*
        * Read rooms and their html elements from the floorplan svg
        * and save data to the Rooms service.
        */
        function parseRooms(floorplan) {
          var isLetter = /^\w$/i;

          d3.select('.' + parserContainer.class).style('display', 'block');
          
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
                  var i;
                  for (i = 0; i < Floorplans.length; i++) {
                    if (Floorplans[i] === floorplan) {
                      Rooms.push({
                        name: roomText.textContent,
                        node: roomArea,
                        floor: i,
                        sensors: []
                      });
                    }
                  }
                }
              }
            });
          });
          
          //Add tooltip to each room
          Rooms.forEach(function(room) {
            addTooltip(room);
          });
          
          //Remove title elements so that the browser's built-in tooltip doesn't show
          var container = d3.select('.' + parserContainer.class);
          container.selectAll('title').remove();
          
          var containerNode = container.node();
          
          if (containerNode === null) { return; }
          
          //Empty container from old floorplan
          while (containerNode.firstChild) {
            containerNode.removeChild(containerNode.firstChild);
          }
        }

        /*
        * Update or add new sensor data to rooms, and then color the rooms according to the data.
        */
        function updateRoomInfo(data) {        
          if(!data) {
            return;
          }
          
          var i, j;
          var sensorUpdated = false;
          
          for (i = 0; i < data.length; i++) {
            var roomName = data[i].room.split(' ')[0];
            
            for (j = 0; j < Rooms.length; j++) {
              if (roomName === Rooms[j].name) {
                var k;
                //Check if sensor already exists
                for (k = 0; k < Rooms[j].sensors.length; k++) {
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
                
                break;
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
          if (scope.plan.svg !== null) {
            appendFloorplan(scope.plan, floorplanContainer);
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
        
        scope.$watch('highlightedRoom', function() {
          if (scope.highlightedRoom !== null) {
            scope.plan = Floorplans[scope.highlightedRoom.floor];
            scope.plan.translate = [0, 0];
            scope.plan.scale = 1;
            appendFloorplan(scope.plan, floorplanContainer);
            //TODO: implement this function
            //highlightRoom(scope.highlightedRoom);
            scope.highlightedRoom = null;
          }
        });
      }
    };
  }]);
