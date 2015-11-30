'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:sensorTree
 * @description
 * # sensorTree
 */
 /* jshint -W106 */ // Ignore jshint about non-camelCase variables
angular.module('otaniemi3dApp')
  .directive('sensorTree', function ($document, omiMessage, valueConverter, $interval) {
    return {
      template: '<div></div>',
      restrict: 'E',
      scope: {
        //This is called when user makes selections in the jstree.
        selectCallback: '=',
        //This is called when user drags nodes in the jstree.
        dragCallback: '=',
        //True if sensor tree should be searchable.
        search: '=',
        //Use checkboxes for selecting tree nodes.
        checkbox: '=',
        //Url for querying the root object. Uses omi node's REST API interface.
        rootUrl: '=',
        //Object to store error messages.
        error: '=',
        //If provided, the tree uses local data from this object.
        odfTree: '='
      },
      link: function postLink (scope, element, attrs) {
        element.jstree({
          plugins: [
            'sort',
            scope.checkbox ? 'checkbox' : '',
            attrs.search ? 'search' : '',
            attrs.dragCallback ? 'dnd' : ''
          ],
          search: {
            show_only_matches: true,
            show_only_matches_children: true
          },
          dnd: {
            is_draggable: function (nodes) {
              for (var i = 0; i < nodes.length; i++) {
                if (!nodes[i].original.isInfoItem) {
                  return false;
                }
              }
              return true;
            }
          },
          core: {
            check_callback: true,
            worker: false,
            data: function (node, callback) {

              function sendSuccess(self, callback, children) {
                callback.call(self, children);
                scope.error.show = false;
                scope.error.message = '';
              }

              function sendError(self, callback, error) {
                callback.call(self, error.errorNode);
                scope.error.show = true;
                scope.error.message = error.errorMsg;
              }

              var children = [];
              var error = {
                errorNode: [{ text: 'Error' }],
                errorMsg: 'Error when opening a tree node. Please close and reopen the node to try again.'
              };

              var icon, url, id;
              if (scope.rootUrl) {
                id = scope.rootUrl.split('/');
              }

              if (attrs.odfTree) {

                callback.call(this, [scope.odfTree]);

              } else if (node.id === '#') {
                //Check if url ends with slash or not and select last path element
                //i.e. .../K1/ and .../K1 both result in K1 as the id.
                //id = id[id.length-1].length ? id[id.length-1] : id[id.length-2];
                id = id[id.length - 1];

                if (id === 'K1' || id === 'CS') {
                  icon = 'assets/shared/images/icon-building.svg';
                } else {
                  icon = 'assets/shared/images/icon-room.svg';
                }

                //Root element
                children = [{
                  id: id,
                  text: id,
                  children: true,
                  isOdfObject: true,
                  url: scope.rootUrl,
                  icon: icon,
                  state: {opened: true}
                }];

                callback.call(this, children);

              } else if (node.original.isOdfObject) {

                omiMessage.restApi(node.original.url)
                  .then(function (odfObject) {

                    for (var i = 0; i < odfObject.infoItems.length; i++) {
                      var infoItem = odfObject.infoItems[i];
                      url = node.original.url + '/' + infoItem.name;

                      children.push({
                        id: url,
                        text: infoItem.name,
                        children: true,
                        isInfoItem: true,
                        icon: 'assets/shared/images/icon-' + infoItem.name + '.svg',
                        url: url
                      });
                    }

                    for (var j = 0; j < odfObject.childObjects.length; j++) {
                      var childObject = odfObject.childObjects[j];
                      url = node.original.url + '/' + childObject.id;

                      children.push({
                        id: url,
                        text: childObject.id,
                        children: true,
                        isOdfObject: true,
                        icon: 'assets/shared/images/icon-room.svg',
                        url: url
                      });
                    }

                    sendSuccess(this, callback, children);

                  }, function () {
                    sendError(this, callback, error);
                  });

              } else if (node.original.isInfoItem) {
                omiMessage.restApi(node.original.url, 'isInfoItem')
                  .then(function (infoItem) {

                    if (infoItem.values.length) {
                      var value = infoItem.values[0];

                      children.push({
                        id: node.original.url + '/' + 'value',
                        text: value.value + valueConverter.getValueUnit(infoItem.name) +
                          ' -- ' + new Date(value.time).toTimeString().split(' ')[0],
                        children: false,
                        icon: false
                      });
                    }

                    sendSuccess(this, callback, children);

                  }, function () {
                    sendError(this, callback, error);
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

        if (!attrs.odfTree) {
          var updateSensors = $interval(function () {
            element.find('.jstree-open').each(function () {
              if ($(this).children('.jstree-children').children('.jstree-leaf').length) {
                tree.refresh_node(getNode($(this)));
              }
            });
          }, 4000);
        }

        element
          .on('after_close.jstree', function (_, data) {
            if (attrs.odfTree) {
              data.node.children = true;
              getNode(data.node.id).state.loaded = false;
            }
          })
          .on('select_node.jstree', function () {
            if (!attrs.selectSensor) {
              return;
            }
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
              var sensor = getNode(data.data.nodes[0], true);
              scope.dragCallback(sensor);
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

        if (attrs.search) {
          scope.$watch('search', function (str) {
            if (str) {
              tree.search(str);
            } else {
              tree.clear_search();
            }
          });
        }

        scope.$watch('odfTree', function () {
          tree.refresh();
        });

        scope.$on('$destroy', function () {
          $interval.cancel(updateSensors);
          $.jstree.destroy();
          $document.off('dnd_stop.vakata dnd_move.vakata');
        });
      }
    };
  });
  /* jshint +W106 */
