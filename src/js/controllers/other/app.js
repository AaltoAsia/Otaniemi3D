'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:AppCtrl
 * @description
 * # AppCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('AppCtrl', function ($scope, $state, buildingData) {

    var self = this;

    self.navbarCollapse = true;
    self.building = buildingData.currentBuilding;
    self.allBuildings = buildingData.buildings;
    self.fullscreen = false;

    //states are defined in app/app.js
    self.navigation = [
      {
        state: 'heat-map',
        name: 'Heat Map'
      },
      {
        state: 'x3dom',
        name: '3D Model'
      },
      {
        state: 'analytics',
        name: 'Analytics'
      }
    ];

    //this function should be redefined in each controller that needs it
    self.resetPosition = function () {};

    $scope.$on('$stateChangeSuccess', function () {
      if ($state.current.name !== 'heat-map') {
        self.fullscreen = false;
      }
    });

    $scope.$watch(function () {
      return buildingData.currentBuilding;
    }, function (building) {
      self.building = building;
    });

    var unbindWatch = $scope.$watch(function () {
      return buildingData.buildings;
    }, function (buildings) {
      if (buildings) {
        self.allBuildings = buildings;
        unbindWatch();
      }
    });

  });
