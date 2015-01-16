'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:twoDViewCtrl
 * @description
 * # twoDViewCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('twodview', function ($scope, Datahandler) {

    //Class names that are used for rooms that should be coloured on 
    //mouseover in the svg
    var classesOfRooms = ['st1', 'st3'];
    
    $scope.floorplans = [];
    $scope.sensorData = null;
    
    //When adding new floor plans these parameters need to be provided:
    //  planLink: url to the floor plan
    //  planName: human readable name for the floor plan
    //  roomNumber: class used in text elements that have information about room number
    //  roomArea: class used in rectangle elements that define room area
    $scope.addItem = function (planLink, planName, roomNumber, roomArea) {
      $scope.floorplans.push({
        link: planLink,
        name: planName,
        svgElement: null,
        roomNumber: roomNumber,
        roomArea: roomArea
      });
    };

    //Add wanted floor plans to the list here.
    $scope.addItem('floorplans/Basement.svg', 'Basement', 'st10', 'st1');
    $scope.addItem('floorplans/FloorPlan (1).svg', 'Floor 1', 'st13', 'st3');
    $scope.addItem('floorplans/FloorPlan (2).svg', 'Floor 2', 'st11', 'st3');
    $scope.addItem('floorplans/FloorPlan (3).svg', 'Floor 3', 'st7', 'st1');
    $scope.addItem('floorplans/FloorPlan (4).svg', 'Floor 4', 'st10', 'st3');
    /////////////////////////////////////////
  
    $scope.selectedPlan = $scope.floorplans[0];

    var fetchDataPromise = Datahandler.fetchData();
  
    fetchDataPromise.then(
      function (data) {
        $scope.sensorData = data;
        $scope.selectFloorplan();
      },
      function (reason) {       // something gone wrong
        $scope.sensorData = reason;
      }
    );
  
    //Color rooms according to the temperature
    $scope.setRoomColor = function (roomArea) {
      if ($scope.sensorData != null) {
        var roomNumber = d3.select(roomArea.parentNode).select('title');
        d3.select(roomArea).style('fill', 'null');
        
        var i;
        for (i = 0; i < $scope.sensorData.length; i++) {

          var sensor = $scope.sensorData[i];
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
  
    var floorplanContainer = d3.select('.floorplan');

    //Load selected floor plan from the server
    $scope.selectFloorplan = function () {
      
      d3.xml($scope.selectedPlan.link, 'image/svg+xml', function (xml) {
        
        if ($scope.selectedPlan.svgElement === null) {
          $scope.selectedPlan.svgElement = xml.documentElement;
        }

        floorplanContainer.node().innerHTML = '';
        floorplanContainer.node().appendChild($scope.selectedPlan.svgElement);
        
        var svg = d3.select('svg')
          .attr('width', '100%')
          .attr('height', '100%')
          .attr('pointer-events', 'all');
        
        //Remove pointer-events from text elements
        svg.selectAll('text').attr('pointer-events', 'none');
        
        //Map rooms with correct room numbers in the svg.
        d3.selectAll('.' + $scope.selectedPlan.roomNumber).each(function () {
          
          var roomText = this;
          
          //Check if which room names overlap with room rectangles in svg and modify
          //room rectangles to have room names in their titles.
          d3.selectAll('.' + $scope.selectedPlan.roomArea).each(function () {

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
              var roomNumber = d3.select(roomArea.parentNode).select('title');
              var isLetter = /[a-z]/i;
              
              //Make room's 'title' element same as room number and append a letter 
              //to room number if needed.
              if (isLetter.test(roomText.textContent)) {
                roomNumber.node().textContent = roomNumber.node().textContent + roomText.textContent;
              } else{
                roomNumber.node().textContent = roomText.textContent;
              }
              
              $scope.setRoomColor(roomArea);
            }
          })
        });
        
        //Add mouseover functionality (coloring the element) for elements of 
        //those classes that have been defined in variable classesOfRooms
        // Source : http://bl.ocks.org/biovisualize/1016860
        function addTooltip(selectString) {
          var tooltip = d3.select('body')
            .append('div')
            .style('position', 'absolute')
            .style('z-index', '10')
            .style('visibility', 'hidden')
            .text('Data not available for some reason');
          
          d3.selectAll(selectString)
            .on('mouseover', function(){
              tooltip.text(d3.select(this.parentNode).select('title').node().textContent);
              tooltip.style('visibility', 'visible');              
            })
	        .on('mousemove', function(){tooltip.style('top', (event.pageY-10)+'px').style('left',(event.pageX+10)+'px');})
	        .on('mouseout', function(){tooltip.style('visibility', 'hidden');});

        }
        
        classesOfRooms.forEach(function (roomClass) {
          addTooltip('.' + roomClass);
        });
        
        //Configures the moving and zooming behavior.
        function zoomHandler() {
          d3.select('g').attr('transform', 'translate(' + d3.event.translate + 
                               ')scale(' + d3.event.scale + ')');
        }
        
        var zoomListener = d3.behavior.zoom()
          .scaleExtent([0.5, 10])
          .on('zoom', zoomHandler);

        svg.call(zoomListener);

      });
    };
  });