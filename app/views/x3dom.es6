'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:X3DomCtrl
 * @description
 * # X3DomCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('X3DomCtrl', function ($modal, $state, $q, $interval, $timeout, $window, sensorApi) {

    this.panoramabox = 'images/panoramabox.svg';
    this.roomId = $state.params.roomId;
    //Use this boolean to check for webgl support
    this.webglSupport = Modernizr.webgl;

    function waitForX3Dom() {
      var deferred = $q.defer();

      $interval(() => {
        if ($window.x3domReady) {
          deferred.resolve(true);
        }
      }, 100);

      $timeout(() => {
        if (!$window.x3domReady) {
          deferred.reject('Request timed out. Couldn\'t download x3dom files in 8.0 seconds.');
        }
      }, 8000);

      return deferred.promise;
    }

    //x3d change viewpoint (camera location)
    this.changeView = (viewpoint) => {
      if (typeof viewpoint !== 'string') {
        return;
      }

      var elem = $('#'+viewpoint)[0];

      if(elem !== null) {
        elem.setAttribute('set_bind','true');

        var x3dElem = $('#x3dElement')[0];
        x3dElem.runtime.resetView();

        $state.go('x3dom', {roomId: viewpoint},
          {location: 'replace', notify: false});
      }
    };

    waitForX3Dom().then(() => {
      if (this.roomId) {
        this.changeView(this.roomId);
      }
    });

    //items in search scope
    this.rooms = ['Entrance','Cafeteria','Corridor Entrance Side',
      'Corridor Cafeteria Side','2nd Floor Sundeck','2nd Floor Corridor Start',
      '2nd Floor Corridor Middle','2nd Floor Corridor End','Room-223',
      'Room-224','Room-225','Room-226','Room-227','Room-228','Room-229',
      'Room-232a','Room-232c','Room-232d','Room-235','Room-236b','Room-236b2',
      'Room-236a','Room-237d','Room-237c','Room-238b','Room-238d','Room-239',
      'Room-333','Room-334','Room-335','Room-336','Room-337','Room-338',
      'Room-341a','Room-341b','Room-341c','Room-348'];

    this.showName = (roomId) => {
      if (roomId) {
        return roomId.split('-').join(' ');
      }
    };

    this.panoramaViewer = (roomId) => {
      $state.go('panorama', {roomId: roomId});
    };

    this.modalTooltip = (roomId) => {
      $modal.open({
        templateUrl: 'templates/sensor-info.html',
        controller: 'ModalCtrl',
        controllerAs: 'modal',
        resolve: {
          params() {
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

      return sensorApi.send('read', request).then((data) => {
        return data;
      });
    }

    $window.panoramaBoxEvent = (event) => {
      let id = event.target.id;

      if (typeof id === 'string' &&
          id.startsWith('panoramabox')) {
        let roomId = id.replace('panoramabox_', '');
        this.panoramaViewer(roomId);
      }
    };

    $window.sensorBoxEvent = (event) => {
      console.log(event);
      let id = event.target.id;

      if (typeof id === 'string' &&
          id.startsWith('sensorbox')) {
        let roomId = id.replace('sensorbox_', '');
        this.modalTooltip(roomId);
      }
    };
  }
);
