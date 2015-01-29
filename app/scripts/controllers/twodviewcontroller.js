'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:twoDViewCtrl
 * @description
 * # twoDViewCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('twodview', function ($scope, Datahandler, Floorplans) {

    $scope.floorplans = Floorplans;
    $scope.sensorData = null;
    $scope.floorplanClass = 'floorplan';
  
    //Select default floorplan which is defined in Floorplans service
    var i;
    for (i = 0; i < $scope.floorplans.length; i++) {
      if ($scope.floorplans[i].isSelected) {
        $scope.selectedPlan = $scope.floorplans[i];
      }
    }

    $scope.toggleFullscreen = function(){
        $scope.$$prevSibling.fullscreen = !$scope.$$prevSibling.fullscreen;
        if ($scope.floorplanClass === 'floorplan') {
            $scope.floorplanClass = 'floorplan-fullscreen';
        }
        else {
            $scope.floorplanClass= 'floorplan';
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
    */
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
    };
    
  });
