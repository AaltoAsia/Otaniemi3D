'use strict';

describe('Directive: tooltipDirective', function () {

  // load the directive's module
  beforeEach(module('otaniemi3dApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should compile new element', inject(function ($compile) {
    element = angular.element('<div class="mouse-tooltip"></div>');
    element = $compile(element)(scope);
    //expect(element.HTML()).toBe('<button ng-click="panoramaViewer()" class="btn btn-sm btn-info">Panorama</button>');
  }));
});
