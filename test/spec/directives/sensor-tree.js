'use strict';

describe('Directive: sensorTree', function () {

  // load the directive's module
  beforeEach(module('otaniemi3dApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<sensor-tree></sensor-tree>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the sensorTree directive');
  }));
});
