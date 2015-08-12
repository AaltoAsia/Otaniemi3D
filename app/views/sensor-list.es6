'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:SensorListCtrl
 * @description
 * # SensorListCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('SensorListCtrl', function ($scope, dataStorage, sensorApi) {

    this.gridOptions = {
      enableFiltering: true,
      data: dataStorage.sensors,
      columnDefs: [
        { field: 'room' },
        { field: 'name', name: 'type' },
        { field: 'values[0].value', name: 'value' },
        { field: 'values[0].time.toISOString()', name: 'time' }
      ]
    };

    var requestK1 = {
      'Object': {
        'id': {
          'keyValue': 'K1'
        }
      }
    };

    sensorApi.send('read', requestK1).then((data) => {
      this.gridOptions.data = data;
    });

  });
