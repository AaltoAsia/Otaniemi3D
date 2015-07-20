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
  function ($scope, $stateParams, $window, Rooms, $modal) {

    var self = this;

    var roomId = $stateParams.roomId;
    if (roomId.lastIndexOf('Room', 0) !== 0) {
      roomId = roomId.split('-').join(' ');
    }
    var room = Rooms.dict[roomId];
    var sensors = room ? room.sensors : {};
    var roomName;
    var roomUrl =
      'http://otaniemi3d.cs.hut.fi/omi/node/Objects/K1/' + roomId;

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

    self.room = {
      sensorTable: sensorTable,
      xmlPath: xmlPath,
      url: roomUrl
    };

    self.alert = {
      show: false,
      message: ''
    };

    self.newSensors = [];

    self.addSensors = function (sensors) {
      self.newSensors = sensors;
    };

    self.class = $scope.App.fullscreen ? 'panorama-fullscreen' : '';

    self.goBack = function () {
      $window.history.back();
    };

    //Create global namespace for scripts used by krpano.
    $window.krpano = {};

    $window.krpano.addHotspot = function () {

      self.modalInstance = $modal.open({
        templateUrl: 'hotspot-selection.html',
        scope: $scope,
        controller: 'ModalCtrl',
        controllerAs: 'modal',
        resolve: {
          params: function () {
            return {
              room: self.room,
              alert: self.alert,
              addSensors: self.addSensors
            };
          }
        }
      });

      self.modalInstance.result.then(function () {
        console.log(self.newSensors);
      });
    };

    $scope.$on('$destroy', function () {
      if (self.modalInstance) {
        self.modalInstance.dismiss();
      }
    });

  });
