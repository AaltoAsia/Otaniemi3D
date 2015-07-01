'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:mouseTooltip
 * @description
 * # mouseTooltip
 */
angular.module('otaniemi3dApp')
  .directive('mouseTooltip', function ($compile) {
    return {
      template: '<div id="panobtn"><button ng-click="panoramaViewer()" class="btn black-btn">360°  <span class="glyphicon glyphicon glyphicon-camera" ></span> </button><div>',
      restrict: 'C',
      scope: false,
      compile: function compile(scope, element) {
        $compile(element)(scope);
      }
    };
  });
