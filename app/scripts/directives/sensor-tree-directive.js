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
      require: 'ngModel',
      scope: {
        onSelect: '='
      },
      link: function postLink (scope, element, attrs, ngModel) {

        element.jstree({
          plugins: ['search', 'sort', 'state'],
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
                for (var i = 0; i < node.original.sensors.length; i++) {
                  var sensor = node.original.sensors[i];
                  sensor.children = true;
                  sensor.text = sensor.type;
                  children.push(sensor);
                }

              } else if (node.original.values) {
                for (var i = 0; i < node.original.values.length; i++) {
                  var value = node.original.values[i];
                  children.push(
                    { text: value.value + '   --  ' + value.time.toISOString() }
                  );
                }
              }

              cb.call(this, children);
            }
          }
        });

        element.on('select_node.jstree', function (event, data) {
          if (scope.$$phase) {
            return;
          }
          //Use $apply because jstree works outside of angular's scope
          scope.$apply(function() {
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
              room = element.jstree(true).get_json(node.parent);
            } else {
              room = element.jstree(true)
                .get_node(node.parents[1]).original;
              sensor = element.jstree(true)
                .get_node(node.parents[0]).original;
            }

            scope.onSelect(room, sensor);
          });
        });

        element.on('after_close.jstree', function (e, data) {
          var tree = element.jstree(true);
          data.node.children = true;
          tree._model.data[data.node.id].state.loaded = false;
        });

        scope.$watchCollection(function () { return ngModel.$modelValue; },
          function (newData) {
            if (!$.isEmptyObject(newData)) {
              var tree = element.jstree(true);
              tree.refresh();
              console.log('refresh');
            }
        });
      }
    };
  });
