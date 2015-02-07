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

        $scope.floorplans = Floorplans;
        $scope.sensorData = null;
        $scope.floorplanClass = 'floorplan';
        $scope.rooms = Rooms;
        $scope.searchString = '';

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
            if ($scope.floorplanClass === 'floorplan') {
                $scope.floorplanClass = 'floorplan-fullscreen';
                $scope.buttonClass = ' glyphicon glyphicon-resize-small';
            }
            else {
                $scope.floorplanClass= 'floorplan';
                $scope.buttonClass = ' glyphicon glyphicon-resize-full';
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
      
    	}
  
  	    $scope.onSelect = function ($item, $model, $label) {
          $scope.$item = $item;
      	  $scope.$model = $model;
          $scope.$label = $label;
          $scope.highlightRoom($item, $model, $label);
    };
    });