'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:AnalyticsCtrl
 * @description
 * # AnalyticsCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('AnalyticsCtrl', function ($scope, Rooms, HistoricalData) {

    $scope.selectedRoom = null;
    $scope.selectedSensor = null;
    $scope.sensorData = Rooms.dict;
    $scope.historicalData = HistoricalData.dict;
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

      HistoricalData.get(room).then(function (data) {
        var sensorData = [];
        var sensor;
        var room = data[$scope.selectedRoom.id];

        if (!room || !room.sensors) {
          return;
        }

        for (var i = 0; i < room.sensors.length; i++) {
          if (room.sensors[i].sensorId === $scope.selectedSensor.sensorId) {
            sensor = room.sensors[i];
            break;
          }
        }

        for (var j = 0; j < sensor.values.length; j++) {
          sensorData.push([
            new Date(sensor.values[j].time).getTime(),
            sensor.values[j].value,
          ]);
        }

        $scope.chartConfig.series = [{
          name: sensor.type,
          data: sensorData
        }];

        $scope.chartConfig.title = room.name + ': ' + sensor.type;
        $scope.chartConfig.yAxis = {
          title: sensor.type
        };
      });
    };

    $scope.$on('sensordata-update', function (_, data) {
      $scope.sensorData = data.dict;
    });

  });
