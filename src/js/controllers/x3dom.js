'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:X3DomCtrl
 * @description
 * # X3DomCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('X3DomCtrl', function ($scope, $modal, $state, $q, $interval, $timeout, $window, omiMessage) {

    $scope.panoramabox = 'assets/shared/images/panoramabox.svg';
    $scope.selected = undefined;
    //Use this boolean to check for webgl support
    $scope.webglSupport = Modernizr.webgl;
    $scope.building = $state.params.building;

    function waitForX3Dom() {
      var deferred = $q.defer();

      $interval(function () {
        if ($window.x3domReady) {
          deferred.resolve(true);
        }
      }, 100);

      $timeout(function () {
        if (!$window.x3domReady) {
          deferred.reject('Request timed out. Couldn\'t download x3dom files in 8.0 seconds.');
        }
      }, 8000);

      return deferred.promise;
    }

    //x3d change viewpoint (camera location)
    $scope.changeView = function(viewpoint){
      var elem = $('#3dModel__' + viewpoint);
      if (elem.length) {
        elem.attr('set_bind', 'true');
        return true;
      } else {
        return false;
      }
    };

    waitForX3Dom().then(function () {
      if ($state.params.roomId) {
        for (var i = 0; i < $scope.App.rooms.length; i++) {
          if ($state.params.roomId === $scope.App.rooms[i].id) {
            var viewChanged = $scope.changeView($state.params.roomId);
            if (viewChanged) {
              $scope.App.room = $scope.App.rooms[i];
            }
            break;
          }
        }
      }
    });

    $scope.panoramaViewer = function(roomId) {
      $state.go('panorama', {roomId: roomId});
    };

    $scope.modalTooltip = function (roomId) {
      $scope.modalInstance = $modal.open({
        templateUrl: 'html/templates/sensor-info.html',
        controller: 'ModalCtrl',
        controllerAs: 'modal',
        resolve: {
          params: function () {
            return getSensorData(roomId);
          }
        }
      });
    };

    function getSensorData(roomId) {
      var request = {
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
      };

      return omiMessage.send('read', request).then(function (data) {
        return data;
      });
    }

    $scope.$on('reset-position', function () {
      $scope.$broadcast('3d-room-change', null);
      $scope.changeView('vp0');
    });

    $scope.$on('3d-room-change', function (_, roomId) {
      $state.go('x3dom',
        {building: $scope.building, roomId: roomId},
        {location: 'replace', notify: false}
      );
      $scope.changeView(roomId);
    });

    $scope.$on('$destroy', function () {
      if ($scope.modalInstance) {
        $scope.modalInstance.dismiss();
      }
    });
  }
);
