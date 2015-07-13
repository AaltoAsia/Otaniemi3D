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
        name: ' ',
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

    $scope.clearSensors = function () {
      $scope.selectedSensors = [];
      $scope.selectedSensor = null;
      $scope.selectedRoom = null;
      $scope.chartConfig.series = [{
        name: ' ',
        data : [],
        legend: {
          enabled: false
        },
        id: 'placeholder-series'
      }];
      $scope.chartConfig.yAxis = {
        title: {
          text: 'Values (unit)',
          rotation: 0,
          offset: 0,
          align: 'high',
          y: -20
        },
        id: 'placeholder-y-axis'
      };
    };
    /*
    $scope.selectSensor = function (room, sensor) {
      $scope.selectedRoom = room;
      $scope.selectedSensor = sensor;
      $scope.selectedSensors = [sensor];

      var request = {
        'Objects': {
          'Object': {
            'id': {
              'keyValue': 'K1'
            },
            'Object': {
              'id': {
                'keyValue': room.id
              }
            }
          }
        }
      };

      Rooms.get(request).then(function (data) {
        var sensorData = [],
            sensor,
            room = data[$scope.selectedRoom.id];

        if (!room || !room.sensors) {
          return;
        }

        for (var i = 0; i < room.sensors.length; i++) {
          if (room.sensors[i].id === $scope.selectedSensor.id) {
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
    };*/

    $scope.addSensor = function (room, sensor) {
      for (var k = 0; k < $scope.chartConfig.series.length; k++) {
        if ($scope.chartConfig.series[k].id === sensor.id) {
          return;
        }
      }

      // Request must follow JXON notation and comply with ODF.
      // https://developer.mozilla.org/en-US/docs/JXON
      var request = {
        'Objects': {
          'Object': {
            'id': {
              'keyValue': 'K1'
            },
            'Object': {
              'id': {
                'keyValue': room.id
              },
              'InfoItem': {
                '@name': sensor.original.name
              }
            }
          }
        }
      };

      $scope.chartConfig.loading = true;

      Rooms.get(request).then(function success (data) {
        var sensorData = [],
            selectedRoom = data[room.id],
            selectedSensor;

        if (!selectedRoom || !selectedRoom.sensors) {
          return;
        }

        for (var i = 0; i < selectedRoom.sensors.length; i++) {
          if (selectedRoom.sensors[i].id === sensor.id) {
            selectedSensor = selectedRoom.sensors[i];
            break;
          }
        }

        $scope.selectedRoom = room;
        $scope.selectedSensor = sensor;
        $scope.selectedSensors.push(sensor);

        for (var j = 0; j < selectedSensor.values.length; j++) {
          sensorData.push([
            new Date(selectedSensor.values[j].time).getTime(),
            selectedSensor.values[j].value,
          ]);
        }

        var valueSuffix = Rooms.valueSuffix(selectedSensor.type);

        if ($scope.chartConfig.series.length &&
            $scope.chartConfig.series[0].id === 'placeholder-series') {
          $scope.chartConfig.series = [];
        }

        $scope.chartConfig.series.push({
          name: selectedRoom.name + ': ' + selectedSensor.name,
          data: sensorData,
          tooltip: {
            valueSuffix: ' ' + valueSuffix
          },
          id: selectedSensor.id
        });

        if ($scope.chartConfig.series.length > 1) {
          $scope.chartConfig.yAxis.title.text = 'Values';
        } else if (valueSuffix) {
          $scope.chartConfig.yAxis.title.text = selectedSensor.name +
            ' (' + valueSuffix + ')';
        } else {
          $scope.chartConfig.yAxis.title.text = selectedSensor.name;
        }

      })
      .finally(function () {
        $scope.chartConfig.loading = false;
      });
    };

    $scope.$on('sensordata-update', function (_, data) {
      $scope.sensorData = data.dict;
    });

  });
