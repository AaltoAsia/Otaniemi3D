'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:ModalCtrl
 * @description
 * # ModalCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('ModalCtrl', function ($scope, $modalInstance, params) {

    var keys = Object.keys(params);
    for (var i = 0; i < keys.length; i++) {
      $scope[keys[i]] = params[keys[i]];
    }

    this.ok = function () {
      $modalInstance.close();
    };

    this.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });
