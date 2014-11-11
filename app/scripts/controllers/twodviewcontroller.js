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
    
  	Snap.load("http://upload.wikimedia.org/wikipedia/commons/8/84/Example.svg", function (f) {
	    var g = f.select("svg");

	    var svg_div = Snap.select(".floorplan");
	    svg_div.append(g);
	});
  });

