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
  function($scope, $stateParams, $window, $modal, sensorApi, $q, $interval) {

    var self = this;

    self.roomId = $stateParams.roomId;
    self.sensors = [];
    self.newSensors = [];
    self.class = $scope.App.fullscreen ? 'panorama-fullscreen' : '';

    var roomUrl =
      'http://otaniemi3d.cs.hut.fi/omi/node/Objects/K1/' + self.roomId;
    var xmlPath = 'panorama/' + self.roomId + '.xml';

    self.room = {
      xmlPath: xmlPath,
      url: roomUrl,
      sensors: self.sensors
    };

    self.alert = {
      show: false,
      message: ''
    };

    self.addSensors = function(sensors) {
      self.newSensors = sensors;
    };

    self.goBack = function () {
      $window.history.back();
    };

    getSensorData()
      .then(displaySensors);

    function getSensorData() {
      var dataRequest = {
        'Objects': {
          'Object': {
            'id': {
              'keyValue': 'K1'
            },
            'Object': {
              'id': {
                'keyValue': self.roomId
              }
            }
          }
        }
      };

      return sensorApi.send('read', dataRequest)
        .then(function (data) {
          return data;
        });
    }

    function displaySensors(sensors) {
      return getMetaData(sensors)
        .then(waitForPanorama)
        .then(makeSensorGroups)
        .then(addSensorGroups);
    }

    function getMetaData(sensors) {
      var metaDataRequest = {
        'Objects': {
          'Object': {
            'id': {
              'keyValue': 'K1'
            },
            'Object': {
              'id': {
                'keyValue': self.roomId
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

      return sensorApi.send('read', metaDataRequest)
        .then(function(data) {
          self.sensors = data;
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
          sensorTooltip(sensorGroup),
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
                'keyValue': self.roomId
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

      return sensorApi.send('write', writeRequest);
    }

    function sensorTooltip(sensors) {
      var sensorRows = '';

      for (var i = 0; i < sensors.length; i++) {
        var sensorValue = sensors[i].values.length ?
          sensors[i].values[0].value : '';
        var sensorSuffix = sensors[i].suffix;
        sensorSuffix = sensorSuffix ? ' ' + sensorSuffix : '';

        sensorRows += [
          '[tr]',
            '[th]',
              sensors[i].name,
            '[/th]',
            '[td]',
              sensorValue, sensorSuffix,
            '[/td]',
          '[/tr]'
        ].join('');
      }

      var sensorTable = [
        '[table class="tooltip-table"]',
          '[tr]',
            '[th colspan="2" style="text-align:center"]',
              self.roomId,
            '[/th]',
          '[/tr]',
          sensorRows,
        '[/table]'
      ].join('');

      return sensorTable;
    }

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
