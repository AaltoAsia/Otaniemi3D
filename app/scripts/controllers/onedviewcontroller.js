'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:OneDViewCtrl
 * @description
 * # oneDViewCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('onedview', function ($scope, $location, Datahandler) {

   $scope.fetchJson = function(){
      var fetchJsonPromise = Datahandler.fetchJson();
      fetchJsonPromise.then(function(data){
        console.log(data);
      });
    };

  
  });