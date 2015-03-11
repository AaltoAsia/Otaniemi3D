'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:tooltipDirective
 * @description
 * # tooltipDirective
 */
angular.module('otaniemi3dApp')
  .directive('mouseTooltip', function ($compile) {
    return {
      template: '<div id="panobtn"><button ng-click="panoramaViewer()" class="btn btn-sm btn-info">Panorama</button><div>',
      restrict: 'C',
      scope: false,
      compile: function compile(scope, element) {
        $compile(element)(scope);
      }
    };
  });
