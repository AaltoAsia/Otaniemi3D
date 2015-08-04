'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:AnalyticsCtrl
 * @description
 * # AnalyticsCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('AnalyticsCtrl', function ($scope, sensorApi, $modal) {

    $scope.room = null;
    $scope.sensor = null;
    $scope.sensors = [];
    $scope.searchStr = '';
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
      { text: 'Current',
        icon: 'images/latest.svg',
        params: { newest: 20 } },
      { text: 'Last Week',
        icon: 'images/week.svg',
        params: { begin: week.toISOString() } },
      { text: 'Last Month',
        icon: 'images/month.svg',
        params: { begin: month.toISOString() } },
      { text: 'Last Year',
        icon: 'images/year.svg',
        params: { begin: year.toISOString() } },
      { text: 'Select range',
        //icon: 'images/time-range.svg',
        params: { begin: null, end: null } },
    ];

    $scope.timeFrame = $scope.timeFrames[0];

    $scope.selectTime = function (timeFrame) {
      if (timeFrame.text === 'Select range') {
        $scope.modalInstance = $modal.open({
          templateUrl: 'templates/select-range.html',
          controller: 'ModalCtrl',
          controllerAs: 'modal',
          resolve: {
            params: function () {
              return {
                timeFrame: timeFrame
              };
            }
          }
        });

        $scope.modalInstance.result.then(function (params) {
          var time = params.timeFrame.params;

          if (time.begin && time.end) {
            $scope.timeFrame = params.timeFrame;
            $scope.timeFrame.params.begin = time.begin.toISOString();
            $scope.timeFrame.params.end = time.end.toISOString();
          }
        });
      } else {
        $scope.timeFrame = timeFrame;
      }
    };

    $scope.clearSensors = function () {
      $scope.sensors = [];
      $scope.sensor = null;
      $scope.room = null;
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
      };

      var params = $scope.timeFrame.params;
      $scope.chartConfig.loading = true;

      sensorApi.send('read', request, params).then(function success (data) {
        var selectedSensor = data[0],
            sensorData = [];

        $scope.room = room;
        $scope.sensor = sensor;
        $scope.sensors.push(sensor);

        for (var j = 0; j < selectedSensor.values.length; j++) {
          sensorData.push([
            new Date(selectedSensor.values[j].time).getTime(),
            selectedSensor.values[j].value,
          ]);
        }

        if ($scope.chartConfig.series.length &&
            $scope.chartConfig.series[0].id === 'placeholder-series') {
          $scope.chartConfig.series = [];
        }

        $scope.chartConfig.series.push({
          name: selectedSensor.room + ': ' + selectedSensor.name,
          data: sensorData,
          tooltip: {
            valueSuffix: ' ' + selectedSensor.suffix
          },
          id: selectedSensor.id
        });

        if ($scope.chartConfig.series.length > 1) {
          $scope.chartConfig.yAxis.title.text = 'Values';
        } else if (selectedSensor.suffix) {
          $scope.chartConfig.yAxis.title.text = selectedSensor.name +
            ' (' + selectedSensor.suffix + ')';
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

  });
