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

    d3.xml('/floorplans/Basement.svg', "image/svg+xml", function(xml) {
      console.log(xml.documentElement);
      d3.select('.floorplan').node().appendChild(xml.documentElement);
      d3.selectAll('rect').style('fill', 'green');
    }); 

  });

