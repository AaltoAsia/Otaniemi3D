'use strict';

describe('Service: twodservice', function () {

  // load the service's module
  beforeEach(module('otaniemi3dApp'));

  // instantiate service
  var twodservice;
  beforeEach(inject(function (_twodservice_) {
    twodservice = _twodservice_;
  }));

  it('should do something', function () {
    expect(!!twodservice).toBe(true);
  });

});
