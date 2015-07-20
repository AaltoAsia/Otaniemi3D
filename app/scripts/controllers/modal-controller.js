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

    var self = this;

    self.params = params;

    self.ok = function () {
      $modalInstance.close(self.params);
    };

    self.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });
