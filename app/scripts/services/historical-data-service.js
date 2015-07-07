'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.HistoricalData
 * @description
 * # HistoricalData
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('HistoricalData', function ($q, $rootScope, SensorData) {

    var self = this;

    this.dict = {};

    this.get = function (room) {
      var deferred = $q.defer();

      SensorData.get(room.id, {newest: 20}, 'sensordata-historical')
        .then(function (data) {
          deferred.resolve(data);
        });

      return deferred.promise;
    };

    $rootScope.$on('sensordata-historical', function (_, data) {
      self.dict = data;
    });

  });
