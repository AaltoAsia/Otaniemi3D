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

    Rooms.updateRoomInfo();

    $('#sensor-tree').jstree({
      plugins: ['search', 'sort'],
      core: {
        check_callback: true,
        data: []
      }
    });

    $scope.chartConfig = {
      xAxis: {
        type: 'datetime',
        title: {
          text: 'Date'
        }
      },
      tooltip: {
        valueSuffix: '°C'
      },
      series: [{
        data: [
          [1,2],
          [3,4]
        ]
      }]
    };
    /*
    if ($('#sensor-chart').highcharts()) {
      $('#sensor-chart').highcharts().destroy();
    }
    $('#sensor-chart').highcharts(chartOpt);
    var sensorChart = $('#sensor-chart').highcharts();
    console.log(Highcharts.charts.length);
    */
    $scope.$watch('selectedRoom', function (room) {
      if (room && room.sensors.length > 0) {
        $scope.selectedSensor = room.sensors[0];
        //sensorChart.setTitle(room.name);
      }
    });

    $scope.$watch('selectedSensor', function (sensor) {
      if (sensor) {
        var sensorData = [];

        for (var i = 0; i < sensor.values.length; i++) {
          sensorData.push([
            sensor.values[i].time,
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
        
        /*
        sensorChart.setTitle({
          text: $scope.selectedRoom.name + ': ' + sensor.type
        });
        sensorChart.yAxis[0].setTitle({
          text: sensor.type
        });
        sensorChart.series[0].remove();
        sensorChart.addSeries({
          name: sensor.type,
          data: sensorData
        }, true);
        */
      }
    });

    $scope.$on('sensordata-update', function (event, data) {

      Rooms.dict['Entrance'].sensors = [
        {
          id: 'temperature_room_Entrance',
          type: 'temperature',
          values: [
            {
              time: new Date(1435238442000),
              value: 20.1
            },
            {
              time: new Date(1435238455000),
              value: 20.2
            },
            {
              time: new Date(1435238464000),
              value: 20.1
            },
            {
              time: new Date(143523847000),
              value: 20.3
            }
          ]
        },
        {
          id: 'light_room_101a',
          type: 'light',
          values: [
            {
              time: new Date(1435238460000),
              value: 2070
            },
            {
              time: new Date(1435238470000),
              value: 2070
            },
            {
              time: new Date(1435238480000),
              value: 55
            },
            {
              time: new Date(143523890000),
              value: 55
            }
          ]
        },
        {
          id: 'co2_room_101a',
          type: 'co2',
          values: [
            {
              time: new Date(1435238442000),
              value: 120
            }
          ]
        }
      ];

      $scope.selectedRoom = Rooms.dict['Entrance'];

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
            sensor.children.push({
              text: sensorValue.value + ' - ' +
                sensorValue.time.toUTCString()
            });
          }

          room.children.push(sensor);
        }

        treeData.push(room);
      }

      $('#sensor-tree').jstree(true).settings.core.data = treeData;
      $('#sensor-tree').jstree(true).refresh();
    });

  });
