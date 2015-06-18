'use strict';

describe('Service: XmlParser', function () {

  // load the service's module
  beforeEach(module('otaniemi3dApp'));

  // instantiate service
  var XmlParser;
  beforeEach(inject(function (_XmlParser_) {
    XmlParser = _XmlParser_;
  }));

  it('should do something', function () {
    expect(!!XmlParser).toBe(true);
  });

});
