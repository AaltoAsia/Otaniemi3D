'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.buildingData
 * @description
 * # buildingData
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('buildingData', function () {
    var self = this;

    self.buildings = null;
    self.currentBuilding = null;
  });
