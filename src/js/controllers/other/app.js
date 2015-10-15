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
    self.room = null;
    self.rooms = [];
    self.floor = 1;
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

    self.showViewSelection = false;

    self.resetPosition = function () {
      $scope.$broadcast('reset-position');
      self.room = null;
    };

    $scope.$on('$stateChangeSuccess', function () {
      if ($state.current.name !== 'heat-map') {
        self.fullscreen = false;
      }
      if ($state.current.name !== 'google-maps') {
        self.showViewSelection = true;
      } else {
        self.showViewSelection = false;
      }
    });

    $scope.$watch(function () {
      return buildingData.currentBuilding;
    }, function (newBuilding, oldBuilding) {
      if (newBuilding !== oldBuilding) {
        self.building = newBuilding;
        if (self.building) {
          self.rooms = self.building.rooms;
        } else {
          self.rooms = [];
        }
      }
    });

    $scope.$watch(function () {
      return self.room;
    }, function (room, oldRoom) {
      if (room !== oldRoom) {
        if (room) {
          self.floor = room.floor;
        } else {
          self.floor = 1;
        }
        $scope.$broadcast('room-selection-change', room);
      }
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
