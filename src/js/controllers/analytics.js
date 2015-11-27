'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:AnalyticsCtrl
 * @description
 * # AnalyticsCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('AnalyticsCtrl', function ($scope, $window, omiMessage, $modal, valueConverter) {

    $scope.infoItems = [];
    $scope.searchStr = '';
    //Bootstrap small size < 992px
    $scope.mobileDevice = $window.innerWidth < 992;

    angular.element($window).resize(function () {
      $scope.mobileDevice = $window.innerWidth < 992;
    });

    var chartColors = {
      temperature: '#f15c80',
      pir: '#90ed7d',
      light: '#f7a35c',
      co2: '#7e09e8',
      humidity: '#2150ff'
    };

    $scope.alert = {
      show: false,
      message: ''
    };
    $scope.chartConfig = {
      xAxis: {
        type: 'datetime'
      },
      yAxis: [
        {
          labels: {
            format: '{value}°C',
            style: {
              color: chartColors.temperature,
              fontWeight: 'bold'
            }
          },
          title: {
            text: 'Temperature',
            style: {
              color: chartColors.temperature,
              fontWeight: 'bold'
            }
          },
          id: 'temperature'
        },
        {
          labels: {
            format: '{value} lux',
            style: {
              color: chartColors.light,
              fontWeight: 'bold'
            }
          },
          title: {
            text: 'Light',
            style: {
              color: chartColors.light,
              fontWeight: 'bold'
            }
          },
          id: 'light'
        },
        {
          labels: {
            format: '{value}',
            style: {
              color: chartColors.pir,
              fontWeight: 'bold'
            }
          },
          title: {
            text: 'Pir',
            style: {
              color: chartColors.pir,
              fontWeight: 'bold'
            }
          },
          id: 'pir'
        },
        {
          labels: {
            format: '{value}%',
            style: {
              color: chartColors.humidity,
              fontWeight: 'bold'
            }
          },
          title: {
            text: 'Humidity',
            style: {
              color: chartColors.humidity,
              fontWeight: 'bold'
            }
          },
          id: 'humidity',
          opposite: true
        },
        {
          labels: {
            format: '{value} ppm',
            style: {
              color: chartColors.co2,
              fontWeight: 'bold'
            }
          },
          title: {
            text: 'CO2',
            style: {
              color: chartColors.co2,
              fontWeight: 'bold'
            }
          },
          id: 'co2',
          opposite: true
        }
      ],
      series: [{
        name: ' ',
        id: 'placeholder-series'
      }],
      title: {
        text: 'Data history'
      },
      noData: 'Add infoItems to drop area to see data chart'
    };

    var day, week, month, year;
    day = week = month = year = new Date();

    day.setDate(day.getDate() - 1);
    week.setDate(week.getDate() - 7);
    month.setMonth(month.getMonth() - 1);
    year.setYear(year.getYear() - 1);

    $scope.timeFrames = [
      { text: 'Current',
        icon: 'assets/shared/images/latest.svg',
        params: { newest: 20 } },
      { text: 'Last Week',
        icon: 'assets/shared/images/week.svg',
        params: { begin: week.toISOString() } },
      { text: 'Last Month',
        icon: 'assets/shared/images/month.svg',
        params: { begin: month.toISOString() } },
      { text: 'Last Year',
        icon: 'assets/shared/images/year.svg',
        params: { begin: year.toISOString() } },
      { text: 'Select range',
        icon: 'assets/shared/images/time-range.svg',
        params: { begin: null, end: null } },
    ];

    $scope.timeFrame = $scope.timeFrames[0];

    $scope.selectTime = function (timeFrame) {
      if (timeFrame.text === 'Select range') {
        $scope.modalInstance = $modal.open({
          templateUrl: 'html/templates/select-range.html',
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

    $scope.clearInfoItems = function () {
      $scope.infoItems = [];
      $scope.chartConfig.series = [{
        name: ' ',
        data : [],
        legend: {
          enabled: false
        },
        id: 'placeholder-series'
      }];
    };

    $scope.addInfoItem = function (infoItem) {
      if (angular.isArray(infoItem)) {
        if (!infoItem.length) {
          return;
        }
        angular.forEach(infoItem, function (value) {
          $scope.addInfoItem(value);
        });
        return;
      }

      for (var k = 0; k < $scope.chartConfig.series.length; k++) {
        if ($scope.chartConfig.series[k].id === infoItem.id) {
          return;
        }
      }

      //Split url to start after $scope.App.building.
      //e.g. 'otaniemi3d.cs.hut.fi/omi/node/Objects/K1/Room-101/temperature'
      //becames 'K1/Room-101/temperature'
      var path = infoItem.url.substring(infoItem.url.indexOf($scope.App.building.id));
      //This split results in ['K1', 'Room-101', 'temperature']
      var objects = path.split('/');
      //Because last value in objects array is InfoItem, we splice the
      //array and add the InfoItem later.
      var request = objects.slice(0, -1).reduce(function (prev, current) {
        return [prev[0] +
          '<Object>' +
            '<id>' + current + '</id>',
          '</Object>' +
          prev[1]];
      }, ['', '']);

      request = request[0] +
        '<InfoItem name="' + objects.pop() + '"/>' +
        request[1];

      var params = $scope.timeFrame.params;
      $scope.chartConfig.loading = true;

      omiMessage.send('read', request, params).then(function success (data) {
        var odfObject = data[0];
        var childObjects = odfObject.childObjects;
        var chartId = odfObject.id;

        while (childObjects && childObjects.length) {
          odfObject = childObjects[0];
          childObjects = odfObject.childObjects;
          chartId += '/' + odfObject.id;
        }

        var infoItem = odfObject.infoItems[0];
        infoItem.parent = odfObject.id;
        chartId += '/' + infoItem.name;
        $scope.infoItems.push(infoItem);
        var valueData = [];

        for (var j = 0; j < infoItem.values.length; j++) {
          valueData.push([
            new Date(infoItem.values[j].time).getTime(),
            Number(infoItem.values[j].value),
          ]);
        }

        if ($scope.chartConfig.series.length &&
            $scope.chartConfig.series[0].id === 'placeholder-series') {
          $scope.chartConfig.series = [];
        }

        var color = chartColors[infoItem.name] ?
          chartColors[infoItem.name] : '#707070';

        $scope.chartConfig.series.push({
          name: odfObject.id + ': ' + infoItem.name,
          data: valueData,
          tooltip: {
            valueSuffix: valueConverter.getValueUnit(infoItem.name)
          },
          id: chartId,
          yAxis: infoItem.name,
          color: color
        });

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

    $scope.dropInfoItem = function (event) {
      // body...
    };

  });
