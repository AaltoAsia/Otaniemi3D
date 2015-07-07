'use strict';

describe('Service: HistoricalData', function () {

  // load the service's module
  beforeEach(module('otaniemi3dApp'));

  // instantiate service
  var historicalData;
  beforeEach(inject(function (_HistoricalData_) {
    historicalData = _HistoricalData_;
  }));

  it('should do something', function () {
    expect(!!historicalData).toBe(true);
  });

});
