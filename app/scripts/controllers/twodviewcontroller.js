'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:twoDViewCtrl
 * @description
 * # twoDViewCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
    .controller('twodview', function($scope, Datahandler, Floorplans, Rooms, twodservice, $rootScope) {

        var floorplanClass = 'floorplan';
        var floorplanFullscreenClass = 'floorplan-fullscreen';

        $scope.sensorData = null;
        $scope.floorplanClass = floorplanClass;
        $scope.rooms = Rooms;
        $scope.searchString = '';
        $scope.highlightedRoom = null;
        $scope.roomValueType = 'temperature';
        $scope.floors = Floorplans.floors.length;
        $scope.selectedRoom = null;
        $scope.timeFrame = '';

        $scope.searchContainer = ''; //This is used to set correct top margin for search container


        /* These are ng-class definitions for buttons found in 2dview*/
        $scope.buttonClass = 'glyphicon glyphicon-resize-full';
        $scope.nextButtonClass = 'glyphicon glyphicon-arrow-right';
        $scope.previousButtonClass = 'glyphicon glyphicon-arrow-left';

        //Select default floorplan which is defined in Floorplans service
        $scope.planNumber = 0;
        for ($scope.planNumber; $scope.planNumber < Floorplans.floors.length; $scope.planNumber++) {
            if (Floorplans.floors[$scope.planNumber].isSelected) {
                $scope.selectedPlan = Floorplans.floors[$scope.planNumber];
                break;
            }
        }

        // Toggle fullscreen button. It broadcasts to rootscope to change the view to fullscreen
        // which in turn hides the footer and header. Also it changes the fullscreen button glyphicon
        $scope.toggleFullscreen = function(){
            $rootScope.fullscreen = !$rootScope.fullscreen;
            if ($scope.floorplanClass === floorplanClass) {
                $scope.floorplanClass = floorplanFullscreenClass;
                $scope.searchContainer = 'search-container-full';
                $scope.buttonClass = ' glyphicon glyphicon-resize-small';
            }
            else {
                $scope.floorplanClass = floorplanClass;
                $scope.searchContainer = '';
                $scope.buttonClass = 'glyphicon glyphicon-resize-full';
            }

        };

        /*
         * Fetch sensor data from the server.
         */
        Datahandler.fetchData().then(
            function(data) {
                $scope.sensorData = data;
            },
            function() {
                console.log('Error: Failed to fetch sensor data');
            }
        );
        /*
         * Change current floorplan to the previous of net floorplan
         * direction is either 1 if the user pressed next button or -1
         * if the user pressed previous button
         */
        $scope.selectPlan = function(direction) {

          if (direction === 1) {
            Floorplans.floors[$scope.planNumber].isSelected = false;
            Floorplans.floors[$scope.planNumber+1].isSelected = true;
            $scope.selectedPlan = Floorplans.floors[$scope.planNumber+1];
            $scope.planNumber++;
          }
          if (direction === -1) {
            Floorplans.floors[$scope.planNumber].isSelected = false;
            Floorplans.floors[$scope.planNumber-1].isSelected = true;
            $scope.selectedPlan = Floorplans.floors[$scope.planNumber-1];
            $scope.planNumber--;
          }
        };

        $scope.highlightRoom = function(item) {
          if ($scope.highlightedRoom !== null) {
            clearInterval($scope.highlightedRoom.pulse);
          }
          
          $scope.highlightedRoom = item;
          $scope.planNumber = $scope.highlightedRoom.floor;
    	};
  
  	    $scope.onSelect = function($item) {
          $scope.highlightRoom($item);
        };

        /*
        / Refresh the room colours according to sensor that is chosen.
        / For example if the user changes from temperature heatmap to co2 heatmap
        / this function will colour the floorplans according to values measured by
        / co2 sensors.
        */
        $scope.refreshRoomColor = function(type) {
          for (var j = 0; j < Rooms.list.length; j++) {
            var room = Rooms.list[j];

            // Colour the room white, in case the room doesn't have any values for that particular sensor
            //
            d3.select(room.node).style('fill', 'rgb(255, 255, 255)');

            // Loop through sensors and check the value of the sensor that matches the parameter given
            //
            for (var i = 0; i < room.sensors.length; i++) {
              if (room.sensors[i].type === type) {
                var color = twodservice.getColor(room.sensors[i].type, room.sensors[i].value)
                d3.select(room.node)
                  .style('fill', color.rgb)
                  .style('fill-opacity', color.opacity);
              }
            }
          }
        };

        $scope.changeColour = function(type) {
            $scope.roomValueType = type;
            $scope.refreshRoomColor(type);
        };

        $scope.selectTimeFrame = function(timeFrame) {
            var time = timeFrame || '';
          
            if (time) {
              $scope.timeFrame = time;
            } else {
              $scope.timeFrame = '';
            }
          
            Datahandler.fetchData(time).then(
              function(data) {
                  $scope.sensorData = data;
              },
              function() {
                  console.log('Error: Failed to fetch sensor data');
              }
          );
        };

    });
