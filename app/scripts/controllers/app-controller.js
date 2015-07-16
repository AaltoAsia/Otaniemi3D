'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:AppCtrl
 * @description
 * # AppCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('AppCtrl', function ($scope, $location) {

    var self = this;

    self.fullscreen = false;
    self.navbarCollapse = true;
    //states are defined in app.js
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

    //helper function (can be used in child controllers)
    $scope.startsWith = function (str, substr) {
      return str.lastIndexOf(substr, 0) === 0;
    };

    $scope.$on('$routeChangeSuccess', function () {
      if (!self.startsWith($location.path(), '/heat-map')) {
        self.fullscreen = false;
      }
    });

  });
