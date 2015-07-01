'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:loadX3dom
 * @description
 * # loadX3dom
 */
angular.module('otaniemi3dApp').directive('loadX3dom', function() {
  return function(scope, element) {
    angular.element('<link rel="stylesheet" type="text/css" href="http://www.x3dom.org/download/x3dom.css"/>' +
    '<script src="http://www.x3dom.org/download/x3dom.js"></script>').appendTo(element);
  };
});