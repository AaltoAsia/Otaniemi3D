'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.directive:panorama
 * @description
 * # panorama
 */
angular.module('otaniemi3dApp')
  .directive('panorama', function () {
    return {
      restrict: 'E',
      scope: {
        room: '='
      },
      link: function postLink(scope) {
        embedpano({
          xml: scope.room.xmlPath,
          id: 'panorama_obj',
          target: 'room-panorama',
          html5: 'only',
          passQueryParameters: true,
          consolelog: true,
          debugmode: true,
          initvars: {krpanodir: '../../../krpano'}
        });

        scope.$on('$destroy', function () {
          removepano('panorama_obj');
        });
      }
    };
  });
