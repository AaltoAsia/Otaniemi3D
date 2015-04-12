'use strict';

describe('Service: Legendbar', function () {

  // load the service's module
  beforeEach(module('otaniemi3dApp'));

  // instantiate service
  var Legendbar;
  beforeEach(inject(function (_Legendbar_) {
    Legendbar = _Legendbar_;
  }));

  it('should do something', function () {
    expect(!!Legendbar).toBe(true);
  });

});
