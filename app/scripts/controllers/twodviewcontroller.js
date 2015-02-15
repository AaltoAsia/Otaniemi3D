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

        $scope.floorplans = Floorplans;
        $scope.sensorData = null;
        $scope.floorplanClass = floorplanClass;
        $scope.rooms = Rooms;
        $scope.searchString = '';
        $scope.highlightedRoom = null;
        $scope.roomValueType = 'temperature';


        /* These are ng-class definitions for buttons found in 2dview*/
        $scope.buttonClass = 'glyphicon glyphicon-resize-full';
        $scope.nextButtonClass = 'glyphicon glyphicon-arrow-right';
        $scope.previousButtonClass = 'glyphicon glyphicon-arrow-left';

        //Select default floorplan which is defined in Floorplans service
        $scope.planNumber = 0;
        for ($scope.planNumber; $scope.planNumber < $scope.floorplans.length; $scope.planNumber++) {
            if ($scope.floorplans[$scope.planNumber].isSelected) {
                $scope.selectedPlan = $scope.floorplans[$scope.planNumber];
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
                $scope.buttonClass = ' glyphicon glyphicon-resize-small';
            }
            else {
                $scope.floorplanClass= floorplanClass;
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
         * Change current floorplan to the one that user has selected.
         *//*
         $scope.selectPlan = function () {
         var i;
         for (i = 0; i < $scope.floorplans.length; i++) {
         if ($scope.floorplans[i].isSelected && $scope.floorplans[i] !== $scope.selectedPlan) {
         $scope.floorplans[i].isSelected = false;
         } else {
         if ($scope.selectedPlan === $scope.floorplans[i]) {
         $scope.floorplans[i].isSelected = true;
         }
         }
         }
         };*/

        /*
         * Change current floorplan to the previous of net floorplan
         * direction is either 1 if the user pressed next button or -1
         * if the user pressed previous button
         */
        $scope.selectPlan = function (direction) {
            if (direction === 1) {
                $scope.floorplans[$scope.planNumber].isSelected = false;
                $scope.floorplans[$scope.planNumber+1].isSelected = true;
                $scope.selectedPlan = $scope.floorplans[$scope.planNumber+1];
                $scope.planNumber++;
            }
            if (direction === -1) {
                $scope.floorplans[$scope.planNumber].isSelected = false;
                $scope.floorplans[$scope.planNumber-1].isSelected = true;
                $scope.selectedPlan = $scope.floorplans[$scope.planNumber-1];
                $scope.planNumber--;
            }
        };

        $scope.highlightRoom = function(item, model, label) {
            $scope.highlightedRoom = item;
            $scope.planNumber = $scope.highlightedRoom.floor;
        };

        $scope.onSelect = function ($item, $model, $label) {
            $scope.highlightRoom($item, $model, $label);
        };

        $scope.refreshRoomColor = function (type) {

            //Scale percentage to rgb value 0 - 255.
            function scaleTo255(percent) {
                return Math.round(255 * percent);
            }

            //Translate value between low and high parameters to a percentage
            function scaleValueLowHigh(value, low, high) {
                return Math.max(0, Math.min(1, (value - low) / (high - low)));
            }
            var value;
            for (var j = 0; j < Rooms.length; j++) {
                var room = Rooms[j];
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
                                max = 500;
                                break;
                            case 'light':
                                min = 0;
                                max = 1;
                                break;
                            case 'pir':
                                min = 15;
                                max = 35;
                                break;
                            case 'humidity':
                                min = 25;
                                max = 55;
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