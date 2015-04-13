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
                img: 'images/home2.png'
            },
            {
                caption: '1D View',
                description: 'In 1D View you can see the each value recorded by each sensor of K1-building in sortable 2-dimensional grid',
                link: '1dview',
                linktext: '1D View',
                img: 'images/1d.png'
            },
            {
                caption: '2D View',
                description: '2D view provides floor plans of K1-building with heat maps of each sensor values ' +
                             'In 2D view you can also view historical sensor values',
                link: '2dview',
                linktext: '2D View',
                img: 'images/2d.png'


            },
            {
                caption: '3D View',
                description: 'In 3D view you can see the 3D model of the K1-building. In 3D view you can also search' +
                    ' for rooms found in K1-building and see the panoramic views of those',
                link: '3dview',
                linktext: '3D View',
                img: 'images/3d.png'

            });

    });

