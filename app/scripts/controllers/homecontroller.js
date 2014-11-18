'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:HomeCtrl
 * @description
 * # homeCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('home', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });