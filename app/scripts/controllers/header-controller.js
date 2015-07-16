'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:HeaderCtrl
 * @description
 * # HeaderCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('HeaderCtrl', function ($scope, $location, $rootScope) {

    function startsWith(str, substr) {
      return str.lastIndexOf(substr, 0) === 0;
    }

    // Check if current URL-location matches the highlighted item
    $scope.isActive = function (viewLocation) {
      //startsWith()
      return startsWith($location.path(), viewLocation);
    };

    $scope.$on('$routeChangeSuccess', function () {
      if (!startsWith($location.path(), '/heat-map')) {
        $rootScope.fullscreen = false;
      }
    });

  });
