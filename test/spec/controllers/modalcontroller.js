'use strict';

describe('Controller: ModalcontrollerCtrl', function () {

  // load the controller's module
  beforeEach(module('otaniemi3dApp'));

  var ModalcontrollerCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ModalcontrollerCtrl = $controller('ModalcontrollerCtrl', {
      $scope: scope
    });
  }));
});
