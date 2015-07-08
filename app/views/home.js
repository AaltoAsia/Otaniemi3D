'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:HomeCtrl
 * @description
 * # homeCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('HomeCtrl', function ($scope) {
    $scope.interval = 0;
    var slides = $scope.slides = [];
    slides.push({
      caption: 'Otaniemi3D',
      secondCaption: 'Enhance building efficiency',
      description: 'With Otaniemi3D you can view and visualize the sensor values of K1-building of Otaniemi.',
      link: 'support',
      linktext: 'Support',
      img: 'images/home.jpg'
    },
    {
      caption: 'Sensor List',
      description: 'You can view data recorded by each sensor in K1-building with a sortable two-dimensional grid',
      link: 'sensor-list',
      linktext: 'Sensor List',
      img: 'images/1d.jpg'
    },
    {
      caption: 'Heat Map',
      description: 'You can inspect floor plans of K1-building with heat maps of all sensor values. You can also view historical sensor values.',
      link: 'floorplans',
      linktext: 'Heat Map',
      img: 'images/2d.jpg'
    },
    {
      caption: '3D Model',
      description: 'You can explore the 3D model of K1-building with sensors placed in.',
      link: 'model-3d',
      linktext: '3D Model',
      img: 'images/3d.jpg'
    });
  });
