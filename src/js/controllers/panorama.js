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
    self.sensorsToRelocate = [];
    self.hotspots = [];
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
      .then(getMetaData)
      .then(updateRoom)
      .then(waitForPanorama)
      .then(createHotspots)
      .then(addHotspots);

    function updateRoom(odfObject) {
      self.room = odfObject;
      return odfObject;
    }

    function getRoomObject(odfObject) {
      var request = (
        '<Object>' +
          '<id>K1</id>' +
          '<Object>' +
            '<id>' + odfObject.id + '</id>' +
          '</Object>' +
        '</Object>'
      );

      return omiMessage.send('read', request)
        .then(function (objects) {
          //First child object is the room object
          return objects[0].childObjects[0];
        });
    }

    function getMetaData(odfObject, loadingBar) {
      //Convert to boolean
      loadingBar = !!loadingBar;

      var infoItems = odfObject.infoItems.reduce(
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
            '<id>' + odfObject.id + '</id>' +
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

    /*
    * This function groups sensors by their location in panorama (ath, atv)
    * and creates hotspots to these locations.
    */
    function createHotspots(odfObject) {
      var infoItems = [];
      var childObjects = [];
      if (odfObject.infoItems) {
        infoItems = odfObject.infoItems.reduce(function (prev, current) {
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
              atv: current.metaData ? current.metaData.atv : null
            });
          }
          return prev;
        }, []);
      }

      if (odfObject.childObjects) {
        childObjects = odfObject.childObjects.map(function (object) {
          return createHotspots(object);
        });
      }

      var childObjectInfoItems= [].concat.apply([], childObjects);
      return infoItems.concat(childObjectInfoItems);
    }

    function addHotspots(hotspots) {
      for (var i = 0; i < hotspots.length; i++) {
        if (!$.isNumeric(hotspots[i].ath) ||
            !$.isNumeric(hotspots[i].atv)) {
          return;
        }

        var id = 'id-' + hotspots[i].ath + ',' + hotspots[i].atv;

        $window.krpano.elem.call('addsensor(' + [
          id, hotspots[i].ath, hotspots[i].atv
        ].join(',') + ')');
      }

      self.hotspots = hotspots;
      return hotspots;
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

    function relocateSensors(sensors, ath, atv) {
      function byId(id) {
        return function(elem) {
          return elem.id === id;
        };
      }

      function byName(name) {
        return function(elem) {
          return elem.name === name;
        };
      }

      if (!sensors.length) {
        return null;
      }

      for (var i = 0; i < sensors.length; i++) {
        var path = sensors[i].id.split('/');
        var childObject;
        var infoItem;
        var children = self.room.childObjects;
        for (var j = 0; j < path.length; j++) {
          var id = path[j];
          childObject = children.find(byId(id));
          if (childObject) {
            childObject.metaData.ath = ath;
            childObject.metaData.atv = atv;
            children = childObject.childObjects;
          } else {
            infoItem = children.find(byName(id));
            if (infoItem) {
              infoItem.metaData.ath = ath;
              infoItem.metaData.atv = atv;
            }
          }
        }
      }
    }

    $window.krpano.showTooltip = function (ath, atv) {

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
              odfObject: self.room,
              alert: self.alert,
              relocateSensors: function(sensors) {
                self.sensorsToRelocate = sensors;
              }
            };
          }
        }
      });

      self.modalInstance.result.then(function () {
        if (self.sensorsToRelocate.length) {

          for (var i = 0; i < self.hotspots.length; i++) {
            $window.krpano.elem.call('removehotspot(' + self.hotspots[i].id + ')');
          }

          for (var j = 0; j < self.sensorsToRelocate.length; j++) {

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
