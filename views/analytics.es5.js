'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:AnalyticsCtrl
 * @description
 * # AnalyticsCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp').controller('AnalyticsCtrl', function ($window, sensorApi, $modal) {
  var _this = this;

  this.sensor = null;
  this.sensors = [];
  this.searchStr = '';
  //Bootstrap small size < 992
  this.mobileDevice = $window.innerWidth < 992;

  angular.element($window).resize(function () {
    _this.mobileDevice = $window.innerWidth < 992;
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

  this.timeFrames = [{ text: 'Current',
    icon: 'images/latest.svg',
    params: { newest: 20 } }, { text: 'Last Week',
    icon: 'images/week.svg',
    params: { begin: week.toISOString() } }, { text: 'Last Month',
    icon: 'images/month.svg',
    params: { begin: month.toISOString() } }, { text: 'Last Year',
    icon: 'images/year.svg',
    params: { begin: year.toISOString() } }, { text: 'Select range',
    //icon: 'images/time-range.svg',
    params: { begin: null, end: null } }];

  this.timeFrame = this.timeFrames[0];

  this.selectTime = function (timeFrame) {
    if (timeFrame.text === 'Select range') {
      _this.modalInstance = $modal.open({
        templateUrl: 'templates/select-range.html',
        controller: 'ModalCtrl',
        controllerAs: 'modal',
        resolve: {
          params: function params() {
            return { timeFrame: timeFrame };
          }
        }
      });

      _this.modalInstance.result.then(function (params) {
        var time = params.timeFrame.params;

        if (time.begin && time.end) {
          _this.timeFrame = params.timeFrame;
          _this.timeFrame.params.begin = time.begin.toISOString();
          _this.timeFrame.params.end = time.end.toISOString();
        }
      });
    } else {
      _this.timeFrame = timeFrame;
    }
  };

  this.clearSensors = function () {
    _this.sensors = [];
    _this.sensor = null;
    _this.chartConfig.series = [{
      name: ' ',
      data: [],
      legend: {
        enabled: false
      },
      id: 'placeholder-series'
    }];
    _this.chartConfig.yAxis = {
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

  this.addSensor = function (sensor) {
    if (angular.isArray(sensor)) {
      if (!sensor.length) {
        return;
      }
      angular.forEach(sensor, function (value) {
        _this.addSensor(value);
      });
      return;
    }

    for (var k = 0; k < _this.chartConfig.series.length; k++) {
      if (_this.chartConfig.series[k].id === sensor.id) {
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

    var params = _this.timeFrame.params;
    _this.chartConfig.loading = true;

    sensorApi.send('read', request, params).then(function (data) {
      var selectedSensor = data[0],
          sensorData = [];

      _this.sensor = sensor;
      _this.sensors.push(sensor);

      for (var j = 0; j < selectedSensor.values.length; j++) {
        sensorData.push([new Date(selectedSensor.values[j].time).getTime(), selectedSensor.values[j].value]);
      }

      if (_this.chartConfig.series.length && _this.chartConfig.series[0].id === 'placeholder-series') {
        _this.chartConfig.series = [];
      }

      _this.chartConfig.series.push({
        name: selectedSensor.room + ': ' + selectedSensor.name,
        data: sensorData,
        tooltip: {
          valueSuffix: ' ' + selectedSensor.suffix
        },
        id: selectedSensor.id
      });

      if (_this.chartConfig.series.length > 1) {
        _this.chartConfig.yAxis.title.text = 'Values';
      } else if (selectedSensor.suffix) {
        _this.chartConfig.yAxis.title.text = selectedSensor.name + ' (' + selectedSensor.suffix + ')';
      } else {
        _this.chartConfig.yAxis.title.text = selectedSensor.name;
      }

      _this.alert.show = false;
      _this.alert.message = '';
    }, function (reason) {
      _this.alert.show = true;
      _this.alert.message = reason;
    })['finally'](function () {
      _this.chartConfig.loading = false;
    });
  };
});
