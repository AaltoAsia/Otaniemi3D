'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:SensorListCtrl
 * @description
 * # SensorListCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('SensorListCtrl', function ($scope, dataStorage) {

    $scope.gridOptions = {
      enableFiltering: true,
      data: dataStorage.sensors,
      columnDefs: [
        { field: 'room' },
        { field: 'name', name: 'type' },
        { field: 'values[0].value', name: 'value' },
        { field: 'values[0].time.toISOString()', name: 'time' }
      ]
    };

    $scope.$on('sensordata-update', function (_, data) {
      $scope.gridOptions.data = data;
    });

  });
