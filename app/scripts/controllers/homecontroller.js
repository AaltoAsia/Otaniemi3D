'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:HomeCtrl
 * @description
 * # homeCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('home', function ($scope) {
    $scope.interval = 0;
    var slides = $scope.slides = [];
    slides.push({
      caption: 'Otaniemi3D',
      secondCaption: 'Enhance building efficiency',
      description: 'With Otaniemi3D you can view and visualize the sensor values of K1-building of Otaniemi',
      link: 'support',
      linktext: 'Support',
      img: 'images/home.jpg'
    },
    {
      caption: '1D View',
      description: 'In 1D View you can see the each value recorded by each sensor of K1-building in sortable two-dimensional grid',
      link: '1dview',
      linktext: '1D View',
      img: 'images/1d.jpg'
    },
    {
      caption: '2D View',
      description: '2D view provides floor plans of K1-building with heat maps of each sensor values ' +
                   'In 2D view you can also view historical sensor values',
      link: '2dview',
      linktext: '2D View',
      img: 'images/2d.jpg'
    },
    {
      caption: '3D View',
      description: 'In 3D view you can see the 3D model of the K1-building. In 3D view you can also view' +
          ' the panoramic view of certain rooms',
      link: '3dview',
      linktext: '3D View',
      img: 'images/3d.jpg'
    });
  });