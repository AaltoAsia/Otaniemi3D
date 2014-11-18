'use strict';

describe('Controller: HeaderController', function () {

  // load the controller's module
  beforeEach(module('otaniemi3dApp'));

  var Headercontroller,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    Headercontroller = $controller('HeaderController', {
      $scope: scope
    });
  }));

});
