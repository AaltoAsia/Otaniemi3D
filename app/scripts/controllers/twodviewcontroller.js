'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:twoDViewCtrl
 * @description
 * # twoDViewCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('twodview', function ($scope) {
  var snap = Snap('#floorplan-svg');

  Snap.load('/floorplans/Basement.svg', function (f) {
    //Doesn't work yet because it doesn't override CSS.
    var roomToColor = f.select('#shape84-176');
    roomToColor.attr({
      stroke: 'green'
    });
    snap.append(f);
  });
    

  });

