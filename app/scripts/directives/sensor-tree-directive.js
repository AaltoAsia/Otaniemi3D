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
            var node = data.node,
                room = null,
                sensor = null;

            if (node.original.sensors) {
              room = node.original;
            } else if (node.original.values) {
              sensor = node.original;
              room = element.jstree(true).get_json(node.parent);
            }

            scope.onSelect(room, sensor);
          });
        });

        scope.$watch('data', function (data) {
          element.jstree(true).settings.core.data = data;
          element.jstree(true).refresh();
        });
      }
    };
  });
