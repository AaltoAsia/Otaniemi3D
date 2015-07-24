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
  function ($scope, $stateParams, $window, Rooms, $modal, $http, SensorData, $q, $interval) {

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

    function getMetaData (sensor) {
      return $http.get(roomUrl + '/' + sensor.name + '/MetaData')
        .then(function (data) {
          sensor.metaData = SensorData.parseMetaData(data);
          return sensor;
        });
    }

    function waitForPanorama (data) {
      var deferred = $q.defer();

      $interval(function () {
        if ($('#panorama_obj').length) {
          deferred.resolve(data);
        }
      }, 150);

      return deferred.promise;
    }

    function makeSensorGroups (sensors) {
      return sensors
        .reduce(function (prev, curr) {
          if (!prev[curr.metaData.ath + ',' + curr.metaData.atv]) {
            prev[curr.metaData.ath + ',' + curr.metaData.atv] = [];
          }
          prev[curr.metaData.ath + ',' + curr.metaData.atv].push(curr);
          return prev;
        }, {});
    }

    function addSensorGroups (sensorGroups) {
      var krpano = $('#panorama_obj')[0];

      angular.forEach(sensorGroups, function (sensorGroup, key) {
        var pos = key.split(',');

        krpano.call('addsensor(' + [
          sensorGroup[0].id, pos[0], pos[1], self.sensorTooltip(sensorGroup)
        ].join(',') + ')');
      });

      return sensorGroups;
    }

    function displaySensors () {

      var room = Rooms.dict[roomId];

      if (!room) {
        return;
      }

      var sensors = room.sensors,
          sensorPromises = [];

      ///DEBUG
      if (roomId === 'Cafeteria') {
        for (var k = 0; k < sensors.length; k++) {
          sensors[k].metaData = {};
          sensors[k].metaData.ath = -17;
          sensors[k].metaData.atv = -14;
        }
      }

      return waitForPanorama(sensors)
        .then(makeSensorGroups)
        .then(addSensorGroups);
      ///END DEBUG

      for (var j = 0; j < sensors.length; j++) {
        sensorPromises.push(getMetaData(sensors[j]));
      }

      return $q.all(sensorPromises)
        .then(waitForPanorama)
        .then(makeSensorGroups)
        .then(addSensorGroups);
    }

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
        var sensor = sensors[i],
            sensorValue,
            room = Rooms.dict[sensor.room],
            sensorSuffix;

        for (var j = 0; j < room.sensors.length; j++) {
          if (room.sensors[j].id === sensor.id) {
            sensorValue = room.sensors[j].values[0].value;
            sensorSuffix = room.sensors[j].suffix;
            sensorSuffix = sensorSuffix ? ' ' + sensorSuffix : '';
            break;
          }
        }

        sensorTable += '[tr] [th]' + sensor.name + '[/th] [td]' +
          sensorValue + sensorSuffix + '[/td] [/tr]';
      }
      sensorTable += '[/table]';

      return sensorTable;
    };

    displaySensors();

    $scope.$on('sensordata-update', function () {
      displaySensors();
    });

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
          var id = self.newSensors[0].id;

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
