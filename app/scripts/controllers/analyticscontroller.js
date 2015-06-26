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

    $scope.room = null;
    $scope.sensor = null;

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

      $scope.room = {
        name: '101a',
        sensors: [
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
        ]
      };

      $('#sensor-tree').jstree({
        core: {
          data: treeData
        }
      });
    });

    var chartOpt = {
      title: {
        text: 'Room 101: Temperature'
      },
      xAxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      yAxis: {
        title: {
          text: 'Temperature (°C)'
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
        name: 'Tokyo',
        data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
      }, {
        name: 'New York',
        data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
      }, {
        name: 'Berlin',
        data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
      }, {
        name: 'London',
        data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
      }]
    };

    $('#sensor-chart').highcharts(chartOpt);

  });
