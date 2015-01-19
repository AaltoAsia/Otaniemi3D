'use strict';

describe('Service: Floorplans', function () {

  // load the service's module
  beforeEach(module('otaniemi3dApp'));

  // instantiate service
  var Floorplans;
  beforeEach(inject(function (_Floorplans_) {
    Floorplans = _Floorplans_;
  }));

  it('should do something', function () {
    expect(!!Floorplans).toBe(true);
  });

});
