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
    var room = Rooms.dict[roomId];
    var sensors = room ? room.sensors : {};
    var roomName;
    var roomUrl =
      'http://otaniemi3d.cs.hut.fi/omi/node/Objects/K1/' + roomId;

    if (!room) {
      roomName = roomId;
    } else {
      roomName = room.id;
    }

    var sensorTable = '[table class="tooltip-table"]' +
      '[tr] [th colspan="2"]' + roomName + '[/th] [/tr]';

    for (var i = 0; i < sensors.length; i++) {
      var sensor = room.sensors[i];
      sensorTable += '[tr] [th]' + sensor.name + '[/th] [td]' +
        sensor.values[0].value + sensor.suffix + '[/td] [/tr]';
    }
    sensorTable += '[/table]';

    var xmlPath = 'panorama/' + roomName + '.xml';

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

    self.sensorTooltip = function (sensors) {
      var sensorTable = '[table class="tooltip-table"]' +
        '[tr] [th colspan="2" style="text-align:center"]' + roomName + '[/th] [/tr]';

      for (var i = 0; i < sensors.length; i++) {
        var sensor = sensors[i];
        sensorTable += '[tr] [th]' + sensor.text + '[/th] [td]' +
          sensor.type + '[/td] [/tr]';
      }
      sensorTable += '[/table]';

      return sensorTable;
    };

    //Create global namespace for scripts used by krpano.
    $window.krpano = {};

    $window.krpano.addSensorDialog = function () {

      var krpano = $('#panorama_obj')[0];
      var x = krpano.get('mouse.x');
      var y = krpano.get('mouse.y');
      var pos = krpano.screentosphere(x, y);

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
        if (self.newSensors.length) {
          console.log(self.newSensors);
          var id = self.newSensors[0].id;

          console.log([pos.x, pos.y]);

          krpano.call('addsensor(' + [
            id, pos.x, pos.y, self.sensorTooltip(self.newSensors)
          ].join(',') + ')');

          self.newSensors = [];
        }
      });
    };

    $scope.$on('$destroy', function () {
      if (self.modalInstance) {
        self.modalInstance.dismiss();
      }
    });

  });
