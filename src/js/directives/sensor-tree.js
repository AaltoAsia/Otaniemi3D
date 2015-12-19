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
        odfObject: '='
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
                if (nodes[i].original.isOdfObject) {
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
              var rootId;
              if (scope.rootUrl) {
                rootId = scope.rootUrl.split('/');
                rootId = rootId[rootId.length - 1];
              }

              if (attrs.odfObject) {

                callback.call(this, [makeJsTree(scope.odfObject, scope.odfObject.id)]);

              } else if (node.id === '#') {
                var icon;
                if (rootId === 'K1' || rootId === 'CS') {
                  icon = 'assets/shared/images/icon-building.svg';
                } else {
                  icon = 'assets/shared/images/icon-room.svg';
                }

                //Root element
                children = [{
                  id: rootId,
                  text: rootId,
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

                    for (var j = 0; j < odfObject.childObjects.length; j++) {
                      var childObject = odfObject.childObjects[j];
                      var url = node.original.url + '/' + childObject.id;

                      children.push({
                        id: url,
                        text: childObject.id,
                        children: true,
                        isOdfObject: true,
                        icon: 'assets/shared/images/icon-room.svg',
                        url: url
                      });
                    }

                    var infoItems = odfObject.infoItems.reduce(
                      function(previous, current) {
                        return previous +
                        '<InfoItem name="' + current.name + '">' +
                          '<MetaData/>' +
                        '</InfoItem>';
                      }, ''
                    );

                    if (infoItems) {
                      var path = node.original.url.substring(node.original.url.indexOf(rootId));
                      var objects = path.split('/');
                      var request = objects.reduce(function (prev, current) {
                        return [prev[0] +
                          '<Object>' +
                            '<id>' + current + '</id>',
                          '</Object>' +
                          prev[1]];
                      }, ['', '']);

                      request = request[0] + infoItems + request[1];

                      omiMessage.send('read', request).then(function(data) {
                        var object = data[0];
                        var childObjects = object.childObjects;
                        while (object.id !== objects[objects.length - 1] &&
                              childObjects && childObjects.length) {
                          object = childObjects[0];
                        }
                        for (var i = 0; i < object.infoItems.length; i++) {
                          var infoItem = object.infoItems[i];
                          var url = node.original.url + '/' + infoItem.name;
                          var valueText = '';
                          if (infoItem.values.length) {
                            var value = infoItem.values[0];
                            valueText = ': ' + value.value +
                              valueConverter.getValueUnit(infoItem.name);
                          }

                          children.push({
                            id: url,
                            text: infoItem.name + valueText,
                            icon: 'assets/shared/images/icon-' +
                              infoItem.name + '.svg',
                            url: url
                          });
                        }

                        sendSuccess(this, callback, children);

                      }, function () {
                        sendError(this, callback, error);
                      });

                    } else {
                      sendSuccess(this, callback, children);
                    }

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

        function makeJsTree(data, rootUrl) {
          if (!data || !rootUrl) return null; //jshint ignore: line

          var childObjects = [];
          var infoItems = [];

          if (data.infoItems) {
            infoItems = data.infoItems.map(function(infoItem) {
              var url = rootUrl + '/' + infoItem.name;
              var valueText = '';

              if (infoItem.values.length) {
                var value = infoItem.values[0];
                valueText = ': ' + value.value +
                  valueConverter.getValueUnit(infoItem.name);
              }

              return {
                id: url,
                text: infoItem.name + valueText,
                icon: 'assets/shared/images/icon-' + infoItem.name + '.svg'
              };
            });
          }

          if (data.childObjects) {
            childObjects = data.childObjects.map(function(object) {
              makeJsTree(object, rootUrl + '/', object.id);
            });
          }

          return {
            id: rootUrl,
            text: data.id,
            isOdfObject: true,
            state: { opened: true },
            children: infoItems.concat(childObjects),
            icon: 'assets/shared/images/icon-room.svg'
          };
        }

        var tree = element.jstree(true);

        function getNode(node, original) {
          if (!original) {
            return tree.get_node(node);
          } else {
            return tree.get_node(node).original;
          }
        }

        if (!attrs.odfObject) {
          var updateSensors = $interval(function () {
            element.find('.jstree-open:not(.jstree-last)').each(function () {
              if ($(this).children('.jstree-children').children('.jstree-leaf').length) {
                tree.refresh_node(getNode($(this)));
              }
            });
          }, 5000);
        }

        element
          .on('after_close.jstree', function (_, data) {
            if (!attrs.odfObject) {
              data.node.children = true;
              getNode(data.node.id).state.loaded = false;
            }
          })
          .on('select_node.jstree', function () {
            if (scope.selectCallback) {
              scope.selectCallback(tree.get_selected(true));
            }
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

        scope.$watch('odfObject', function () {
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
