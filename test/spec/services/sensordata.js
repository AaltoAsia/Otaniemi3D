'use strict';

describe('Service: SensorData', function () {

  // load the service's module
  beforeEach(module('otaniemi3dApp'));

  // instantiate service
  var SensorData;
  beforeEach(inject(function (_SensorData_) {
    SensorData = _SensorData_;
  }));

  it('should do something', function () {
    expect(!!SensorData).toBe(true);
  });

});
