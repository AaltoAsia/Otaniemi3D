'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:ModalCtrl
 * @description
 * # ModalCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('ModalCtrl', function ($scope, $window, $modalInstance, params) {

    var self = this;

    self.params = params;
    self.smallDevice = $window.innerWidth < 769;

    self.ok = function () {
      if (typeof self.params.validate === 'function') {
        if (self.params.validate(self.params)) {
          $modalInstance.close(self.params);
        } else {
          displayError(self.params.errorMsg);
        }
      } else {
        $modalInstance.close(self.params);
      }
    };

    self.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    function displayError(msg) {
      console.log(msg);
    }

  });
