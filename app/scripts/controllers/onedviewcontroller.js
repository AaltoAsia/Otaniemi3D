'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:OneDViewCtrl
 * @description
 * # oneDViewCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')

  .controller('onedview', function ($scope, $location, Rooms) {

    $scope.gridOptions = {
      enableFiltering: true
      /*,
      columnDefs: [
        {
          field: 'room',
          filters: [
            {
              condition:  function(searchTerm, cellValue) {
                var strippedValue = cellValue.toLowerCase();
                return strippedValue.indexOf(searchTerm.toLowerCase()) >= 0;
              },
              placeholder: 'room name'
            }
          ]
        },
        {
          field: 'type',
          filters: [
            {
              condition:  function(searchTerm, cellValue) {
                var strippedValue = cellValue.toLowerCase();
                return strippedValue.indexOf(searchTerm.toLowerCase()) >= 0;
              },
              placeholder: 'sensor type'
            }
          ]
        },
        {
          field: 'value',
          filters: [
            {
              condition: uiGridConstants.filter.GREATER_THAN,
              placeholder: 'greater than'
            },
            {
              condition: uiGridConstants.filter.LESS_THAN,
              placeholder: 'less than'
            }
          ]
        }
      ]
      */
    };

    Rooms.updateRoomInfo().then(function () {
      var sensorList = [];

      var keys = Object.keys(Rooms.dict);
      for (var i = 0; i < keys.length; i++) {
        var room = Rooms.dict[keys[i]];
        var sensors = room.sensors;

        for (var j = 0; j < sensors.length; j++) {
          var sensor = sensors[j];
          sensor.room = room.name;
          sensor.roomId = keys[i];

          sensorList.push(sensor);
        }
      }

      $scope.gridOptions.data = sensorList;
    });

  });