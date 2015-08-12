'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:AppCtrl
 * @description
 * # AppCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('AppCtrl', function ($scope, $state) {

    var self = this;

    self.navbarCollapse = true;
    //states are defined in app/app.js
    self.navigation = [
      {
        state: 'sensor-list',
        name: 'Sensor List'
      },
      {
        state: 'heat-map',
        name: 'Heat Map'
      },
      {
        state: '3d-model',
        name: '3D Model'
      },
      {
        state: 'analytics',
        name: 'Analytics'
      }
    ];

    self.fullscreen = false;

    $scope.$on('$stateChangeSuccess', function () {
      if ($state.current.name !== 'heat-map') {
        self.fullscreen = false;
      }
    });

  });
