'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:PanoramaCtrl
 * @description
 * # PanoramaCtrl
 * Controller of the Otaniemi3D
 */
angular.module('otaniemi3dApp')
  .controller('PanoramaCtrl',
  function($scope, $state, $window, $modal, omiMessage, $q, $interval, buildingData) {

    var self = this;

    self.roomId = $state.params.roomId;
    self.sensors = [];
    self.newSensors = [];
    self.class = $scope.App.fullscreen ? 'panorama-fullscreen' : '';

    var roomUrl =
      'https://otaniemi3d.cs.hut.fi/omi/node/Objects/K1/' + self.roomId;
    var xmlPath = 'assets/buildings/' + buildingData.currentBuilding.id +
      '/panorama/' + self.roomId + '.xml';

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
      };

      return omiMessage.send('read', dataRequest)
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
      };

      for (var i = 0; i < sensors.length; i++) {
        metaDataRequest.Object.Object.InfoItem.push({
          'MetaData': {},
          '@name': sensors[i].type
        });
      }

      return omiMessage.send('read', metaDataRequest)
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
      };

      for (var i = 0; i < sensors.length; i++) {
        writeRequest.Object.Object.InfoItem.push({
          'MetaData': {
            'InfoItem': []
          },
          '@name': sensors[i].name
        });
        angular.forEach(sensors[i].metaData, function(value, key) {
          writeRequest.Object.Object
            .InfoItem[i].MetaData.InfoItem.push({
              '@name': key,
              'value': {
                'keyValue': value,
                '@type': 'xs:double'
              }
            });
        });
      }

      return omiMessage.send('write', writeRequest);
    }

    function sensorTooltip(sensors) {
      var sensorRows = '';

      sensors.sort(function (a, b) {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });


      for (var i = 0; i < sensors.length; i++) {
        var sensorValue = sensors[i].values.length ?
          sensors[i].values[0].value : '';
        var sensorSuffix = sensors[i].suffix;
        sensorSuffix = sensorSuffix ? ' ' + sensorSuffix : '';
        var toggleButton = '';

        if(sensors[i].isPlug) {
          toggleButton =
            '[button onclick="krpano.togglePlug(\'' +
                sensors[i].roomId + '\', \'' +
                sensors[i].name + '\', \'' +
                sensors[i].values[0].value + '\')" ' +
                'class="btn black-btn panorama-btn"]' +
              'Toggle' +
            '[/button]';
        }

        sensorRows += [
          '[tr]',
            '[th]',
              sensors[i].name,
            '[/th]',
            '[td]',
              '[span]',
                sensorValue, sensorSuffix,
              '[/span]',
              toggleButton,
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
        templateUrl: 'html/templates/hotspot-selection.html',
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

    $window.krpano.togglePlug = function (roomId, mac, currentValue) {
      var newValue = currentValue !== '0' ? '0' : '1';

      var writeRequest =
        '<?xml version="1.0"?>'+
        '<omi:omiEnvelope xmlns:xs="http://www.w3.org/2001/XMLSchema-instance" xmlns:omi="omi.xsd" version="1.0" ttl="0">'+
          '<write xmlns="omi.xsd" msgformat="odf">'+
            '<omi:msg>'+
              '<Objects xmlns="odf.xsd">'+
                '<Object>'+
                  '<id>K1</id>'+
                  '<Object>'+
                    '<id>'+roomId+'</id>'+
                    '<InfoItem name="'+mac+'">'+
                      '<value>'+newValue+'</value>'+
                    '</InfoItem>'+
                  '</Object>'+
                '</Object>'+
              '</Objects>'+
            '</omi:msg>'+
          '</write>'+
        '</omi:omiEnvelope>';

      omiMessage.send('write', writeRequest);
    };

    $scope.$on('room-selection-change', function (event, room) {
      if (room) {
        $state.go('panorama',
          {
            building: $scope.App.building.id,
            roomId: room.id
          }
        );
      }
    });

    $scope.$on('$destroy', function () {
      if (self.modalInstance) {
        self.modalInstance.dismiss();
      }
    });

  });
