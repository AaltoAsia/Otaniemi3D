'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:OneDViewCtrl
 * @description
 * # oneDViewCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('onedview', function ($scope, $location) {
        $scope.myData = [
            {
                "firstName": "Cox",
                "lastName": "Carney"
            }];
  });
