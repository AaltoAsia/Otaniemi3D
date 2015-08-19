'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:GoogleMapsCtrl
 * @description
 * # GoogleMapsCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('GoogleMapsCtrl', function ($scope, $timeout, buildingData, $state, $compile) {

    //If code in this controller becomes too big google maps code
    //should be moved into its own directive.
    var self = this;
    self.currentBuilding = null;

    var mapOptions = {
      zoom: 16,
      center: {lat: 60.1866142, lng: 24.830513},
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      mapTypeControl: true,
      mapTypeControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM
      }
    };

    var map = new google.maps
      .Map($('#google-map')[0], mapOptions);

    //var infoContent = ;

    var buildingParam = $state.params.building;
    var infoWindow = new google.maps.InfoWindow({
      content: $compile([
        '<div class="info-window">',
          '<h4>',
            '{{googleMaps.currentBuilding.name}}',
          '</h4>',
          '<ul>',
            '<li ng-repeat="nav in App.navigation">',
              '<a class="btn btn-default"',
                  'ui-sref="{{nav.state}}({building: App.building.name,',
                    'floor: App.building.floorplans[0].floor})">',
                '{{nav.name}}',
              '</a>',
            '</li>',
          '</ul>',
        '</div>'
      ].join(''))($scope)[0]
    });

    if (buildingParam && buildingParam.length) {
      var current = buildingData.buildings[buildingParam];
      if (current) {
        self.currentBuilding = buildingData.currentBuilding = current;
        infoWindow.setPosition(getCenter(current));
        infoWindow.open(map);
      } else {
        buildingData.currentBuilding = null;
        $state.go('not-found');
        return;
      }
    }

    var selected = '#FF0000';
    var unselected = '#808080';

    function getCenter (building) {
      var bounds = new google.maps.LatLngBounds();

      for (var i = 0; i < building.coords.length; i++) {
        var coord = building.coords[i];

        bounds.extend(new google.maps.LatLng(
          coord.lat, coord.lng
        ));
      }

      return bounds.getCenter();
    }

    function initializeMap (map, buildings) {
      angular.forEach(buildings, function (building) {
        var aaltoBuilding = new google.maps.Polygon({
          paths: building.coords,
          strokeColor: selected,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: unselected,
          fillOpacity: 0.35
        });

        aaltoBuilding.setMap(map);
        building.polygon = aaltoBuilding;

        if (buildingData.currentBuilding &&
            buildingData.currentBuilding.name === building.name) {
          aaltoBuilding.setOptions({fillColor: selected});
        }

        google.maps.event
          .addListener(aaltoBuilding, 'click', function (event) {
            $scope.$apply(function () {
              aaltoBuilding.setOptions({fillColor: selected});
              infoWindow.setPosition(event.latLng);
              //infoWindow.setContent(infoContent);
              infoWindow.open(map);

              buildingData.currentBuilding = building;
              angular.forEach(buildings, function (_building) {
                if (aaltoBuilding !== _building.polygon) {
                  _building.polygon.setOptions({fillColor: unselected});
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
              building.polygon.setOptions({fillColor: unselected});
            });

            infoWindow.close();

            buildingData.currentBuilding = null;
          });
        });

        google.maps.event
          .addListener(infoWindow, 'closeclick', function () {
            $scope.$apply(function () {
              angular.forEach(buildings, function (building) {
                building.polygon.setOptions({fillColor: unselected});
              });
              buildingData.currentBuilding = null;
            });
          });
    }

    initializeMap(map, buildingData.buildings);

    //Trigger resize event so that map will be fully visible.
    $timeout(function () {
      var center = map.getCenter();
      google.maps.event.trigger(map, 'resize');
      map.setCenter(center);
    });

    //When current buliding changes update URL and self.currentBuilding
    //
    //IDEA: maybe moving these to the code location where the currentBuilding
    //changes can remove flickering
    $scope.$watch(function () {
      return buildingData.currentBuilding;
    }, function (building) {
      self.currentBuilding = building;
      if (building) {
        $state.go('google-maps', {building: building.name}, {notify: false});
      } else {
        $state.go('google-maps', {building: ''}, {notify: false});
      }
    });

    $scope.$on('destroy', function () {
      $scope.$apply(function () {
        angular.forEach(buildingData.buildings, function (building) {
          google.maps.event.removeInstanceListeners(building.polygon);
        });
        google.maps.event.clearListeners(map, 'click');
      });
    });

  });
