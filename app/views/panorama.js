'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:PanoramaCtrl
 * @description
 * # PanoramaCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('PanoramaCtrl',
  function ($scope, $stateParams, $window, Rooms) {

    var roomId = $stateParams.roomId;
    if (roomId.lastIndexOf('Room', 0) !== 0) {
      roomId = roomId.split('-').join(' ');
    }
    var room = Rooms.dict[roomId];
    var sensors = room ? room.sensors : {};
    var roomName;

    if (!room) {
      roomName = roomId;
    } else {
      roomName = room.name;
    }

    var sensorTable = '[table class="tooltip-table"]' +
      '[tr] [th colspan="2"]' + roomName + '[/th] [/tr]';

    for (var i = 0; i < sensors.length; i++) {
      var sensor = room.sensors[i];
      sensorTable += '[tr] [th]' + sensor.name + '[/th] [td]' +
        sensor.values[0].value + sensor.suffix + '[/td] [/tr]';
    }
    sensorTable += '[/table]';

    var xmlPath = 'panorama/' + roomName.split(/ |-/g).join('_') + '.xml';

    $scope.room = {
      sensorTable: sensorTable,
      xmlPath: xmlPath
    };

    $scope.fullscreen = $scope.App.fullscreen ? 'panorama-fullscreen' : '';

    $scope.goBack = function () {
      $window.history.back();
    };

  });
