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
    $scope.alert = {
      show: false,
      message: ''
    };
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
        id: 'placeholder-series'
      }],
      title: {
        text: 'Historical data'
      },
      noData: 'Add sensors to drop area to see data chart'
    };

    var day, week, month, year;
    day = week = month = year = new Date();

    day.setDate(day.getDate() - 1);
    week.setDate(week.getDate() - 7);
    month.setMonth(month.getMonth() - 1);
    year.setYear(year.getYear() - 1);

    $scope.timeFrames = [
      {
        text: 'Current',
        icon: 'images/latest.svg',
        params: {
          newest: 20
        },
      },
      {
        text: 'Last Week',
        icon: 'images/week.svg',
        params: {
          begin: week.toISOString()
        }
      },
      {
        text: 'Last Month',
        icon: 'images/month.svg',
        params: {
          begin: month.toISOString()
        }
      },
      {
        text: 'Last Year',
        icon: 'images/year.svg',
        params: {
          begin: year.toISOString()
        }
      },
      {
        text: 'Select range',
        icon: 'images/time-range.svg',
        params: {
          begin: null,
          end: null
        }
      },
    ];

    $scope.selectedTimeFrame = $scope.timeFrames[0];

    $scope.selectTime = function (timeFrame) {
      $scope.selectedTimeFrame = timeFrame;
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

      var params = $scope.selectedTimeFrame.params;
      $scope.chartConfig.loading = true;

      Rooms.get(request, params).then(function success (data) {
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

        $scope.alert.show = false;
        $scope.alert.message = '';

      }, function error (reason) {
        $scope.alert.show = true;
        $scope.alert.message = reason;
      })
      .finally(function () {
        $scope.chartConfig.loading = false;
      });
    };

    $scope.$on('sensordata-update', function (_, data) {
      $scope.sensorData = data.dict;
    });

  });
