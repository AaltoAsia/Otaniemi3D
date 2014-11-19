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
      
      var svgDocument = d3.select(xml.documentElement);
      svgDocument.attr('width', '500');
      svgDocument.attr('height', '500');
      
      d3.select('.floorplan').node().appendChild(xml.documentElement);
      
      d3.selectAll('rect')
        .on('mouseover', function(){
          d3.select(this).style('fill', 'red');
        })
        .on('mouseout', function(){
          d3.select(this).style('fill', null);
        });
      
      d3.selectAll('path')
        .on('mouseover', function(){
          d3.select(this).style('fill', 'red');
        })
        .on('mouseout', function(){
          d3.select(this).style('fill', null);
        });
    }); 

  });

