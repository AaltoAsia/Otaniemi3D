'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:SensorListCtrl
 * @description
 * # SensorListCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')

  .controller('SensorListCtrl', function ($scope, Rooms) {

    $scope.gridOptions = {
      enableFiltering: true,
      data: Rooms.list,
      columnDefs: [
        { field: 'room' },
        { field: 'type' },
        { field: 'values[0].value', name: 'value' },
        { field: 'values[0].time.toISOString()', name: 'time' }
      ]
    };

    Rooms.updateRoomInfo();
    //$scope.gridOptions.data = Rooms.list;

    $scope.$on('sensordata-update', function(event, data) {
      $scope.gridOptions.data = Rooms.list;
    });

  });
