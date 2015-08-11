'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:AnalyticsCtrl
 * @description
 * # AnalyticsCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('AnalyticsCtrl', function ($window, sensorApi, $modal) {

    this.sensor = null;
    this.sensors = [];
    this.searchStr = '';
    //Bootstrap small size < 992px
    this.mobileDevice = $window.innerWidth < 992;

    angular.element($window).resize(() => {
      this.mobileDevice = $window.innerWidth < 992;
    });

    this.alert = {
      show: false,
      message: ''
    };
    this.chartConfig = {
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

    this.timeFrames = [
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

    this.timeFrame = this.timeFrames[0];

    this.selectTime = (timeFrame) => {
      if (timeFrame.text === 'Select range') {
        this.modalInstance = $modal.open({
          templateUrl: 'templates/select-range.html',
          controller: 'ModalCtrl',
          controllerAs: 'modal',
          resolve: {
            params() {
              return {timeFrame};
            }
          }
        });

        this.modalInstance.result.then((params) => {
          var time = params.timeFrame.params;

          if (time.begin && time.end) {
            this.timeFrame = params.timeFrame;
            this.timeFrame.params.begin = time.begin.toISOString();
            this.timeFrame.params.end = time.end.toISOString();
          }
        });
      } else {
        this.timeFrame = timeFrame;
      }
    };

    this.clearSensors = () => {
      this.sensors = [];
      this.sensor = null;
      this.chartConfig.series = [{
        name: ' ',
        data : [],
        legend: {
          enabled: false
        },
        id: 'placeholder-series'
      }];
      this.chartConfig.yAxis = {
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

    this.addSensor = (sensor) => {
      if (angular.isArray(sensor)) {
        if (!sensor.length) {
          return;
        }
        angular.forEach(sensor, (value) => {
          this.addSensor(value);
        });
        return;
      }

      for (var k = 0; k < this.chartConfig.series.length; k++) {
        if (this.chartConfig.series[k].id === sensor.id) {
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
              'keyValue': sensor.room
            },
            'InfoItem': {
              '@name': sensor.name
            }
          }
        }
      };

      var params = this.timeFrame.params;
      this.chartConfig.loading = true;

      sensorApi.send('read', request, params).then((data) => {
        var selectedSensor = data[0],
            sensorData = [];

        this.sensor = sensor;
        this.sensors.push(sensor);

        for (var j = 0; j < selectedSensor.values.length; j++) {
          sensorData.push([
            new Date(selectedSensor.values[j].time).getTime(),
            selectedSensor.values[j].value,
          ]);
        }

        if (this.chartConfig.series.length &&
            this.chartConfig.series[0].id === 'placeholder-series') {
          this.chartConfig.series = [];
        }

        this.chartConfig.series.push({
          name: selectedSensor.room + ': ' + selectedSensor.name,
          data: sensorData,
          tooltip: {
            valueSuffix: ' ' + selectedSensor.suffix
          },
          id: selectedSensor.id
        });

        if (this.chartConfig.series.length > 1) {
          this.chartConfig.yAxis.title.text = 'Values';
        } else if (selectedSensor.suffix) {
          this.chartConfig.yAxis.title.text = selectedSensor.name +
            ' (' + selectedSensor.suffix + ')';
        } else {
          this.chartConfig.yAxis.title.text = selectedSensor.name;
        }

        this.alert.show = false;
        this.alert.message = '';

      }, (reason) => {
        this.alert.show = true;
        this.alert.message = reason;
      })
      .finally(() => {
        this.chartConfig.loading = false;
      });
    };

  });
