'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:HeaderController
 * @description
 * # HeaderController
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('HeaderController', function ($scope, $location, $rootScope) {


   // Check if current URL-location matches the highlighted item
   //
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    $scope.isCollapsed = true;

    $scope.$on('$routeChangeSuccess', function () {
        $rootScope.fullscreen = false;
    });
  });
