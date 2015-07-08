'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:sensorTree
 * @description
 * # sensorTree
 */
angular.module('otaniemi3dApp')
  .directive('sensorTree', function ($document) {
    return {
      template: '<div></div>',
      restrict: 'E',
      require: 'ngModel',
      scope: {
        onSelect: '='
      },
      link: function postLink (scope, element, attrs, ngModel) {

        element.jstree({
          plugins: ['search', 'sort', 'dnd'],
          core: {
            check_callback: true,
            worker: false,
            data: function (node, cb) {
              var children = [];

              if (node.id === '#') {
                children.push({
                  text: 'K1',
                  children: true,
                  state: { opened: true }
                });

              } else if (node.text === 'K1') {
                var keys = Object.keys(ngModel.$modelValue);
                for (var i = 0; i < keys.length; i++) {
                  var room = ngModel.$modelValue[keys[i]];
                  room.children = true;
                  room.text = room.name;
                  children.push(room);
                }

              } else if (node.original.sensors) {
                for (var j = 0; j < node.original.sensors.length; j++) {
                  var sensor = node.original.sensors[j];
                  sensor.children = true;
                  sensor.text = sensor.name;
                  children.push(sensor);
                }

              } else if (node.original.values) {
                for (var k = 0; k < node.original.values.length; k++) {
                  var value = node.original.values[k];
                  children.push(
                    { text: value.value + '   --  ' + value.time.toISOString() }
                  );
                }
              }

              cb.call(this, children);
            },
            dnd: {
              always_copy: true
            }
          }
        });

        var tree = element.jstree(true);

        function getNode(node, notOriginal) {
          if (notOriginal) {
            return tree.get_node(node);
          } else {
            return tree.get_node(node).original;
          }
        }

        element.on('select_node.jstree', function (_, data) {
          if (data.event) {
            var node = data.node,
                room = null,
                sensor = null;

            if (node.text === 'K1') {
              return;
            }

            if (node.original.sensors) {
              room = node.original;
            } else if (node.original.values) {
              sensor = node.original;
              room = getNode(node.parent);
            } else {
              room = getNode(node.parents[1]);
              sensor = getNode(node.parents[0]);
            }

            //Use $apply because jstree works outside of angular's scope
            scope.$apply(scope.onSelect(room, sensor));
          }
        });

        element.on('after_close.jstree', function (_, data) {
          data.node.children = true;
          getNode(data.node.id, true).state.loaded = false;
        });

        $document.on('dnd_stop.vakata', function (_, data) {
          var target = $(data.event.target);
          if(target.closest('#drop-area').length) {
            var sensor = getNode(data.data.nodes[0], true);
            var room = getNode(sensor.parent);
            scope.onSelect(room, sensor.original);
          }
        });

        scope.$on('sensordata-update', function () {
          tree.refresh();
          // var state = tree.get_state(),
          //     opened = state.core.open;
          //
          // if (opened.length <= 1) {
          //   tree.refresh();
          // } else {
          //   for (var i = 0; i < opened.length; i++) {
          //     var node = getNode(opened[i], true);
          //     if (node.text !== 'K1') {
          //       while (node.children.length) {
          //         node = getNode(node.children[0], true);
          //       }
          //       node = getNode(node.parent, true);
          //       tree.refresh_node(node);
          //     }
          //   }
          // }
        });

        scope.$on('$destroy', function () {
          $.jstree.destroy();
        });
      }
    };
  });
