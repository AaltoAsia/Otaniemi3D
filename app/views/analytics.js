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

    function selectRoom(room) {
      $scope.selectedRoom = room;
      selectSensor(room.sensors[0]);
    }

    function selectSensor(sensor) {
      var sensorData = [];
      $scope.selectedSensor = sensor;

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
    }

    Rooms.updateRoomInfo();

    var sensorTree = $('#sensor-tree').jstree({
      plugins: ['search', 'sort'],
      core: {
        check_callback: true,
        data: []
      }
    });

    sensorTree.on('select_node.jstree', function(event, data) {
      if(!$scope.$$phase) {
        //Use $apply because jstree works outside of angular's scope
        $scope.$apply(function() {
          var node = data.node;
          if (node.original.sensors) {
            selectRoom(node.original);
          } else if (node.original.values) {
            //TODO: Make this return the room object and not a jquery object
            //var room = $('#jstree').jstree('get_json', node.parent);
            //$scope.selectedRoom = room;
            selectSensor(node.original);
          }
        });
      }
    });

    /*
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

      }
    });
    */

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

      $('#sensor-tree').jstree(true).settings.core.data = treeData;
      $('#sensor-tree').jstree(true).refresh();
    });

  });
