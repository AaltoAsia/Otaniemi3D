'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:floorplan
 * @description
 * # floorplan
 */
angular.module('otaniemi3dApp')
  .directive('floorplan', function (Rooms, floorplanService, usSpinnerService,
    heatmapService, legendbarService) {
    
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
        //Pass the room name to controller function
        scope.$parent.room = room.name;

        var table = tooltip
          .append('table')
          .attr('id', 'infocontent')
          .attr('class', 'tooltip-table');

        var caption = table
          .append('caption')
          .append('i')
          .text('Click to lock tooltip in place');

        var lastRow = addTooltipText('Room', room.name);

        for (var i = 0; i < room.sensors.length; i++) {
          var sensor = room.sensors[i];

          if (sensor.values.length > 0) {
            lastRow = addTooltipText(sensor.type, sensor.values[0].value);

            if(scope.roomValueType.toLowerCase() === sensor.type.toLowerCase() ||
                (scope.roomValueType.toLowerCase()==='occupancy' &&
                sensor.type.toLowerCase()==='pir')) {
              var color = heatmapService.getColor(sensor.type, sensor.values[0].value);
              lastRow.type.style('background-color', color.rgbaString);
              lastRow.value.style('background-color', color.rgbaString);
            }
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

    //Check if svg support. There is not point doing anything if there isn't
    if (scope.$parent.svgSupport) {
      if (defaultFloorplan.svg === null) {
          getDefaultFloorplan();
      } else {
        var keys = Object.keys(Rooms.dict);
        for (var i = 0; i < keys.length; i++) {
          addTooltip(Rooms.dict[keys[i]]);
        }
        //floorplanService loaded, hide the spinner
        usSpinnerService.stop('spinner-1');
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
            if (floorplanService.allLoaded()) {
              updateRoomColors();
              usSpinnerService.stop('spinner-1');
              showFloorplan();
            }
          }
          finally {
            if (isDefault) {
              getOtherfloorplanService();
            }
          }
        }
      });
    } //end getFloorplan


    /*
    * Download remaining floorplanService and parse their room info.
    */
    function getOtherfloorplanService() {
      var i;
      for (i = 0; i < floorplanService.floors.length; i++) {
        var floorplan = floorplanService.floors[i];

        if (floorplan !== defaultFloorplan && floorplan.svg === null) {
          getFloorplan(floorplan, parserContainer, false);
        }
      }
    } //end getOtherfloorplanService


    /*
    * Set room color for a room according to its temperature.
    * Color range is from blue to red
    */
    function setRoomColor(room) {
      if (room.node) {
        var i;
        for (i = 0; i < room.sensors.length; i++) {
          var sensor = room.sensors[i];

          if (sensor.type.toLowerCase() === scope.$parent.roomValueType.toLowerCase() ||
              ((sensor.type.toLowerCase() === 'pir') &&
              (scope.$parent.roomValueType.toLowerCase() === 'occupancy'))) {

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

      if (!floorplanService.allLoaded()) {
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
            for (var i = 0; i < floorplanService.floors.length; i++) {
              if (floorplanService.floors[i] === floorplan) {
                var roomExists = false;

                var keys = Object.keys(Rooms.dict);
                for (var j = 0; j < keys.length; j++) {
                  var room = Rooms.dict[keys[j]];
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
                      addTooltip(room);
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

                  Rooms.add(id, name, roomArea, i);
                  addTooltip(Rooms.dict[id]);
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
      for (var room in Rooms.dict) {
        if (Rooms.dict.hasOwnProperty(room)) {
          setRoomColor(Rooms.dict[room]);
        }
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
      d3.select(room.node)
        .style('fill', pulseColor)
        .transition()
        .duration(duration*2/3)
        .style('fill', initialColor)
        .transition()
        .delay(duration*2/3)
        .duration(duration*2/3)
        .style('fill', pulseColor)
        .transition()
        .delay(duration*4/3)
        .duration(duration*2/3)
        .style('fill', initialColor);

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
    
    legendbarService.fillLegend();

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
      if (scope.highlightedRoom && scope.highlightedRoom.node) {
        scope.plan = floorplanService.floors[scope.highlightedRoom.floor];
        scope.plan.translate = [0, 0];
        scope.plan.scale = 1;
        appendFloorplan(scope.plan, floorplanContainer);
        scope.highlightedRoom.pulse = highlightRoom(scope.highlightedRoom);
      }
    });
    
    scope.$watch('roomValueType', function() {
      legendbarService.setRoomValueType(scope.roomValueType);
      legendbarService.changeLegendText();
      legendbarService.changeLegendStyle();
    });
    
    scope.$watch('resetView', function() {
      if (scope.resetView === null) {return;}
      
      resetZoom();
    });
    }//end link: function()
  }; //end return
  }); //end directive
