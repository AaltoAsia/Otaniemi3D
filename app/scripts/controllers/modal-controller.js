'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:ModalCtrl
 * @description
 * # ModalCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('ModalCtrl', function ($scope, $modalInstance, timeFrame, roomValueType) {
    
    //Values that are manipulated by radio buttons.
    $scope.timeFrame = timeFrame;
    $scope.roomValueType = roomValueType;
    
    //Ok function, passes the variables, into resolve function in twodviewcontroller 
    $scope.ok = function () {
      $modalInstance.close([$scope.roomValueType, $scope.timeFrame]);
    };
    
    //Shuts down modal without action.
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });
