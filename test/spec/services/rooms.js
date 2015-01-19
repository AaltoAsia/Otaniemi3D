'use strict';

describe('Service: Rooms', function () {

  // load the service's module
  beforeEach(module('otaniemi3dApp'));

  // instantiate service
  var Rooms;
  beforeEach(inject(function (_Rooms_) {
    Rooms = _Rooms_;
  }));

  it('should do something', function () {
    expect(!!Rooms).toBe(true);
  });

});
