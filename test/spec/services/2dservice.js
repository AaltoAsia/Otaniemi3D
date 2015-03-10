'use strict';

describe('Service: 2dservice', function () {

  // load the service's module
  beforeEach(module('otaniemi3dApp'));

  // instantiate service
  var 2dservice;
  beforeEach(inject(function (_2dservice_) {
    2dservice = _2dservice_;
  }));

  it('should do something', function () {
    expect(!!2dservice).toBe(true);
  });

});
