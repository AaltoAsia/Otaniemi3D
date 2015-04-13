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
                description: 'With Otaniemi3D you can visualize the sensor values of k1-building of Otaniemi',
                link: 'support',
                linktext: 'Support',
                img: 'images/home.jpg'
            },
            {
                caption: '1D View',
                description: 'In 1D View you can see values recorded by sensors of the K1-building in sortable 2-dimension grid',
                link: '1dview',
                linktext: '1D View',
                img: 'images/1d.jpg'
            },
            {
                caption: '2D View',
                description: '2D view displays floor plans of K1-building with heat maps for different sensor values',
                link: '2dview',
                linktext: '2D View',
                img: 'images/2d.jpg'


            },
            {
                caption: '3D View',
                description: 'In 3D view you can see the 3D model of the K1-building. You can search' +
                    ' for rooms of K1 and look at panoramic pictures',
                link: '3dview',
                linktext: '3D View',
                img: 'images/3d.jpg'

            });

    });

