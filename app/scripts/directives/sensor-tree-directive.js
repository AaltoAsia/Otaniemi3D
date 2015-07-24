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
      scope: {
        selectSensor: '=',
        dragSensor: '=',
        search: '=',
        rootUrl: '=',
        error: '='
      },
      link: function postLink (scope, element, attrs) {
        element.jstree({
          plugins: [
            'sort',
            typeof attrs.checkbox === 'string' ? 'checkbox' : '',
            typeof attrs.search === 'string' ? 'search' : '',
            typeof attrs.dragSensor === 'string' ? 'dnd' : ''
          ],
          search: {
            show_only_matches: true,
            show_only_matches_children: true
          },
          dnd: {
            is_draggable: function (nodes) {
              var node = nodes[0];
              return node.original.type === 'sensor';
            }
          },
          core: {
            check_callback: true,
            worker: false,
            data: function (node, cb) {

              function sendSuccess(self, cb, children) {
                cb.call(self, children);
                scope.error.show = false;
                scope.error.message = '';
              }

              function sendError(self, cb, error) {
                cb.call(self, error.errorNode);
                scope.error.show = true;
                scope.error.message = error.errorMsg;
              }

              var children = [];
              var error = {
                errorNode: [{ text: 'Error' }],
                errorMsg: 'Error when opening a tree node. Please close and reopen the node to try again.'
              };
              var id = scope.rootUrl.split('/');
              var icon;
              var type;
              var url;

              if (node.id === '#') {
                id = id[id.length-1].length ? id[id.length-1] : id[id.length-2];

                //IDEA: data from server could have type as a metadata
                if (id === 'K1') {
                  icon = 'images/icon-building.svg';
                  type = 'building';
                } else {
                  icon = 'images/icon-room.svg';
                  type = 'room';
                }

                children = [{
                  id: id,
                  text: id.split('-').join(' '),
                  children: true,
                  type: type,
                  icon: icon,
                  state: {opened: true}
                }];

                cb.call(this, children);

              } else if (node.original.type === 'sensor') {
                $http.get(node.original.url).success(function (data) {
                  var values = SensorData.parseInfoItem(data);

                  if (values.length) {
                    children = [{
                      values: values,
                      text: values[0].value + '  --  ' +
                        values[0].time.toISOString(),
                      icon: false,
                      type: 'value'
                    }];
                  }

                  sendSuccess(this, cb, children);
                })
                .error(function () {
                  sendError(this, cb, error);
                });

              } else if (node.original.type === 'room') {
                url = scope.rootUrl;
                if (node.parent !== '#') {
                  url += node.id;
                }
                $http.get(url).success(function (data) {
                  var room = SensorData.parseObject(data);

                  for (var i = 0; i < room.infoItems.length; i++) {
                    var id = room.infoItems[i];

                    children.push({
                      id: id + '-' + node.id,
                      room: room.id,
                      name: id,
                      text: id.charAt(0).toUpperCase() + id.slice(1),
                      children: true,
                      icon: 'images/icon-' + id + '.svg',
                      type: 'sensor',
                      url: url + '/' + id
                    });
                  }
                  sendSuccess(this, cb, children);
                })
                .error(function () {
                  sendError(this, cb, error);
                });

              } else if (node.original.type === 'building') {
                url = scope.rootUrl;
                if (node.parent !== '#') {
                  url += node.id;
                }
                $http.get(url).success(function (data) {
                  var building = SensorData.parseObject(data);

                  for (var i = 0; i < building.objects.length; i++) {
                    var id = building.objects[i];

                    children.push({
                      id: id,
                      text: id.split('-').join(' '),
                      children: true,
                      icon: 'images/icon-room.svg',
                      type: 'room',
                      url: scope.rootUrl + id
                    });
                  }
                  sendSuccess(this, cb, children);
                })
                .error(function () {
                  sendError(this, cb, error);
                  node.children = true;
                });
              }
            },
            themes: {
              responsive: true
            }
          }
        });

        var tree = element.jstree(true);

        function getNode(node, original) {
          if (!original) {
            return tree.get_node(node);
          } else {
            return tree.get_node(node).original;
          }
        }

        element
          .on('after_close.jstree', function (_, data) {
            data.node.children = true;
            getNode(data.node.id).state.loaded = false;
          })
          .on('select_node.jstree', function () {
            var selectedSensors = [];

            angular.forEach(tree.get_selected(true), function (node) {
              if (node.original.type === 'sensor') {
                selectedSensors.push(node.original);
              }
            });

            scope.selectSensor(selectedSensors);
          });

        $document
          .on('dnd_stop.vakata', function (_, data) {
            var target = $(data.event.target);
            if(target.closest('#drop-area').length) {
              var sensor = getNode(data.data.nodes[0]);
              var room = getNode(sensor.parent);
              scope.dragSensor(room, sensor);
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

        if (typeof scope.search === 'string') {
          scope.$watch('search', function (str) {
            tree.search(str);
          });
        }

        scope.$on('$destroy', function () {
          $.jstree.destroy();
          $document.off('dnd_stop.vakata dnd_move.vakata');
        });
      }
    };
  });
