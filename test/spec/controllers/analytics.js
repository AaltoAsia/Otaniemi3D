'use strict';

describe('AnalyticsCtrl:', function () {

  // load the controller's module
  beforeEach(module('otaniemi3dApp'));

  var $controller, $rootScope, $scope, controller;

  beforeEach(inject(function(_$controller_, _$rootScope_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    controller = $controller('AnalyticsCtrl', { $scope: $scope });
  }));

  it('Initialised controller should have some time frames', function () {
    expect($scope.timeFrames).not.toBe(null);
  });

});
