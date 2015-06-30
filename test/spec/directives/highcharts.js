'use strict';

describe('Directive: highcharts', function () {

  // load the directive's module
  beforeEach(module('otaniemi3dApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<highcharts></highcharts>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the highcharts directive');
  }));
});
