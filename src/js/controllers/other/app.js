'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:AppCtrl
 * @description
 * # AppCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('AppCtrl', function ($scope, $state, buildingData, $http, omiMessage) {

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

    self.getName = function (roomId) {
      if (roomId) {
        return roomId.replace('-', ' ');
      }
    };

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
        self.rooms = [];
        if (newBuilding) {
          $http.get('https://otaniemi3d.cs.hut.fi/omi/node/Objects/' +
                            newBuilding.id)
            .then(function (response) {
              self.rooms = omiMessage.parseObject(response.data).objects;
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
