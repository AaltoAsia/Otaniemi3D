'use strict';

describe('Controller: onedview', function () {

  // load the controller's module
  beforeEach(module('otaniemi3dApp'));

  var oneDViewCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    oneDViewCtrl = $controller('onedview', {
      $scope: scope
    });
  }));
});
