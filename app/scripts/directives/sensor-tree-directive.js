'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:sensorTree
 * @description
 * # sensorTree
 */
angular.module('otaniemi3dApp')
  .directive('sensorTree', function ($document, $http, SensorData) {
    return {
      template: '<div></div>',
      restrict: 'E',
      require: 'ngModel',
      scope: {
        selectSensor: '=',
        addSensor: '=',
        search: '='
      },
      link: function postLink (scope, element, attrs, ngModel) {

        element.jstree({
          plugins: ['search', 'sort', 'dnd'],
          core: {
            check_callback: true,
            worker: false,
            data: function (node, cb) {
              var baseUrl = 'http://otaniemi3d.cs.hut.fi/omi/node/Objects/K1/';
              var children = [];

              if (node.id === '#') {
                children.push({
                  id: 'K1',
                  text: 'K1',
                  children: true,
                  //state: { opened: true },
                  icon: 'images/icon-building.svg',
                  type: 'building'
                });
                cb.call(this, children);

              } else if (node.original.type === 'sensor') {
                $http.get(node.original.url).success(function (data) {
                  var values = SensorData.parseInfoItem(data);

                  if (values.length) {
                    children = [{
                      text: values[0].value + '  --  ' +
                        values[0].time.toISOString(),
                      type: 'value'
                    }];
                  }

                  cb.call(this, children);
                });

              } else if (node.original.type === 'room') {
                $http.get(baseUrl + node.id).success(function (data) {
                  var room = SensorData.parseObject(data);

                  for (var i = 0; i < room.infoItems.length; i++) {
                    var id = room.infoItems[i];

                    children.push({
                      id: id,
                      text: id.charAt(0).toUpperCase() + id.slice(1),
                      children: true,
                      icon: 'images/icon-' + id + '.svg',
                      type: 'sensor',
                      url: baseUrl + node.id + '/' + id
                    });
                  }
                  cb.call(this, children);
                });

              } else if (node.original.type === 'building') {
                $http.get(baseUrl).success(function (data) {
                  var building = SensorData.parseObject(data);

                  for (var i = 0; i < building.objects.length; i++) {
                    var id = building.objects[i];

                    children.push({
                      id: id,
                      text: id.split('-').join(' '),
                      children: true,
                      icon: 'images/icon-room.svg',
                      type: 'room'
                    });
                  }
                  cb.call(this, children);
                });
              }

              /*
              if (node.id === '#') {
                children.push({
                  text: 'K1',
                  children: true,
                  state: { opened: true },
                  icon: 'images/icon-building.svg'
                });

              }  else if (node.original.sensors) {
                for (var j = 0; j < node.original.sensors.length; j++) {
                  var sensor = node.original.sensors[j];
                  sensor.children = true;
                  sensor.text = sensor.name;
                  sensor.icon = 'images/icon-' + sensor.type + '.svg';
                  children.push(sensor);
                }

              } else if (node.text === 'K1') {
                var keys = Object.keys(ngModel.$modelValue);
                for (var i = 0; i < keys.length; i++) {
                  var room = ngModel.$modelValue[keys[i]];
                  room.children = true;
                  room.text = room.name;
                  room.icon = 'images/icon-room.svg';
                  children.push(room);
                }

              } else if (node.original.values) {
                for (var k = 0; k < node.original.values.length; k++) {
                  var value = node.original.values[k];
                  children.push({
                    text: value.value + '   --  ' + value.time.toISOString(),
                    icon: ' '
                  });
                }
              }

              cb.call(this, children);
              */
            },
            themes: {
              responsive: true
            }
          },
          search: {
            show_only_matches: true,
            show_only_matches_children: true
          }
        });

        var tree = element.jstree(true);

        function getNode(node, noOriginal) {
          if (noOriginal) {
            return tree.get_node(node);
          } else {
            return tree.get_node(node).original;
          }
        }

        element
          .on('select_node.jstree', function (_, data) {
            if (data.event) {
              var node = data.node,
                  room = null,
                  sensor = null;

              if (node.text === 'K1' || node.original.sensors) {
                return;
              }

              if (node.original.values) {
                sensor = node.original;
                room = getNode(node.parent);
              } else {
                room = getNode(node.parents[1]);
                sensor = getNode(node.parents[0]);
              }

              //Use $apply because jstree works outside of angular's scope
              scope.$apply(scope.selectSensor(room, sensor));
            }
          })
          .on('after_close.jstree', function (_, data) {
            data.node.children = true;
            getNode(data.node.id, true).state.loaded = false;
          })
          .on('before_open.jstree', function (_, data) {
            if (data.node.children.length) {
              var node = getNode(data.node.children[0], true);
              if (!node.icon || node.icon === ' ') {
                element
                  .find('#' + node.id + '_anchor')
                  .find('i').remove();
              }
            }
          });

        $document
          .on('dnd_stop.vakata', function (_, data) {
            var target = $(data.event.target);
            if(target.closest('#drop-area').length) {
              var sensor = getNode(data.data.nodes[0], true);
              var room = getNode(sensor.parent);
              scope.addSensor(room, sensor.original);
            }
          })
          .on('dnd_move.vakata', function (_, data) {
            var target = $(data.event.target);
            if(!target.closest(element).length) {
              if(target.closest('#drop-area').length) {
                data.helper.find('.jstree-icon')
                  .removeClass('jstree-er')
                  .addClass('jstree-ok');
              }
              else {
                data.helper.find('.jstree-icon')
                  .removeClass('jstree-ok')
                  .addClass('jstree-er');
              }
            }
          });

        scope.$watch('search', function (str) {
          tree.search(str);
        });

        scope.$on('$destroy', function () {
          $.jstree.destroy();
          $document.off('dnd_stop.vakata dnd_move.vakata');
        });
      }
    };
  });
