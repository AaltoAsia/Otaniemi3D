'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:HomeCtrl
 * @description
 * # homeCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('HomeCtrl', function ($scope, $timeout, buildingData) {

    var self = this;

    var mapOptions = {
      zoom: 16,
      center: new google.maps.LatLng(60.1866142,24.830513),
      mapTypeId: google.maps.MapTypeId.TERRAIN
    };

    self.map = new google.maps
      .Map($('#google-map')[0], mapOptions);

    function initializeMap(map, buildings) {
      angular.forEach(buildings, function (building) {
        var aaltoBuilding = new google.maps.Polygon({
          paths: building.coords,
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#808080',
          fillOpacity: 0.35
        });

        aaltoBuilding.setMap(map);
        building.polygon = aaltoBuilding;

        if (buildingData.currentBuilding &&
            buildingData.currentBuilding.name === building.name) {
          aaltoBuilding.setOptions({fillColor:  '#FF0000'});
        }

        google.maps.event
          .addListener(aaltoBuilding, 'click', function () {
            $scope.$apply(function () {
              aaltoBuilding.setOptions({fillColor:  '#FF0000'});

              buildingData.currentBuilding = building;

              angular.forEach(buildings, function (_building) {
                if (aaltoBuilding !== _building.polygon) {
                  _building.polygon.setOptions({fillColor:  '#808080'});
                }
              });
            });
          });

        google.maps.event
          .addListener(aaltoBuilding, 'mouseover', function () {
            $scope.$apply(function () {
              aaltoBuilding.setOptions({strokeWeight: 4});
            });
          });

        google.maps.event
          .addListener(aaltoBuilding, 'mouseout', function () {
            $scope.$apply(function () {
              aaltoBuilding.setOptions({strokeWeight: 2});
            });
          });
      });

      google.maps.event
        .addListener(map, 'click', function () {
          $scope.$apply(function () {
            angular.forEach(buildings, function (building) {
              building.polygon.setOptions({fillColor:  '#808080'});
            });

            buildingData.currentBuilding = null;

          });
        });
    }

    initializeMap(self.map, buildingData.buildings);

    //Trigger resize event so that map will be fully visible.
    $timeout(function () {
      var center = self.map.getCenter();
      google.maps.event.trigger(self.map, 'resize');
      self.map.setCenter(center);
    });

    $scope.$on('destroy', function () {
      $scope.$apply(function () {
        angular.forEach(self.buildings, function (building) {
          google.maps.event.removeInstanceListeners(building.polygon);
        });
        google.maps.event.clearListeners(self.map, 'click');
      });
    });

  });
