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
    $scope.sensorData = [];
    $scope.chartConfig = {
      options: {
        tooltip: {
          valueSuffix: '°C'
        }
      },
      xAxis: {
        type: 'datetime',
        title: {
          text: 'Date'
        }
      }
    };

    $scope.selectSensor = function (room, sensor) {
      if (!sensor) {
        if (room.sensors && room.sensors.length > 0) {
          sensor = room.sensors[0];
        } else {
          sensor = null;
        }
      }

      $scope.selectedRoom = room;
      $scope.selectedSensor = sensor;

      var sensorData = [];

      for (var i = 0; i < sensor.values.length; i++) {
        sensorData.push([
          //TODO: Find where sensor.values[i].time is transformed to a string.
          //It should always stay as a Date object.
          Number(sensor.values[i].time),
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

    Rooms.updateRoomInfo();

    $scope.$on('sensordata-update', function (event, data) {
      var treeData = [];
      var keys = Object.keys(data);
      for (var i = 0; i < keys.length; i++) {
        var room = data[keys[i]];
        room.text = room.name;
        room.children = [];

        for (var j = 0; j < room.sensors.length; j++) {
          var sensor = room.sensors[j];
          sensor.text = sensor.type;
          sensor.children = [];

          for (var k = 0; k < sensor.values.length; k++) {
            var sensorValue = sensor.values[k];
            var time = new Date(sensorValue.time).toUTCString();
            sensor.children.push({
              text: sensorValue.value + '  -  ' + time
            });
          }

          room.children.push(sensor);
        }

        treeData.push(room);
      }

      $scope.sensorData = treeData;
    });

  });
