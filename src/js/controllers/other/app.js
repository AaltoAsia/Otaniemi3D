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

    self.fullscreen = false;

    //helper function (can be used in child controllers)
    self.startsWith = function (str, substr) {
      return str.lastIndexOf(substr, 0) === 0;
    };

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

  });
