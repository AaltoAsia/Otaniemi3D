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
        },
        legend: {
          enabled: false
        }
      },
      xAxis: {
        type: 'datetime'
      },
      yAxis: {
        title: {
          text: 'Values (unit)',
          rotation: 0,
          offset: 0,
          align: 'high',
          y: -20
        }
      },
      series: [{
        name: '',
        data : []
      }],
      title: {
        text: 'Historical data'
      },
      subtitle: {
        text: ''
      }
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

      Rooms.get(room).then(function (data) {
        var sensorData = [],
            sensor,
            room = data[$scope.selectedRoom.id];

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
          name: sensor.name,
          data: sensorData
        }];

        var valueSuffix = Rooms.valueSuffix(sensor.type);

        $scope.chartConfig.subtitle.text = room.name;
        $scope.chartConfig.yAxis.title.text = valueSuffix ?
          sensor.name + ' (' + valueSuffix + ')' : sensor.name;
        $scope.chartConfig.options.tooltip.valueSuffix = ' ' + valueSuffix;
      });
    };

    $scope.$on('sensordata-update', function (_, data) {
      $scope.sensorData = data.dict;
    });

  });
