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

    var fetchDataPromise = Datahandler.fetchData();
    fetchDataPromise
      .then(function (data) {
        $scope.gridOptions.data = data;
        }, function (reason) {    // something gone wrong
        $scope.gridOptions.data = reason;
      });
       $scope.gridOptions = {
        enableFiltering: true,
        columnDefs: [
          {
            field: 'id',
            filter: {
              condition:  function(searchTerm, cellValue) {
                var strippedValue = cellValue.toLowerCase();
                return strippedValue.indexOf(searchTerm.toLowerCase()) >= 0;
                }
              }
            },
          {
            field: 'room',
            filter: {
              condition:  function(searchTerm, cellValue) {
                var strippedValue = cellValue.toLowerCase();
                return strippedValue.indexOf(searchTerm.toLowerCase()) >= 0;
                }
              }
            },
          {
            field: 'sensorId',
            filter: {
              condition:  function(searchTerm, cellValue) {
                var strippedValue = cellValue.toLowerCase();
                return strippedValue.indexOf(searchTerm.toLowerCase()) >= 0;
                }
              }
            },
          {
            field: 'type',
            filter: {
              condition:  function(searchTerm, cellValue) {
                var strippedValue = cellValue.toLowerCase();
                return strippedValue.indexOf(searchTerm.toLowerCase()) >= 0;
                }
              }
            },
          {
            field: 'value'
          }
        ]
      };
  });