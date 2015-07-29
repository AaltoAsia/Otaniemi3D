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
  function($scope, $stateParams, $window, Rooms, $modal, SensorData, $q, $interval) {

    var self = this;

    var roomId = $stateParams.roomId;
    var room = Rooms.dict[roomId];
    self.sensors = room ? room.sensors : [];
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

    for (var i = 0; i < self.sensors.length; i++) {
      var sensor = room.sensors[i];
      var sensorValue = sensor.values.length ?
        sensor.values[0].value : '';

      sensorTable += '[tr] [th]' + sensor.name + '[/th] [td]' +
        sensorValue + sensor.suffix + '[/td] [/tr]';
    }
    sensorTable += '[/table]';

    var xmlPath = 'panorama/' + roomName + '.xml';

    function getMetaData(sensors) {
      var metaDataRequest = {
        'Objects': {
          'Object': {
            'id': {
              'keyValue': 'K1'
            },
            'Object': {
              'id': {
                'keyValue': roomId
              },
              'InfoItem': []
            }
          }
        }
      };

      for (var i = 0; i < sensors.length; i++) {
        metaDataRequest.Objects.Object.Object.InfoItem.push({
          'MetaData': {},
          '@name': sensors[i].type
        });
      }

      return SensorData.send('read', metaDataRequest)
        .then(function(data) {
          self.sensors = data[roomId].sensors;
          return self.sensors;
        });
    }

    function waitForPanorama(data) {
      var deferred = $q.defer();

      $interval(function () {
        if ($('#panorama_obj').length) {
          deferred.resolve(data);
        }
      }, 150);

      return deferred.promise;
    }

    function makeSensorGroups(sensors) {
      return sensors
        .reduce(function (prev, curr) {
          if (!prev[curr.metaData.ath + ',' + curr.metaData.atv]) {
            prev[curr.metaData.ath + ',' + curr.metaData.atv] = [];
          }
          prev[curr.metaData.ath + ',' + curr.metaData.atv].push(curr);
          return prev;
        }, {});
    }

    function addSensorGroups(sensorGroups) {
      var krpano = $('#panorama_obj')[0];

      angular.forEach(sensorGroups, function (sensorGroup, key) {
        var pos = key.split(',');

        krpano.call('addsensor(' + [
          sensorGroup[0].id, pos[0], pos[1],
          self.sensorTooltip(sensorGroup),
        ].join(',') + ',"' + JSON.stringify(sensorGroup) +'"' + ')');
      });

      return sensorGroups;
    }

    function sendMetaData(sensors) {
      var writeRequest = {
        'Objects': {
          'Object': {
            'id': {
              'keyValue': 'K1'
            },
            'Object': {
              'id': {
                'keyValue': roomId
              },
              'InfoItem': []
            }
          }
        }
      };

      for (var i = 0; i < sensors.length; i++) {
        writeRequest.Objects.Object.Object.InfoItem.push({
          'MetaData': {
            'InfoItem': []
          },
          '@name': sensors[i].name
        });
        angular.forEach(sensors[i].metaData, function(value, key) {
          writeRequest.Objects.Object.Object
            .InfoItem[i].MetaData.InfoItem.push({
              '@name': key,
              'value': {
                'keyValue': value,
                '@type': 'xs:double'
              }
            });
        });
      }

      return SensorData.send('write', writeRequest);
    }

    function displaySensors(data) {

      var room = data[roomId];

      if (!room) {
        return;
      }

      var sensors = room.sensors;

      ///DEBUG
      // if (roomId === 'Cafeteria') {
      //   for (var k = 0; k < sensors.length; k++) {
      //     sensors[k].metaData = {};
      //     sensors[k].metaData.ath = -17;
      //     sensors[k].metaData.atv = -14;
      //   }
      //
      //   return waitForPanorama(sensors)
      //     .then(makeSensorGroups)
      //     .then(addSensorGroups);
      // }
      ///END DEBUG

      /*
      for (var j = 0; j < sensors.length; j++) {
        sensorPromises.push(getMetaData(sensors[j]));
      }
      */

      return getMetaData(sensors)
        .then(waitForPanorama)
        .then(makeSensorGroups)
        .then(addSensorGroups);
    }

    function getSensorData() {
      var dataRequest = {
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

      return SensorData.send('read', dataRequest)
        .then(function (data) {
          return data;
        });
    }

    self.room = {
      sensorTable: sensorTable,
      xmlPath: xmlPath,
      url: roomUrl,
      sensors: self.sensors
    };

    self.alert = {
      show: false,
      message: ''
    };

    self.newSensors = [];

    self.addSensors = function(sensors) {
      self.newSensors = sensors;
    };

    self.class = $scope.App.fullscreen ? 'panorama-fullscreen' : '';

    self.goBack = function () {
      $window.history.back();
    };

    self.sensorTooltip = function(sensors) {
      var sensorTable = '[table class="tooltip-table"]' +
        '[tr] [th colspan="2" style="text-align:center"]' + roomName + '[/th] [/tr]';

      for (var i = 0; i < sensors.length; i++) {
        var sensor = sensors[i],
            sensorValue,
            room = Rooms.dict[sensor.room],
            sensorSuffix;

        for (var j = 0; j < room.sensors.length; j++) {
          if (room.sensors[j].id === sensor.id) {
            sensorValue = room.sensors[j].values.length ?
              room.sensors[j].values[0].value : '';
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

    getSensorData()
      .then(displaySensors);

    $scope.$on('sensordata-update', function (_, data) {
      displaySensors(data.dict);
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
          for (var i = 0; i < self.newSensors.length; i++) {
            self.newSensors[i].metaData = {
              ath: pos.x,
              atv: pos.y
            };
          }

          for (var j = 0; j < self.newSensors.length; j++) {
            var newSensor = self.newSensors[j];
            var exists = false;

            for (var k = 0; k < self.sensors.length; k++) {
              var oldSensor = self.sensors[k];

              krpano.call('removehotspot(' + oldSensor.id + ')');

              if (newSensor.id === oldSensor.id) {
                oldSensor.metaData = newSensor.metaData;
                exists = true;
                break;
              }
            }

            if (!exists) {
              self.sensors.push(newSensor);
            }
          }

          var sensorGroups = makeSensorGroups(self.sensors);
          addSensorGroups(sensorGroups);

          sendMetaData(self.newSensors);

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
