'use strict';

describe('AnalyticsCtrl:', function () {

  // load the controller's module
  beforeEach(module('otaniemi3dApp'));

  var $controller, $rootScope, $scope,
      controller, $httpBackend, sensorRequest, roomRequest;

  var sensors = [
    {
      id: 'temperature-Room-101',
      type: 'temperature',
      room: 'Room 101',
      roomId: 'Room-101',
      name: 'Temperature',
      values: [],
      suffix: 'C',
      metaData: {}
    },
    {
      id: 'pir-Room-101',
      type: 'pir',
      room: 'Room 101',
      roomId: 'Room-101',
      name: 'Occupancy',
      values: [],
      suffix: '',
      metaData: {}
    },
  ];



  function requestRoom(roomId) {
    return {
      'Objects': {
        'Object': {
          'id': {
            'keyValue': 'K1'
          },
          'Object': {
            'id': {
              'keyValue': roomId
            }
          }
        }
      }
    };
  }

  function requestSensor(sensor) {
    var sensorRequest = requestRoom(sensor.roomId).Objects.Object.Object;
    sensorRequest.InfoItem = { '@name': sensor.type };

    return sensorRequest;
  }



  beforeEach(inject(function(_$controller_, _$rootScope_, _$httpBackend_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    $scope = $rootScope.$new();
    controller = $controller('AnalyticsCtrl', { $scope: $scope });

    sensorRequest = $httpBackend
      .when('POST',
            'http://otaniemi3d.cs.hut.fi/omi/node/',
            requestSensor(sensors[0]))
      .respond([sensors[0]]);

    roomRequest = $httpBackend
      .when('POST',
            'http://otaniemi3d.cs.hut.fi/omi/node/',
            requestRoom(sensors[0].roomId))
      .respond(sensors);
  }));

  afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });

  it('Initialised controller should have some time frames', function () {
      expect($scope.timeFrames).not.toBe(null);
  });

  it('Adding sensor should', function () {
      expect($scope.timeFrames).not.toBe(null);
  });

});
