'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:loadScriptDirective
 * @description
 * # loadScriptDirective
 */
angular.module('otaniemi3dApp').directive('loadScript', function() {
    return function(scope, element) {
        angular.element('<link rel="stylesheet" type="text/css" href="http://www.x3dom.org/download/x3dom.css"/>' +
        '<script src="http://www.x3dom.org/download/x3dom.js"></script>').appendTo(element);
    };
});