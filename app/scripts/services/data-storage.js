'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.dataStorage
 * @description
 * # dataStorage
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('dataStorage', function ($rootScope) {

    var self = this;

    self.sensors = [];

    self.sensorsAsJson = '';

    $rootScope.$on('sensordata-new', function (_, data) {
      self.sensors = data;
      //self.sensorsAsJson = JSON.stringify(data);
      $rootScope.$broadcast('sensordata-update', data);
    });

  });
