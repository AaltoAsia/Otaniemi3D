'use strict';

describe('AnalyticsCtrl', function () {

  // load the controller's module
  beforeEach(module('otaniemi3dApp'));

  var $controller,
      sensorId1 = 'temperature-Room-101',
      sensorId2 = 'co2-Room-101',
      type1= 'temperature',
      type2= 'co2',
      values1 = [
        {
          value: 23,
          time: 1435754223000
        },
        {
          value: 24,
          time: 1435754228000
        }
      ],
      values2 = [
        {
          value: 501,
          time: 1435754255000
        },
        {
          value: 434,
          time: 1435754261000
        }
      ],
      node = null,

      room = {
        name: name,
        sensors: [
          {
            sensorId: sensorId1,
            type: type1,
            values: values1
          },
          {
            sensorId: sensorId2,
            type: type2,
            values: values2
          }
        ],
        node: node
      };

  beforeEach(inject(function(_$controller_){
    //The injector unwraps the underscores (_) from around 
    //the parameter names when matching
    $controller = _$controller_;
  }));

  describe('selectRoom()', function () {
    var $scope, controller;

    beforeEach(function() {
      $scope = {};
      controller = $controller('AnalyticsCtrl', { $scope: $scope });
    });

    beforeEach(function () {
      $scope.selectRoom(room);
    });

    it('should set correct room for the $scope.selectedRoom', function () {
      expect($scope.selectedRoom).toEqual(room);
    });

  });

  describe('selectSensor()', function () {
    var $scope, controller, sensor;

    beforeEach(function() {
      $scope = {};
      controller = $controller('AnalyticsCtrl', { $scope: $scope });
    });

    beforeEach(function () {
      sensor = room.sensors[0];
      $scope.selectSensor(sensor);
    });

    it('should set correct sensor for the $scope.selectedSensor', function () {
      expect($scope.selectedSensor).toEqual(room.sensors[0]);
    });

    it('should update $scope.chartConfig', function () {
      expect($scope.chartConfig.series[0]).toEqual({
        name: 'temperature',
        data: [
          [values1[0].value, values1[0].time],
          [values2[0].value, values2[0].time]
        ]
      });
    });

  });

});