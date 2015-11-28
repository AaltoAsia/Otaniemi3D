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
  function($scope, $state, $window, $modal, omiMessage, $q, $interval) {

    var self = this;

    self.room = { id: $state.params.roomId };
    self.class = $scope.App.fullscreen ? 'panorama-fullscreen' : '';
    self.sensorBoxes = [];
    self.sensorsToRelocate = [];
    //Create global namespace for scripts used by krpano.
    $window.krpano = {};

    var roomUrl =
      'https://otaniemi3d.cs.hut.fi/omi/node/Objects/K1/' + self.room.id;
    var xmlPath = 'assets/buildings/' + $scope.App.building.id +
      '/panorama/' + self.room.id + '.xml';

    self.panoramaData = {
      xmlPath: xmlPath,
      url: roomUrl
    };

    self.alert = {
      visible: false,
      message: ''
    };

    self.addSensors = function(sensors) {
      self.sensorsToRelocate = sensors;
    };

    self.goBack = function () {
      $window.history.back();
    };

    getRoomObject(self.room)
      .then(updateRoom)
      .then(getMetaData)
      .then(updateRoom)
      .then(waitForPanorama)
      .then(makeSensorGroups)
      .then(addSensorGroups);

    function updateRoom(room) {
      self.room = room;
      return room;
    }

    function getRoomObject(room) {
      var request = (
        '<Object>' +
          '<id>K1</id>' +
          '<Object>' +
            '<id>' + room.id + '</id>' +
          '</Object>' +
        '</Object>'
      );

      return omiMessage.send('read', request)
        .then(function (objects) {
          //First child object is the room object
          return objects[0].childObjects[0];
        });
    }

    function getMetaData(room, loadingBar) {
      //Convert to boolean
      loadingBar = !!loadingBar;

      var infoItems = room.infoItems.reduce(
        function(previous, current) {
          return previous +
          '<InfoItem name="' + current.name + '">' +
            '<MetaData/>' +
          '</InfoItem>';
        }, ''
      );

      var request = (
        '<Object>' +
          '<id>K1</id>' +
          '<Object>' +
            '<id>' + room.id + '</id>' +
            infoItems +
          '</Object>' +
        '</Object>'
      );

      return omiMessage.send('read', request, {}, loadingBar)
        .then(function (objects) {
          //First child object is the room object
          return objects[0].childObjects[0];
        });
    }

    function waitForPanorama(data) {
      var deferred = $q.defer();
      var limit = 50;

      var checkPanoObj = $interval(function () {
        if ($('#panorama_obj').length) {
          deferred.resolve(data);
          $interval.cancel(checkPanoObj);
          $window.krpano.elem = $('#panorama_obj')[0];
        } else if (limit < 0) {
          deferred.reject('Panorama initialization timed out');
        }
        limit--;
      }, 150);

      return deferred.promise;
    }

    function makeSensorGroups(room) {
      var infoItems = [];
      var childObjects = [];
      if (room.infoItems) {
        infoItems = room.infoItems.reduce(function (prev, current) {
          var existingGroup = prev.find(function (group) {
            return current.metaData ?
              (group.ath === current.metaData.ath &&
               group.atv === current.metaData.atv) : false;
          });
          if (existingGroup) {
            existingGroup.infoItems.push(current);
          } else {
            prev.push({
              ath: current.metaData ? current.metaData.ath : null,
              atv: current.metaData ? current.metaData.atv : null,
              infoItems: [current]
            });
          }
          return prev;
        }, []);
      }

      if (room.childObjects) {
        childObjects = room.childObjects.map(function (object) {
          return makeSensorGroups(object);
        });
      }

      var childObjectInfoItems= [].concat.apply([], childObjects);
      return infoItems.concat(childObjectInfoItems);
    }

    function addSensorGroups(sensorGroups) {
      var krpano = $('#panorama_obj')[0];

      for (var i = 0; i < sensorGroups.length; i++) {
        if (isNaN(Number(sensorGroups[i].ath)) ||
            isNaN(Number(sensorGroups[i].atv))) {
          return;
        }

        var id = sensorGroups[i].infoItems.reduce(function (prev, current) {
          return prev + '_' + current.name;
        }, 'sensor_group');

        var sensorBox = {
          id: id,
          sensors: sensorGroups[i].infoItems,
          ath: sensorGroups[i].ath,
          atv: sensorGroups[i].atv
        };
        self.sensorBoxes.push(sensorBox);

        krpano.call('addsensor(' + [
          sensorBox.id, sensorGroups[i].ath, sensorGroups[i].atv,
          sensorTooltip(sensorBox)
        ].join(',') + ',"' + JSON.stringify(sensorGroups[i]) +'"' + ')');
      }

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

      function addMetaData(value, key) {
        writeRequest.Object.Object
          .InfoItem[i].MetaData.InfoItem.push({
            '@name': key,
            'value': {
              'keyValue': value,
              '@type': 'xs:double'
            }
          });
      }

      for (var i = 0; i < sensors.length; i++) {
        writeRequest.Object.Object.InfoItem.push({
          'MetaData': {
            'InfoItem': []
          },
          '@name': sensors[i].name
        });
        angular.forEach(sensors[i].metaData, addMetaData);
      }

      return omiMessage.send('write', writeRequest);
    }

    function sensorTooltip(sensorBox) {
      var sensorRows = '';

      var sensors = sensorBox.sensors.sort(function (a, b) {
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

        if(sensors[i].metaData && sensors[i].metaData.isWritable) {
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
              '[span]', self.roomId, '[/span]',
              '[span style="float: right"]',
                '[span class="loading-spinner" style="opacity:0"]',
                  '[span class="spinner-icon"][/span]',
                '[/span]',
                '[button class="btn refresh-btn"',
                        'onclick="krpano.refresh(\'', sensorBox.id, '\')"',
                        'title="Refresh"]',
                  '[span class="glyphicon glyphicon-refresh"][/span]',
                '[/button]',
              '[/span]',
            '[/th]',
          '[/tr]',
          sensorRows,
        '[/table]'
      ].join('');

      return sensorTable;
    }

    $window.krpano.refresh = function (sensorBoxId) {
      $('.loading-spinner').css('opacity', '1');

      return getMetaData(self.room, false).then(function () {
        var sensorBox;
        for (var i = 0; i < self.sensorBoxes.length; i++) {
          if (self.sensorBoxes[i].id === sensorBoxId) {
            sensorBox = self.sensorBoxes[i];
          }
        }
        $window.krpano.elem.call(
          'set(plugin[persistent_tooltip].html, ' +
          sensorTooltip(sensorBox) + ')'
        );
        $('.loading-spinner').css('opacity', '0');
      }, function (error) {
        $('.loading-spinner').css('opacity', '1');
        console.log('Error:', error);
      });
    };

    $window.krpano.addSensorDialog = function () {

      var x = $window.krpano.elem.get('mouse.x');
      var y = $window.krpano.elem.get('mouse.y');
      var pos = $window.krpano.elem.screentosphere(x, y);

      self.modalInstance = $modal.open({
        templateUrl: 'html/templates/hotspot-selection.html',
        scope: $scope,
        controller: 'ModalCtrl',
        controllerAs: 'modal',
        resolve: {
          params: function () {
            return {
              room: self.room,
              url: roomUrl,
              alert: self.alert,
              addSensors: function(sensors) {
                self.sensorsToRelocate = sensors;
              }
            };
          }
        }
      });

      self.modalInstance.result.then(function () {
        if (self.sensorsToRelocate.length) {

          for (var j = 0; j < self.sensorsToRelocate.length; j++) {
            var newSensor = self.sensorsToRelocate[j];
            //Because these sensors were retrieved by sensor-tree directive,
            //they don't have any meta data. Therefore we don't have to worry
            //about owerwriting it.
            newSensor.metaData = {
              ath: pos.x,
              atv: pos.y
            };

            for (var k = 0; k < self.sensorBoxes.length; k++) {
              var sensorBox = self.sensorBoxes[k];

              for (var i = 0; i < sensorBox.infoItems.length; i++) {
                var infoItem = sensorBox.infoItems[i];
                if (newSensor.name === infoItem.name) {
                  angular.merge(newSensor.metaData, infoItem.metaData);
                  var index = sensorBox.infoItems.indexOf(infoItem);
                  //Remove infoItem from its previous sensorBox.
                  sensorBox.infoItems.splice(index, 1);
                }
              }
            }
              //$window.krpano.elem.call('removehotspot(id-' + oldSensor.id + ')');
          }

          var sensorGroup = makeSensorGroups({
            infoItems: self.sensorsToRelocate
          });
          addSensorGroups(sensorGroup);

          sendMetaData(self.sensorsToRelocate);

          self.sensorsToRelocate = [];
        }
      });
    };

    $window.krpano.togglePlug = function (roomId, mac, currentValue) {
      var newValue = 1 - currentValue;

      var writeRequest =
        '<Object>'+
          '<id>K1</id>'+
          '<Object>'+
            '<id>'+ roomId +'</id>'+
            '<InfoItem name="'+ mac +'">'+
              '<value>'+ newValue +'</value>'+
            '</InfoItem>'+
          '</Object>'+
        '</Object>';

      omiMessage.send('write', writeRequest);
    };

    $window.krpano.updateSensors = function() {
      // body...
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
