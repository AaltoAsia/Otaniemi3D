'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:twoDViewCtrl
 * @description
 * # twoDViewCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('twodview', function ($scope) {

    //Class names that are used for rooms that should be coloured on 
    //mouseover in the svg
    var classesOfRooms = ['st1', 'st3'];
    
    $scope.floorplans = [];
  
    $scope.selectedPlan = null;
    
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

    var floorplanContainer = d3.select('.floorplan');

    //Load selected floor plan from the server
    $scope.selectFloorplan = function () {
      var selectedPlan = $scope.selectedPlan;
      
      d3.xml(selectedPlan.link, 'image/svg+xml', function (xml) {
        
        if (selectedPlan.svgElement === null) {
          selectedPlan.svgElement = xml.documentElement;
        }

        floorplanContainer.node().innerHTML = '';
        floorplanContainer.node().appendChild(selectedPlan.svgElement);
        
        $scope.selectedPlan = selectedPlan;
        
        var svg = d3.select('svg')
          .attr('width', '100%')
          .attr('height', '100%')
          .attr('pointer-events', 'all');
        
        //Map room numbers with correct rooms in the svg.
        d3.selectAll('.' + selectedPlan.roomNumber).each(function () {
          
          var roomText = this;
          
          d3.selectAll('.' + selectedPlan.roomArea).each(function () {
            //Check if which room names overlap with room rectangles in svg and modify
            //room rectangles to have room names in their titles.
            var roomArea = this;
            
            var isInside = 
                roomText.getBoundingClientRect().top > roomArea.getBoundingClientRect().top && 
                roomText.getBoundingClientRect().bottom < roomArea.getBoundingClientRect().bottom && 
                roomText.getBoundingClientRect().left > roomArea.getBoundingClientRect().left && 
                roomText.getBoundingClientRect().right < roomArea.getBoundingClientRect().right;
            
            if (isInside) {
              var roomNumber = d3.select(roomArea.parentNode).select('title');
              var isLetter = /[a-z]/i;
              //var reNumber = /[0-9]+/i;
              
              //Make room's 'title' element same as room number and append a letter 
              //to room number if needed.
              if (isLetter.test(roomText.textContent)) {
                roomNumber.node().textContent = roomNumber.node().textContent + roomText.textContent;
              } else{
                roomNumber.node().textContent = roomText.textContent;
              }
            }
          })
        })
        
        //Add mouseover functionality (coloring the element) for elements of 
        //those classes that have been defined in variable classesOfRooms
        function addMouseOverColoring(selectString) {
          
          d3.selectAll(selectString)
            .on('mouseover', function () {
              d3.select(this).style('fill', 'red');
            })
            .on('mouseout', function () {
              d3.select(this).style('fill', null);
            });
        }
        
        classesOfRooms.forEach(function (roomClass) {
          addMouseOverColoring('.' + roomClass);
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