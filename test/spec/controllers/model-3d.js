'use strict';

describe('Controller: Model3dCtrl', function () {

  // load the controller's module
  beforeEach(module('otaniemi3dApp'));

  var Model3dCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    Model3dCtrl = $controller('Model3dCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
