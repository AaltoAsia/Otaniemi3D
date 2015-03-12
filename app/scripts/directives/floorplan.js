'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:floorplan
 * @description
 * # floorplan
 */
angular.module('otaniemi3dApp')
  .directive('floorplan', ['Rooms', 'Floorplans', 'usSpinnerService',function (Rooms, Floorplans, usSpinnerService) {
    return {
      restrict: 'EA',
      scope: {
        plan: '=',
        data: '=',
        highlightedRoom: '=',
        selectedRoom: '='
      },
      link: function (scope, element) {

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

        /*
        * Unhide floorplan. Called when loading spinner stops.
        */
        function showFloorplan() {
          d3.select('.' + floorplanContainer.class).style('visibility', null);
        }

        var defaultFloorplan = scope.plan;

        //Because the click event of a room node takes place after the one of the svg element,
        //we need this variable to keep record if the event happened on a room and, therefore,
        //should not unselect the selected room.
        var clickWasOnRoom = false;


        /*
        * Download a new floorplan from server and append it to the page.
        */
        function getDefaultFloorplan() {
          usSpinnerService.spin('spinner-1'); //Start the spinner
          getFloorplan(defaultFloorplan, floorplanContainer, true);
        } //end getDefaultFloorplan


        /*
        * Download and show default floorplan and then download
        * other floorplans asynchronously.
        */

      if (scope.$parent.svgSupport) {  //Check if svg support. There is not point doing anything if there isn't
        if (defaultFloorplan.svg === null) {
            getDefaultFloorplan();
            } else {
              usSpinnerService.stop('spinner-1'); //floorplans loaded, hide the spinner
              showFloorplan();
          }
        }
          /*
          * Use the given object to determine the svg to be fetched and append it according to the argument container
          */
        function getFloorplan(floorplan, container, isDefault){
          d3.xml(floorplan.url, 'image/svg+xml', function (xml) {
            if (xml) {
              try {
                floorplan.svg = xml.documentElement;
                appendFloorplan(floorplan, container);
                parseRooms(floorplan);
                //Remove title elements so that the browser's built-in tooltip doesn't show
                d3.select('.' + floorplanContainer.class).selectAll('title').remove();
                if (Floorplans.allLoaded()) {
                  updateRoomInfo();
                  usSpinnerService.stop('spinner-1');
                  showFloorplan();
                }
              }
              finally {
                if (isDefault) {
                    getOtherFloorplans();
                }
              }
            }
          });
        } //end getFloorplan

        /*
        * Download remaining floorplans and parse their room info.
        */
        function getOtherFloorplans() {
          var i;
          for (i = 0; i < Floorplans.floors.length; i++) {
            var floorplan = Floorplans.floors[i];

            if (floorplan !== defaultFloorplan && floorplan.svg === null) {
              getFloorplan(floorplan, parserContainer, false);
            }
          }
        } //end getOtherFloorplans

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
        }//end setRoomColor

        /*
        *==============================================
        * Helper functions for tooltip handling.
        * Those that do not require room-specific information and are common to all rooms.
        *==============================================
        */
        var tooltip = d3.select('.mousetooltip');

        //Check if tooltip div element has already been created.
        if (tooltip.empty()) {
          tooltip = d3.select('body')
            .append('div')
            .attr('class','mousetooltip');
        }

        //Make tooltip window follow mouse movement
        function mouseMove (skipSelectedCheck) {
          if (!skipSelectedCheck && scope.selectedRoom) {
            return;
          }
          
          // Make sure that tooltip doesn't appear out of window
          if (d3.event.pageY > window.innerHeight /2) {
            tooltip.style('bottom', (window.innerHeight-d3.event.pageY)+'px');
            tooltip.style('top', 'auto');
          }
          else {
            tooltip.style('top', (d3.event.pageY-10)+'px');
            tooltip.style('bottom', 'auto');
          }
          if (d3.event.pageX > window.innerWidth /2) {
            tooltip.style('right', (window.innerWidth-d3.event.pageX)+'px');
            tooltip.style('left', 'auto');
          }
          else {
            tooltip.style('left', (d3.event.pageX)+'px');
            tooltip.style('right', 'auto');
          }        
        }

        //Empty tooltip and make it invisible
        function mouseOut (skipSelectedCheck) {
          if (!skipSelectedCheck && scope.selectedRoom) {
            return;
          }
          tooltip
            .selectAll('p').remove()
            .style('visibility', 'hidden');
        } //end tooltip  helper functions

        /*
        * Add tooltip that shows room's sensor values.
        */
        function addTooltip(room) {
          //Add room-specific information to the tooltip and make tooltip visible
          function mouseOver (skipSelectedCheck) {
            if (!skipSelectedCheck && scope.selectedRoom) {
              return;
            }

            tooltip.append('p').text('Room: ' + room.name);

            var i = 0;
            for (i = 0; i < room.sensors.length; i++) {
                switch (room.sensors[i].type) {
                    case 'temperature':
                        tooltip.append('p').text(room.sensors[i].type + ': ' + room.sensors[i].value + ' °C');
                        break;
                    case 'humidity':
                        tooltip.append('p').text(room.sensors[i].type + ': ' + room.sensors[i].value + ' %');
                        break;
                    case 'co2':
                        tooltip.append('p').text(room.sensors[i].type + ': ' + room.sensors[i].value + ' ppm');
                        break;
                    case 'pir':
                        tooltip.append('p').text(room.sensors[i].type + ': ' + room.sensors[i].value);
                        break;
                    case 'light':
                        tooltip.append('p').text(room.sensors[i].type + ': ' + room.sensors[i].value + ' lux');
                        break;
                }
            }

            tooltip.style('visibility', 'visible');
          }

          function clicked () {
            clickWasOnRoom = true;
            if (scope.highlightedRoom) {
              clearInterval(scope.highlightedRoom.pulse);
              scope.highlightedRoom = null;
            }
            mouseOut(true);
            scope.selectedRoom = room;
            mouseOver(true);
            mouseMove(true);
          }

          //Set mouse events to the room node
          if (room.node) {
            d3.select(room.node)
              .on('mouseover', mouseOver)
              .on('mousemove', mouseMove)
              .on('mouseout', mouseOut)
              .on('click', clicked);
          }
        } //end addTooltip

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

          if (!Floorplans.allLoaded()) {
            containerElement.style('visibility', 'hidden');
          }

          var containerNode = containerElement.node();

          //Empty container from old floorplan
          while (containerNode.firstChild) {
            containerNode.removeChild(containerNode.firstChild);
          }

          //Add new floorplan
          var svg = containerNode
            .appendChild(floorplan.svg);

          svg = d3.select(svg)
              .attr('width', '100%')
              .attr('height', '100%')
              .attr('pointer-events', 'all');

          //Execute if the floorplan is supposed to be seen
          if (container.display !== 'none') {

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
                tooltip.style('visibility', 'hidden');
              });

            svg.call(zoomListener);

            svg.on('click', function() {
              if (!clickWasOnRoom) {
                scope.selectedRoom = null;
                mouseOut(true);
              }
              clickWasOnRoom = false;
            });

            if (scope.highlightedRoom) {
              floorplan.translate = [0, 0];
              floorplan.scale = 1;
              zoomListener.event(svg);
            }
          }
        } //end appendFloorplan

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
                var i;
                //If text element is one letter then it should be appended to room number
                if (isLetter.test(roomText.textContent)) {
                  for (i = 0; i < Rooms.list.length; i++) {
                    if (Rooms.list[i].node === roomArea) {
                      Rooms.list[i].name = Rooms.list[i].name + roomText.textContent;
                    }
                  }
                //Else add a new room to the Rooms service
                } else {
                  for (i = 0; i < Floorplans.floors.length; i++) {
                    if (Floorplans.floors[i] === floorplan) {
                      Rooms.add(roomText.textContent, roomArea, i);
                      addTooltip(Rooms.list[Rooms.list.length-1]);
                    }
                  }
                }
              }
            });
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
        } //end parseRooms

        /*
        * Update or add new sensor data to rooms, and then color the rooms according to the data.
        */

        function updateRoomInfo() {
          if(!scope.data) {
              return;
          }

          var i, j;
          var sensorUpdated = false;

          for (i = 0; i < scope.data.length; i++) {
              var roomName = scope.data[i].room.split(' ')[0];

              for (j = 0; j < Rooms.list.length; j++) {
                  if (roomName === Rooms.list[j].name) {
                      var k;
                      //Check if sensor already exists
                      for (k = 0; k < Rooms.list[j].sensors.length; k++) {
                          if (Rooms.list[j].sensors[k].id === scope.data[i].sensorId && Rooms.list[j].sensors[k].type === scope.data[i].type) {
                              Rooms.list[j].sensors[k].value = scope.data[i].value;
                              sensorUpdated = true;
                          }
                      }

                      //If sensor doesn't yet exist in Rooms service then add it
                      if (!sensorUpdated) {
                          Rooms.list[j].sensors.push({
                              id: scope.data[i].sensorId,
                              type: scope.data[i].type,
                              value: scope.data[i].value
                          });
                      } else {
                      //Reset updated flag
                          sensorUpdated = false;
                      }

                      setRoomColor(Rooms.list[j]);

                      break;
                  }
              }
          }
    }  //end updateRoomInfo

	/*
        * Pulse the room highlight until it is not selected anymore.
        */
        function highlightRoom(room) {
          var duration = 3000;
          var pulseColor = 'grey';

          var initialColor = d3.select(room.node).style('fill');
          if (initialColor === 'none') {
            initialColor = 'rgb(255,255,255)';
          }

          //Color it first, fade away and color again because the first iteration of setInterval takes a while...
          d3.select(room.node).style('fill', pulseColor);
          d3.select(room.node).transition().duration(duration*2/3).style('fill', initialColor);
          d3.select(room.node).transition().delay(duration*2/3).duration(duration*2/3).style('fill', pulseColor);
          d3.select(room.node).transition().delay(duration*4/3).duration(duration*2/3).style('fill', initialColor);

          var pulsing = window.setInterval(function() {
            d3.select(room.node)
              .transition()
              .duration(duration)
              .style('fill', pulseColor)
              .transition()
              .delay(duration)
              .duration(duration)
              .style('fill', initialColor);
          }, duration * 2);

          return pulsing;
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
            updateRoomInfo();
          }
        });

        scope.$watch('highlightedRoom', function() {
          if (scope.highlightedRoom !== null) {
            scope.plan = Floorplans.floors[scope.highlightedRoom.floor];
            scope.plan.translate = [0, 0];
            scope.plan.scale = 1;
            appendFloorplan(scope.plan, floorplanContainer);
            scope.highlightedRoom.pulse = highlightRoom(scope.highlightedRoom);
          }
        });
      }//end link: function()
    }; //end return
  }]); //end directive
