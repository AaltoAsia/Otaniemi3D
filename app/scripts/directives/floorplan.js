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
        
        function setRoomColor (roomArea) {
          if (scope.data != null) {
            var roomNumber = d3.select(roomArea.parentNode).select('title');
            d3.select(roomArea).style('fill', 'null');

            var i;
            for (i = 0; i < scope.data.length; i++) {

              var sensor = scope.data[i];
              //This checks if data string starts with str string
              //"data.lastIndexOf(str, 0) === 0"
              if (sensor.room.lastIndexOf(roomNumber.node().textContent, 0) === 0 &&
                  sensor.type === 'temperature') {
                var temp = sensor.value;

                //Temeperature color range is 15C - 35C
                var tempPercentage = Math.min((temp - 20) / (30 - 20), 1);
                tempPercentage = Math.max(tempPercentage, 0);

                var rgb = Math.round(255 * tempPercentage);

                //Change rgb value to hex value with leading zeros
                var hex = (255 - rgb).toString(16);
                if (hex.length === 1) {
                  hex = '0' + hex;
                }

                var color = '#ff' + hex + '00';

                d3.select(roomArea).style('fill', color);

                break;
              }
            }
          } else {
            d3.select(roomArea).style('fill', 'null');
          }
        }
        
        function getFloorplan (floorplan) {
          d3.xml(floorplan.url, 'image/svg+xml', function (xml) {
            if (xml != undefined) {
              floorplan.svg = xml.documentElement;
              appendFloorplan(floorplan);
              parseRooms(floorplan);
            }
          });
        }
        
        //Add mouseover functionality (coloring the element) for room
        //Source : http://bl.ocks.org/biovisualize/1016860
        function addTooltip(room) {
          var tooltip = d3.select('body')
            .append('div')
            .style('position', 'absolute')
            .style('z-index', '10')
            .style('visibility', 'hidden')
            .text('Data not available for some reason');
          
          function mouseOver () {
            tooltip.text(room.name);
            tooltip.style('visibility', 'visible');              
          }
          
          function mouseMove () {
            tooltip.style('top', (event.pageY-10)+'px').style('left',(event.pageX+10)+'px');
          }
          
          function mouseOut () {
            tooltip.style('visibility', 'hidden');
          }

          if (room.node) {
            d3.select(room.node)
              .on('mouseover', mouseOver)
              .on('mousemove', mouseMove)
              .on('mouseout', mouseOut);
          }
        }
        
        function appendFloorplan (floorplan) {
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
        
        function parseRooms(floorplan) {
          var isLetter = /[a-z]/i;

          d3.select(floorplan.svg).selectAll('.' + floorplan.roomNumber).each(function () {

            var roomText = this;

            //Check which room names overlap with room rectangles in svg and modify
            //room rectangles to have room names in their titles.
            d3.select(floorplan.svg).selectAll('.' + floorplan.roomArea).each(function () {

              //roomArea is a d3 selection of the room (path or rect element)
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
              
              if (isInside) {
                if (isLetter.test(roomText.textContent)) {
                  var i;
                  for (i = 0; i < Rooms; i++) {
                    if (Rooms[i].name === roomText.textContent) {
                      Rooms[i].name = Rooms[i].name + roomText.textContent;
                    }
                  }
                  //roomNumber.node().textContent = roomNumber.node().textContent + roomText.textContent;
                } else{
                  Rooms.push({
                    name: roomText.textContent,
                    node: roomArea,
                    sensors: []
                  });
                  //roomNumber.node().textContent = roomText.textContent;
                }
              }
            });
          });
          
          var i;
          for (i = 0; i < Rooms.length; i++) {
            addTooltip(Rooms[i]);
          }
        }

        function updateRoomInfo(data) {
          var i, j;

          iterateRooms:
          for (i = 0; i < data.length; i++) {
            var roomName = data[i].room.split(' ')[0];

            for (j = 0; j < Rooms.length; j++) {

              if (roomName === Rooms[j].name) {
                Rooms[j].sensors.push({
                  id: data[i].sensorId,
                  type: data[i].type,
                  value: data[i].value
                });

                continue iterateRooms;
              }
            }

            Rooms.push({
              name: roomName,
              node: null,
              sensors: [{
                id: data[i].sensorId,
                type: data[i].type,
                value: data[i].value
              }],
            });
          }
        }
        
        scope.$watch('plan', function () {
          if (scope.plan.svg === null) {
            getFloorplan(scope.plan);
          } else {
            appendFloorplan(scope.plan);
          }
        });
        
        scope.$watch('data', function () {
          if (scope.data && scope.plan.svg) {
            updateRoomInfo(scope.data);
          }
        });     
      }
    };
  }]);
