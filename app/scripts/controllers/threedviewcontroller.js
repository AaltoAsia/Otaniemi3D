'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('threedview', function ($scope) {
    $scope.selected = undefined;
    $scope.pano = false;
        
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
    $scope.items = ['223','224','225','226','227','228','229','232a','232c','232d',
      '235','236b','236b2','236a','237d','237c','238b','238d','239',
      '333','334','335','336','337','338','341a','341b','341c', '348'];
    
    $scope.onSelect = function($item) {
      $scope.changeView($item);
    };
    $scope.panoramaViewer = function(room) {
      $scope.pano = true;
      embedpano({xml:"panorama/" + room + ".xml", target:"pano", html5:"only", passQueryParameters:true});
    };
    $scope.stopPanorama = function(){
      $scope.pano = false;
    };
  }
);
