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

    //Class names that are used for rooms that should be coloured on mouseover in the svg
    var classesOfRooms = ['st1', 'st3'];
  
    $scope.floorplans = [];
  
    $scope.selectedPlan = null;

    $scope.addItem = function (planLink, planName) {
      $scope.floorplans.push({
        link: planLink,
        name: planName,
        svgElement: null
      });
    };

    //Add wanted floorplans to the list here
    $scope.addItem('floorplans/Basement.svg', 'Basement');
    $scope.addItem('floorplans/FloorPlan (1).svg', 'Floor 1');
    $scope.addItem('floorplans/FloorPlan (2).svg', 'Floor 2');
    $scope.addItem('floorplans/FloorPlan (3).svg', 'Floor 3');
    $scope.addItem('floorplans/FloorPlan (4).svg', 'Floor 4');
    /////////////////////////////////////////

    var floorplanContainer = d3.select('.floorplan');

    $scope.selectFloorplan = function () {
      var selectedPlan = $scope.selectedPlan;
      
      d3.xml(selectedPlan.link, 'image/svg+xml', function (xml) {
        
        if (selectedPlan.svgElement === null) {
          selectedPlan.svgElement = xml.documentElement;
        }

        floorplanContainer.node().innerHTML = '';
        floorplanContainer.node().appendChild(selectedPlan.svgElement);
        
        $scope.selectedPlan = selectedPlan;
        
        d3.select('svg').attr('width', '100%')
          .attr('height', '100%')
          .attr('pointer-events', 'all');

       /*
        * Add mouseover functionality (coloring the element) for elements of those classes that have been
        * defined in variable classesOfRooms
        */
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
          d3.select(this).attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
        }
        
        var zoomListener = d3.behavior.zoom()
          .scaleExtent([1, 10])
          .on('zoom', zoomHandler);

        d3.select('g').call(zoomListener);

      });
    };
  });

