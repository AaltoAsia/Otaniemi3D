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
    self.resetPosition = function noop () {};

    $scope.$on('$stateChangeSuccess', function () {
      if ($state.current.name !== 'heat-map') {
        self.fullscreen = false;
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
        var floor,
            roomId = '';

        if ($state.is('heat-map')) {
          floor = $state.params.floor;
        }
        if (room) {
          floor = room.floor;
          roomId = room.id;
        }
        if (floor) {
          $state.go('heat-map',
            {
              building: self.building.id,
              floor: floor,
              room: roomId
            });
        }
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
