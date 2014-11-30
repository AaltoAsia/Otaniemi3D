'use strict';

describe('Service: Datahandler', function () {

  // load the service's module
  beforeEach(module('otaniemi3dApp'));

  // instantiate service
  var Datahandler;
  beforeEach(inject(function (_Datahandler_) {
    Datahandler = _Datahandler_;
  }));

  it('should do something', function () {
    expect(!!Datahandler).toBe(true);
  });

});
