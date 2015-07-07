'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.HistoricalData
 * @description
 * # HistoricalData
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('HistoricalData', function ($rootScope, SensorData) {

    var self = this,
        debug = true,
        debugFile = 'odf-requests/response-historical.xml';

    if (debug) {
      SensorData.get(debugFile, 'sensordata-historical');
    }

    this.dict = {};

    $rootScope.$on('sensordata-historical', function (_, data) {
      self.dict = data;
    });

  });
