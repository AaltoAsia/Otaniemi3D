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
      //svgDocument.attr('width', '500');
      //svgDocument.attr('height', '500');
      
      var svg = d3.select('.floorplan').node().appendChild(xml.documentElement);
      d3.select('svg').attr('pointer-events', 'all');
      
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
      
      var zoomListener = d3.behavior.zoom()
        .scaleExtent([1, 10])
        .on('zoom', zoomHandler);
  
      function zoomHandler() {
        d3.select(this).attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
      }
      
      d3.select('g').call(zoomListener);
    });
  });

