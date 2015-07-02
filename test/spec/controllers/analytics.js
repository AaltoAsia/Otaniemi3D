'use strict';

describe('AnalyticsCtrl:', function () {

  // load the controller's module
  beforeEach(module('otaniemi3dApp'));

  var $controller, $rootScope,

      name = 'Room 101',
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

  beforeEach(inject(function(_$controller_, _$rootScope_){
    //The injector unwraps the underscores (_) from around
    //the parameter names when matching
    $controller = _$controller_;
    $rootScope = _$rootScope_;
  }));

  describe('Receiving \'sensordata-update\' event', function () {
    var $scope, controller;

    beforeEach(function() {
      $scope = $rootScope.$new();
      controller = $controller('AnalyticsCtrl', { $scope: $scope });
    });

    beforeEach(function () {
      $rootScope.$broadcast('sensordata-update', {'Room-101': room});
    });

    it('should set data for the $scope.sensorData', function () {
      expect($scope.sensorData).not.toBe(null);
    });

  });

  describe('$scope.selectSensor()', function () {
    var $scope, controller;

    beforeEach(function() {
      $scope = $rootScope.$new();
      controller = $controller('AnalyticsCtrl', { $scope: $scope });
    });

    it('should select correct sensor', function () {
      $scope.selectSensor(room, room.sensors[0]);
      expect($scope.selectedSensor).toBe(room.sensors[0]);
    });

    it('should work with a room as a parameter', function () {
      $scope.selectSensor(room, room.sensors[0]);
      expect($scope.selectedSensor).toBe(room.sensors[0]);
      expect($scope.selectedRoom).toBe(room);
    });

    it('should update $scope.chartConfig', function () {
      var sensor = room.sensors[0];
      var data = [
        [values1[0].time, values1[0].value],
        [values1[1].time, values1[1].value]
      ];
      $scope.selectSensor(room, room.sensors[0]);
      expect($scope.chartConfig.series).toEqual([{
        name: sensor.type,
        data: data,
      }]);
      expect($scope.chartConfig.title).toEqual(room.name + ': ' + sensor.type);
      expect($scope.chartConfig.yAxis).toEqual({title: sensor.type});
    });

  });

});
