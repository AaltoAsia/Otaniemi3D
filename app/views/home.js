'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:HomeCtrl
 * @description
 * # homeCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('HomeCtrl', function () {

    function initializeMap() {
      var mapOptions = {
        zoom: 16,
        center: new google.maps.LatLng(60.1866142,24.830513),
        mapTypeId: google.maps.MapTypeId.TERRAIN
      };

      var map = new google.maps
        .Map($('#map-canvas')[0], mapOptions);

      var buildings = {
        CSBuilding: {
          coords: [
          	new google.maps.LatLng(60.18736197682253, 24.82065011298586),
          	new google.maps.LatLng(60.18696423810977, 24.82050094242607),
          	new google.maps.LatLng(60.18697377421658, 24.82040157601166),
          	new google.maps.LatLng(60.18688474809624, 24.82036940714926),
          	new google.maps.LatLng(60.18688925635673, 24.82033264036958),
          	new google.maps.LatLng(60.18684533864989, 24.82032576480652),
          	new google.maps.LatLng(60.18672032998956, 24.82172545239757),
          	new google.maps.LatLng(60.18662791041950, 24.82230385602049),
          	new google.maps.LatLng(60.18698280196402, 24.82254165006489),
          	new google.maps.LatLng(60.18723788021443, 24.82096696817736),
          	new google.maps.LatLng(60.18730008895606, 24.82100627000599),
          	new google.maps.LatLng(60.18736197682253, 24.82065011298586)
          ]
        },
        K1Building: {
          coords: [
            new google.maps.LatLng(60.18761720005726, 24.827497601509094),
            new google.maps.LatLng(60.18756252687934, 24.827677309513092),
            new google.maps.LatLng(60.187523855552186, 24.82763171195984),
            new google.maps.LatLng(60.18749451865291, 24.82772022485733),
            new google.maps.LatLng(60.18701445657686, 24.827119410037994),
            new google.maps.LatLng(60.187101134970995, 24.826819002628326),
            new google.maps.LatLng(60.18701845712317, 24.826719760894775),
            new google.maps.LatLng(60.18702645821431, 24.826684892177582),
            new google.maps.LatLng(60.18701045603007, 24.826663434505463),
            new google.maps.LatLng(60.18710246848297, 24.826357662677765),
            new google.maps.LatLng(60.187137139775146, 24.826389849185944),
            new google.maps.LatLng(60.18723448589975, 24.826089441776276),
            new google.maps.LatLng(60.187521188562435, 24.826446175575256),
            new google.maps.LatLng(60.18748251718655, 24.82656419277191),
            new google.maps.LatLng(60.18751718807737, 24.826604425907135),
            new google.maps.LatLng(60.18747184921278, 24.82674390077591),
            new google.maps.LatLng(60.187385171797395, 24.82663929462433),
            new google.maps.LatLng(60.18726248952598, 24.827049672603604),
            new google.maps.LatLng(60.18761720005726, 24.827497601509094)
          ]
        }
      };

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

        google.maps.event
          .addListener(aaltoBuilding, 'click', function () {
            aaltoBuilding.setOptions({fillColor:  '#FF0000'});
            //At this point the Otaniemi3D set and load the TABS related to this BUILDING
          });
        google.maps.event
          .addListener(aaltoBuilding, 'mouseover', function () {
            aaltoBuilding.setOptions({strokeWeight: 4});
          });

        google.maps.event
          .addListener(aaltoBuilding, 'mouseout', function () {
            aaltoBuilding.setOptions({strokeWeight: 2});
          });

        building.polygon = aaltoBuilding;
      });

      google.maps.event
        .addListener(map, 'click', function () {
          angular.forEach(buildings, function (building) {
            building.polygon.setOptions({fillColor:  '#808080'});
          });
        });

      var center = map.getCenter();
      google.maps.event.trigger(map, 'resize');
      map.setCenter(center);
    }

    if (!$('#map-canvas')[0].children.length) {
      initializeMap();
    }

  });
