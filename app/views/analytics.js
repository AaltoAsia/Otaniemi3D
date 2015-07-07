'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:AnalyticsCtrl
 * @description
 * # AnalyticsCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('AnalyticsCtrl', function ($scope, Rooms) {

    $scope.selectedRoom = null;
    $scope.selectedSensor = null;
    $scope.sensorData = Rooms.dict;
    $scope.chartConfig = {
      options: {
        tooltip: {
          valueSuffix: '°C'
        }
      },
      xAxis: {
        type: 'datetime',
        title: {
          text: 'Time'
        }
      },
      series: [{
        name: '',
        data : []
      }]
    };

    $scope.selectSensor = function (room, sensor) {
      if (!sensor) {
        if (room.sensors && room.sensors.length > 0) {
          sensor = room.sensors[0];
        } else {
          return;
        }
      }

      $scope.selectedRoom = room;
      $scope.selectedSensor = sensor;

      var sensorData = [];

      for (var i = 0; i < sensor.values.length; i++) {
        sensorData.push([
          new Date(sensor.values[i].time).getTime(),
          sensor.values[i].value,
        ]);
      }

      $scope.chartConfig.series = [{
        name: sensor.type,
        data: sensorData
      }];

      $scope.chartConfig.title = $scope.selectedRoom.name + ': ' +
                                 $scope.selectedSensor.type;
      $scope.chartConfig.yAxis = {
        title: $scope.selectedSensor.type
      };
    };

    $scope.$on('sensordata-update', function (_, data) {
      $scope.sensorData = data.dict;
    });

  });
