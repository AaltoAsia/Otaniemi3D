'use strict';

describe('Controller: twodview', function () {

  // load the controller's module
  beforeEach(module('otaniemi3dApp'));

  var twodviewCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
      twodviewCtrl = $controller('twodview', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
