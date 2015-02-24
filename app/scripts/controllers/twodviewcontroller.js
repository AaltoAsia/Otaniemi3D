'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:twoDViewCtrl
 * @description
 * # twoDViewCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
    .controller('twodview', function ($scope, Datahandler, Floorplans, Rooms, $rootScope) {

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
        //
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
            function (data) {
                $scope.sensorData = data;
            },
            function (error) {
                console.log('Error: Failed to fetch sensor data');
            }
        );
        /*
         * Change current floorplan to the previous of net floorplan
         * direction is either 1 if the user pressed next button or -1
         * if the user pressed previous button
         */
        $scope.selectPlan = function (direction) {

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
  
  	    $scope.onSelect = function ($item) {
          $scope.highlightRoom($item);
        };

        /*
        / Refresh the room colours according to sensor that is chosen.
        / For example if the user changes from temperature heatmap to co2 heatmap
        / this function will colour the floorplans according to values measured by
        / co2 sensors.
        */
        $scope.refreshRoomColor = function (type) {

            //Scale percentage to rgb value 0 - 255.
            function scaleTo255(percent) {
                return Math.round(255 * percent);
            }

            //Translate value between low and high parameters to a percentage
            function scaleValueLowHigh(value, low, high) {
                return Math.max(0, Math.min(1, (value - low) / (high - low)));
            }
            for (var j = 0; j < Rooms.length; j++) {
                var room = Rooms[j];

                // Colour the room white, in case the room doesn't any any values for that particular sensor
                //
                d3.select(room.node).style('fill', 'rgb(255, 255, 255)');

                // Loop through sensors and check the value of the sensor that matches the parameter given
                //
                for (var i = 0; i < room.sensors.length; i++) {
                    if (room.sensors[i].type === type) {
                        var parameter = room.sensors[i].value;
                        var min;
                        var max;
                        switch (type) {
                            case 'temperature':
                                min = 15;
                                max = 35;
                                break;
                            case 'co2':
                                min = 350;
                                max = 5000;
                                break;
                            case 'light':
                                min = 30;
                                max = 10000;
                                break;
                            case 'pir':
                                min = 0;
                                max = 30;
                                break;
                            case 'humidity':
                                min = 30;
                                max = 70;
                                break;
                        }

                        var tempPercentage = Math.min((parameter - min) / (max - min), 1);
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
            };


            $scope.changeColour = function (type) {
                $scope.roomValueType = type;
                $scope.refreshRoomColor(type);
            };

        });
