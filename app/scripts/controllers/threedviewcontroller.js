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
    $scope.changeView = function(viewpoint){
        if(viewpoint === undefined) {
            var textField = document.getElementById("searchContent");
            viewpoint = textField.value;
        }
        
        var elem = document.getElementById(viewpoint);
        
        if(elem !== null) {
            console.log(elem);
          elem.setAttribute('set_bind','true'); 
      
          var x3dElem = document.getElementById("x3dElement");
          x3dElem.runtime.resetView();
            
        }
    }
    $scope.typeaheadSearch = function ( $scope, $http ) {
      $scope.text = undefined;  
      $scope.items = ['333','334','335','336','337','338','341a','341b','341c', '348'];
    
      $scope.onSelect = function($item) {
        $scope.changeView($item)
      }
    }
  });

  