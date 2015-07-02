'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:sensorTree
 * @description
 * # sensorTree
 */
angular.module('otaniemi3dApp')
  .directive('sensorTree', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      scope: {
        data: '=',
        onSelect: '='
      },
      link: function postLink (scope, element) {
        element.jstree({
          plugins: ['search', 'sort'],
          core: {
            check_callback: true,
            data: []
          }
        });

        element.on('select_node.jstree', function (event, data) {
          //Use $apply because jstree works outside of angular's scope
          scope.$apply(function() {
            var node = data.node;
            scope.onSelect(node.original);
          });
        });

        scope.$watch('data', function (data) {
          element.jstree(true).settings.core.data = data;
          element.jstree(true).refresh();
        });
      }
    };
  });
