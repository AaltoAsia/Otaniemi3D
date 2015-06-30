'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:3dModalCtrl
 * @description
 * # 3dModalCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('3dModalCtrl', function ($scope, $modalInstance, roomInfo, roomName) {
    //fill modal with room data labels
    $scope.roomInfo = roomInfo;
    $scope.roomName = roomName;
    
    //Close modal.
    $scope.ok = function () {
      $modalInstance.dismiss('ok');
    };
  });

