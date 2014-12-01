'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:OneDViewCtrl
 * @description
 * # oneDViewCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')

  .controller('onedview', function ($scope, $location, Datahandler) {

        var fetchJsonPromise = Datahandler.fetchJson();
        fetchJsonPromise.then(function (data) {
          $scope.myData = data.data;
        });


  });