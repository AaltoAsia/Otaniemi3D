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
/* This is the original example test.
  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });*/
});
