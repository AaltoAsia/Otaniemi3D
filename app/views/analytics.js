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
    $scope.selectedSensors = [];
    $scope.searchStr = '';
    $scope.sensorData = Rooms.dict;
    $scope.chartConfig = {
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
        },
        id: 'placeholder-y-axis'
      },
      series: [{
        name: '',
        data : [],
        legend: {
          enabled: false
        },
        id: 'placeholder-series'
      }],
      title: {
        text: 'Historical data'
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

        var valueSuffix = Rooms.valueSuffix(sensor.type);

        $scope.chartConfig.series = [{
          name: room.name + ': ' + sensor.name,
          data: sensorData,
          tooltip: {
            valueSuffix: ' ' + valueSuffix
          },
          id: sensor.id
        }];

        if (valueSuffix) {
          $scope.chartConfig.yAxis.title.text =
            sensor.name + ' (' + valueSuffix + ')';
        } else {
          $scope.chartConfig.yAxis.title.text =
            sensor.name;
        }
      });
    };

    $scope.addSensor = function (room, sensor) {
      var roomId = room.id;

      Rooms.get(room).then(function (data) {
        var sensorData = [],
            room = data[roomId];

        if (!room || !room.sensors) {
          return;
        }

        for (var i = 0; i < room.sensors.length; i++) {
          if (room.sensors[i].sensorId === sensor.sensorId) {
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

        var valueSuffix = Rooms.valueSuffix(sensor.type);

        if (valueSuffix) {
          $scope.chartConfig.yAxis.title.text =
            sensor.name + ' (' + valueSuffix + ')';
        } else {
          $scope.chartConfig.yAxis.title.text =
            sensor.name;
        }

        if ($scope.chartConfig.series[0].id === 'placeholder-series') {
          $scope.chartConfig.series = [];
        }

        $scope.chartConfig.series.push({
          name: room.name + ': ' + sensor.name,
          data: sensorData,
          tooltip: {
            valueSuffix: ' ' + valueSuffix
          },
          id: sensor.id
        });

        if ($scope.chartConfig.series.length > 1) {
          $scope.chartConfig.yAxis.title.text = 'Values';
        } else if (valueSuffix) {
          $scope.chartConfig.yAxis.title.text =
            sensor.name + ' (' + valueSuffix + ')';
        } else {
          $scope.chartConfig.yAxis.title.text =
            sensor.name;
        }
      });
    };

    $scope.$on('sensordata-update', function (_, data) {
      $scope.sensorData = data.dict;
    });

  });
