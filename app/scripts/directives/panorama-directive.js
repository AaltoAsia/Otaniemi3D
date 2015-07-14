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
      template: '<div id="room-panorama"></div>',
      restrict: 'E',
      scope: {
        room: '='
      },
      link: function postLink(scope, element) {
        embedpano({
          xml: scope.room.panoramaPath,
          id: 'pano_obj',
          target: 'room-panorama',
          html5: 'only',
          passQueryParameters: true,
          vars: scope.room.info
        });

        scope.$on('$destroy', function () {
          element.remove();
        });
      }
    };
  });
