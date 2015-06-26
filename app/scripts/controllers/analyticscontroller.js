'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:AnalyticsCtrl
 * @description
 * # AnalyticsCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('analytics', function ($scope, Rooms) {

    $scope.selectedRoom = null;
    $scope.selectedSensor = null;

    Rooms.updateRoomInfo().then(function () {
      var treeData = [];
      var keys = Object.keys(Rooms.dict);
      for (var i = 0; i < keys.length; i++) {
        var room = Rooms.dict[keys[i]];
        room.text = room.name;
        room.children = [];

        for (var j = 0; j < room.sensors.length; j++) {
          var sensor = room.sensors[j];
          sensor.text = sensor.type;
          sensor.children = [];

          for (var k = 0; k < sensor.values.length; k++) {
            var sensorValue = sensor.values[k];
            sensor.children.push({
              text: sensorValue.value + ' - ' + 
                sensorValue.time.toUTCString()
            });
          }

          room.children.push(sensor);
        }

        treeData.push(room);
      }

      Rooms.dict['Entrance'].sensors = [
        {
          id: 'temperature_room_101a',
          type: 'temperature',
          values: [
            {
              timestamp: 1435238442,
              value: 20.1
            },
            {
              timestamp: 1435238455,
              value: 20.2
            },
            {
              timestamp: 1435238464,
              value: 20.1
            },
            {
              timestamp: 143523847,
              value: 20.3
            }
          ]
        },
        {
          id: 'light_room_101a',
          type: 'light',
          values: [
            {
              timestamp: 1435238460,
              value: 2070
            },
            {
              timestamp: 1435238470,
              value: 2070
            },
            {
              timestamp: 1435238480,
              value: 55
            },
            {
              timestamp: 143523890,
              value: 55
            }
          ]
        },
        {
          id: 'co2_room_101a',
          type: 'co2',
          value: [
            {
              timestamp: 1435238442,
              value: 120
            }
          ]
        }
      ];

      $scope.selectedRoom = Rooms.dict['Entrance'];

      $('#sensor-tree').jstree({
        plugins: ['search', 'sort'],
        core: {
          data: treeData
        }
      });
    });

    var chartOpt = {
      title: {
        text: ''
      },
      xAxis: {
        type: 'datetime',
        title: {
            text: 'Date'
        }
      },
      yAxis: {
        title: {
          text: ''
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },
      tooltip: {
        valueSuffix: '°C'
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
      },
      series: [{
        name: 'Sensor',
        data: []
      }]
    };

    var sensorChart = $('#sensor-chart').highcharts(chartOpt);

    $scope.$watch('selectedRoom', function (room) {
      if (room && room.sensors.length > 0) {
        $scope.selectedSensor = room.sensors[0];
        sensorChart.setTitle(room.name);
      }
    });

    $scope.$watch('selectedSensor', function (sensor) {
      if (sensor) {
        var sensorData = [];

        for (var i = 0; i < sensor.values.length; i++) {
          sensorData.push([
            sensor.values.time,
            sensor.values.value,
          ]);
        }

        sensorChart.addSeries({
          name: sensor.type,
          data: sensorData
        });

        sensorChart.yAxis[0].title = sensor.type;
      }
    });

  });
