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

    $scope.roomInfo = roomInfo;
    console.log($scope.roomInfo[0]);
    $scope.roomInfo[0] = $scope.roomInfo[0].split(': ')[1];
        console.log($scope.roomInfo[0]);

    // Close modal.
    $scope.ok = function () {
      $modalInstance.dismiss('ok');
    };
  });

 /* .filter('roomLabel', function(input, splitChar, splitIndex) {
    return function(input, splitChar, splitIndex) {
        return input.split(splitChar)[splitIndex];
    }
  });
*/