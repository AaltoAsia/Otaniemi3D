'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('threedview', function ($scope, Rooms, Datahandler, $modal) {
    $scope.panoramabox = 'images/panoramabox.svg';
    $scope.selected = undefined;
    $scope.webglSupport = Modernizr.webgl; //Use this boolean to check for webgl support
    $scope.pano = false;


  Datahandler.fetchData().then(
      function(data) {
        Rooms.initRoomList(data);
      },
      function() {
          console.log('Error: Failed to fetch sensor data');
      }
  );



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
    $scope.items = ['Entrance','Cafeteria','Corridor Entrance Side',
      'Corridor Cafeteria Side','2nd Floor Sundeck','2nd Floor Corridor Start',
      '2nd Floor Corridor Middle','2nd Floor Corridor End','223','224','225',
      '226','227','228','229','232a','232c','232d', '235','236b','236b2','236a',
      '237d','237c','238b','238d','239','333','334','335','336','337','338','341a',
      '341b','341c', '348'];
    
    $scope.onSelect = function($item) {
      $scope.changeView($item);
    };
    
    var loaded = false;

    $scope.panoramaViewer = function(room) {
    $scope.pano = true; //make panorama(pano) div visible
    var roomInfo = Rooms.krpanoHTML(room); //find information for krpano tooltip
    var infos = {room: roomInfo};
    if(loaded === false){
    embedpano({
          xml:'panorama/' + room.split(' ').join('_') +'.xml',
          id:'pano_obj',
          target:'pano',
          html5:'only',
          passQueryParameters:true,
          vars:infos
        });
    loaded = true;
  }
    else{
        var xmlpath = room.split(' ').join('_') +'.xml';
        document.getElementById('pano_obj').call('loadpano('+ xmlpath +');');
        document.getElementById('pano_obj').call('set(room,' + roomInfo +');');

    }
};

  $scope.stopPanorama = function(){
      $scope.pano = false;
  };
  
    $scope.modalTooltip = function (sensorLabel) {
      /* TODO: implement fetching and showing right values in Modal Tooltip.
         document.getElementById('sensorLabel').innerHTML = sensorLabel;
      */
      $modal.open({
        templateUrl: 'threedModal.html',
        controller: '3dModalCtrl',
        resolve: {
          roomInfo: function () {
            return Rooms.findRoom(sensorLabel);
          }
        }

        });
    };
  }
);
