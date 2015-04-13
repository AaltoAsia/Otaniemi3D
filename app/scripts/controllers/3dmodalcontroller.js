'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:3dModalCtrl
 * @description
 * # ModalcontrollerCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('3dModalCtrl', function ($scope, $modalInstance, Rooms, roomInfo) {
    /* fill modal with room data labels */
    $scope.roomInfo = roomInfo;
    /* remove "Room: " from modal title */
    $scope.roomInfo[0] = $scope.roomInfo[0].split(': ')[1];

    // Close modal.
    $scope.ok = function () {
      $modalInstance.dismiss('ok');
    };
  });

