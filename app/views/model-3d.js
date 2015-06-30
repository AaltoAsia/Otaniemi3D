'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:Model3dCtrl
 * @description
 * # Model3dCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('Model3dCtrl', function ($scope, Rooms, $modal) {

    $scope.panoramabox = 'images/panoramabox.svg';
    $scope.selected = undefined;
    //Use this boolean to check for webgl support
    $scope.webglSupport = Modernizr.webgl;
    $scope.pano = false;

    var panoramaLoaded = false;
    
    Rooms.updateRoomInfo();

    //x3d change viewpoint (camera location)
    $scope.changeView = function(viewpoint){
      if(viewpoint === undefined) {
        var textField = document.getElementById('searchContent');
        viewpoint = textField.value;
      }
        
      var elem = document.getElementById(viewpoint);
        
      if(elem !== null) {
        elem.setAttribute('set_bind','true'); 

        var x3dElem = document.getElementById('x3dElement');
        x3dElem.runtime.resetView();
      }
    };
    $scope.text = undefined;  
    //items in search scope
    $scope.items = ['Entrance','Cafeteria','Corridor Entrance Side',
      'Corridor Cafeteria Side','2nd Floor Sundeck','2nd Floor Corridor Start',
      '2nd Floor Corridor Middle','2nd Floor Corridor End','223','224','225',
      '226','227','228','229','232a','232c','232d', '235','236b','236b2','236a',
      '237d','237c','238b','238d','239','333','334','335','336','337','338','341a',
      '341b','341c', '348'];

    //search item selected, change view
    $scope.onSelect = function($item) {
      $scope.changeView($item);
    };

    $scope.panoramaViewer = function(room) {
      //make panorama(pano) div visible
      $scope.pano = true;
      //find information for krpano tooltip
      var roomInfo = Rooms.krpanoHTML(room);
      var infos = {room: roomInfo};

      if(panoramaLoaded === false){
        embedpano({
          xml:'panorama/' + room.split(' ').join('_') +'.xml',
          id:'pano_obj',
          target:'pano',
          html5:'only',
          passQueryParameters:true,
          vars:infos
        });
        panoramaLoaded = true;
      } else{
        var xmlpath = room.split(' ').join('_') +'.xml';
        document.getElementById('pano_obj').call('loadpano('+ xmlpath +');');
        document.getElementById('pano_obj').call('set(room,' + roomInfo +');');
      }
    };

  $scope.stopPanorama = function(){
      $scope.pano = false;
  };
  
    $scope.modalTooltip = function (sensorLabel) {
    $modal.open({
        templateUrl: 'threedModal.html',
        controller: '3dModalCtrl',
        resolve: {
          roomInfo: function () {
            return Rooms.findRoom(sensorLabel);
          },
          roomName: function () {
          return sensorLabel;
          }
        }

        });
    };
  }
);
