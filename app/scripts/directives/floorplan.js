'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:floorplan
 * @description
 * # floorplan
 */
angular.module('otaniemi3dApp')
  .directive('floorplan', function (Rooms, Floorplans, usSpinnerService, twodservice, Legendbar) {
    return {
      restrict: 'E',
      scope: {
        plan: '=',
        data: '=',
        highlightedRoom: '=',
        roomValueType: '=',
        resetView: '='
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
        *==============================================
        * Helper functions for tooltip handling.
        * Those that do not require room-specific information and are common to all rooms.
        *==============================================
        */
        var tooltip = d3.select('.mouse-tooltip');

        //Make tooltip window follow mouse movement
        function mouseMove (skipSelectedCheck) {
          if (!skipSelectedCheck && scope.selectedRoom) {
            return;
          }
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
            .style('visibility', null)
            .select('#infocontent').remove();

          tooltip.select('#panobtn').style('display', 'none');
        } //end tooltip  helper functions
        
        //Add one row to the tooltip table.
        function addTooltipText (type, value) {
          var unit = '';
          switch (type.toLowerCase()) {
            case 'temperature':
              unit = ' °C';                        
              break;
            case 'humidity':
              unit = ' %';
              break;
            case 'co2':
              unit = ' ppm';
              break;
            case 'pir':
              break;
            case 'light':
              unit = ' lux';
              break;
          }
          if (type === 'pir') {
            type = 'occupied';
            value = value <= 0 ? 'no' : 'yes';
          }
          var newRow = tooltip.select('#infocontent').append('tr');
          var newType = newRow.append('th').text(type);
          var newValue = newRow.append('td').text(value + unit);
          return {type: newType, value: newValue};
        }

        /*
        * Add tooltip that shows room's sensor values. This is called again every time the tooltip is shown for a specific room.
        */
        function addTooltip(room) {
          //Add room-specific information to the tooltip and make tooltip visible
          function mouseOver (skipSelectedCheck) {
            if (!skipSelectedCheck && scope.selectedRoom) {
              return;
            }
            
            scope.$parent.room = room.name; //Pass the room name to controller function
            var table = tooltip.append('table').attr('id', 'infocontent').attr('class', 'tooltip-table');
            var caption = table.append('caption').append('i').text('Click to lock tooltip in place');
            var lastRow = addTooltipText('Room', room.name);

            for (var i = 0; i < room.sensors.length; i++) {
              lastRow = addTooltipText(room.sensors[i].type, room.sensors[i].value);
              if(scope.roomValueType.toLowerCase() === room.sensors[i].type.toLowerCase() || (scope.roomValueType.toLowerCase()==='occupancy' && room.sensors[i].type.toLowerCase()==='pir')) {
                var color = twodservice.getColor(room.sensors[i].type, room.sensors[i].value);
                lastRow.type.style('background-color', color.rgbaString);
                lastRow.value.style('background-color', color.rgbaString);
              }
            }
            
            caption.style('border-top-left-radius', '5px');
            caption.style('border-top-right-radius', '5px');
            lastRow.type.style('border-bottom-left-radius', '5px');
            lastRow.value.style('border-bottom-right-radius', '5px');
            
            var roomsWithPanorama = [
              '238d','237c','235','232b','232a',
              '2nd Floor Corridor Start',
              '2nd Floor Corridor Middle',
              '2nd Floor Corridor End',
              'Corridor Cafeteria Side',
              'Corridor Entrance Side',
              'Cafeteria',
              'Entrance'
              ];

            for(i = 0; i < roomsWithPanorama.length; i++){
              if(room.name === roomsWithPanorama[i]){
                tooltip.select('#panobtn').style('display', 'block');
              }
            }
            tooltip.style('visibility', 'visible');

          }
          

          function clicked () {
            if (scope.highlightedRoom) {
              clearInterval(scope.highlightedRoom.pulse);
              scope.highlightedRoom = null;
            }
            d3.select('#panobtn').style('pointer-events', 'all');
            d3.select('.mouse-tooltip').style('pointer-events', 'all');
            clickWasOnRoom = true;
            if (d3.event.defaultPrevented) { // Ignore the click since this was called after dragend
              mouseOut(false);
              mouseOver(false);
              mouseMove(false);
            }
            else {
              mouseOut(true);
              scope.selectedRoom = room;
              mouseOver(true);
              mouseMove(true);
            }
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
        * Download and show default floorplan and then download
        * other floorplans asynchronously.
        */

      if (scope.$parent.svgSupport) {  //Check if svg support. There is not point doing anything if there isn't
        if (defaultFloorplan.svg === null) {
            getDefaultFloorplan();
            } else {
              var roomsLength = Rooms.list.length;
              for (var i = 0; i < roomsLength; i++) {
                addTooltip(Rooms.list[i]);
              }
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
                  updateRoomColors();
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
        * Color range is from blue to red
        */
        function setRoomColor(room) {

          if (room.node) {
            var i;
            for (i = 0; i < room.sensors.length; i++) {
              if (room.sensors[i].type.toLowerCase() === scope.$parent.roomValueType.toLowerCase() || ((room.sensors[i].type.toLowerCase() === 'pir') && (scope.$parent.roomValueType.toLowerCase() === 'occupancy'))) {
                var color = twodservice.getColor(room.sensors[i].type, room.sensors[i].value);
                d3.select(room.node)
                  .style('fill', color.rgb)
                  .style('fill-opacity', color.opacity);
              }
            }
          }
        }//end setRoomColor
       
       /*
        * Append floorplan to the html element and register zoom and drag listener.
        */
        function appendFloorplan(floorplan, container, redraw) {
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
                svg.select('g').attr('transform', 'translate(' + d3.event.translate +
                                     ')scale(' + d3.event.scale + ')');
                floorplan.scale = d3.event.scale;
                floorplan.translate = d3.event.translate;
                tooltip.style('visibility', 'hidden');
              });
              

            svg.call(zoomListener);

            svg.on('click', function() {
              if (!clickWasOnRoom) {
                d3.select('#panobtn').style('pointer-events', null);
                d3.select('.mouse-tooltip').style('pointer-events', null);
                scope.selectedRoom = null;
                mouseOut(true);
              }
              clickWasOnRoom = false;
            });

            if (scope.highlightedRoom || redraw) {
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
                for (var i = 0; i < Floorplans.floors.length; i++) {
                  if (Floorplans.floors[i] === floorplan) {
                    var roomExists = false;

                    for (var j = 0; j < Rooms.list.length; j++) {
                      if (Rooms.list[j].name === roomText.textContent) {
                        //if rooms list contains nodes with null values 
                        // initRoomList was called earlier.
                        if (Rooms.list[j].node === null) { 
                          // replace those with actual roomArea values
                          Rooms.list[j].node = roomArea;
                          Rooms.list[j].floor = i;
                          addTooltip(Rooms.list[j]);
                        }
                        roomExists = true;
                        break;
                      }
                    }
                    if (!roomExists) {
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
        function updateRoomColors() {
          Rooms.updateRoomInfo(scope.data);
          var i;
          for(i = 0; i < Rooms.list.length; i++){
            setRoomColor(Rooms.list[i]);
          }
        }

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
        
        Legendbar.fillLegend();

        /*
        * Watch for changes in twodviewcontroller's $scope.floorplan and
        * show it in the 2dview. Also downloads the selected floorplan if
        * it hasn't already been downloaded.
        */
        scope.$watch('plan', function () {
          if (scope.plan.svg) {
            appendFloorplan(scope.plan, floorplanContainer);
            // Hide the tooltip
            tooltip
              .style('visibility', null)
              .select('#infocontent').remove();
            tooltip.select('#panobtn').style('display', 'none');
            scope.selectedRoom = null;
          }
        });
        
        function resetZoom() {
          scope.plan.translate = [0, 0];
          scope.plan.scale = 1;
          appendFloorplan(scope.plan, floorplanContainer, true);
        }

        /*
        * Watch for sensor data updates and update every room's
        * info accordingly.
        */
        scope.$watch('data', function () {
          if (scope.data) {
            updateRoomColors();
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
        
        scope.$watch('roomValueType', function() {
          Legendbar.setRoomValueType(scope.roomValueType);
          Legendbar.changeLegendText();
          Legendbar.changeLegendStyle();
        });
        
        scope.$watch('resetView', function() {
          if (scope.resetView === null) {return;}
          
          resetZoom();
        });
      }//end link: function()
    }; //end return
  }); //end directive
