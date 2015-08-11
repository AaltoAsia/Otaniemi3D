'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:X3DomCtrl
 * @description
 * # X3DomCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp').controller('X3DomCtrl', function ($scope, $modal, $state, $q, $interval, $timeout, $window, sensorApi) {

  $scope.panoramabox = 'images/panoramabox.svg';
  $scope.selected = undefined;
  //Use this boolean to check for webgl support
  $scope.webglSupport = Modernizr.webgl;

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
  $scope.changeView = function (viewpoint) {
    if (viewpoint === undefined) {
      var textField = document.getElementById('searchContent');
      viewpoint = textField.value;
    }

    var elem = document.getElementById(viewpoint);

    if (elem !== null) {
      elem.setAttribute('set_bind', 'true');

      var x3dElem = document.getElementById('x3dElement');
      x3dElem.runtime.resetView();

      $state.go('x3dom', { roomId: viewpoint }, { location: 'replace', notify: false });
    }
  };

  waitForX3Dom().then(function () {
    if ($state.params.roomId) {
      $scope.changeView($state.params.roomId);
    }
  });

  $scope.text = undefined;
  //items in search scope
  $scope.rooms = ['Entrance', 'Cafeteria', 'Corridor Entrance Side', 'Corridor Cafeteria Side', '2nd Floor Sundeck', '2nd Floor Corridor Start', '2nd Floor Corridor Middle', '2nd Floor Corridor End', 'Room-223', 'Room-224', 'Room-225', 'Room-226', 'Room-227', 'Room-228', 'Room-229', 'Room-232a', 'Room-232c', 'Room-232d', 'Room-235', 'Room-236b', 'Room-236b2', 'Room-236a', 'Room-237d', 'Room-237c', 'Room-238b', 'Room-238d', 'Room-239', 'Room-333', 'Room-334', 'Room-335', 'Room-336', 'Room-337', 'Room-338', 'Room-341a', 'Room-341b', 'Room-341c', 'Room-348'];

  //search item selected, change view
  $scope.onSelect = function ($item) {
    $scope.changeView($item);
  };

  $scope.showName = function (roomId) {
    if (roomId) {
      return roomId.split('-').join(' ');
    }
  };

  $scope.panoramaViewer = function (roomId) {
    $state.go('panorama', { roomId: roomId });
  };

  $scope.modalTooltip = function (roomId) {
    $modal.open({
      templateUrl: 'templates/sensor-info.html',
      controller: 'ModalCtrl',
      controllerAs: 'modal',
      resolve: {
        params: function params() {
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

    return sensorApi.send('read', request).then(function (data) {
      return data;
    });
  }
});
