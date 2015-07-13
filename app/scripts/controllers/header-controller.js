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

    // Check if current URL-location matches the highlighted item
    $scope.isActive = function (viewLocation) {
      //startsWith()
        return $location.path().lastIndexOf(viewLocation, 0) === 0;
    };
    $scope.isCollapsed = true;

    $scope.$on('$routeChangeSuccess', function () {
        $rootScope.fullscreen = false;
    });

  });
