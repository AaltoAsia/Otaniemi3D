'use strict';

describe('Directive: floorplan', function () {

  // load the directive's module
  beforeEach(module('otaniemi3dApp'));

  var element,
      Ctrl,
      scope;

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    Ctrl = $controller('twodview', {
      $scope: scope
    });
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<floorplan class="fp" plan="selectedPlan" data="sensorData" highlighted-room="highlightedRoom"></floorplan>');
    element = $compile(element)(scope);
    console.log(element.contents().children()[0]);
  }));
});
