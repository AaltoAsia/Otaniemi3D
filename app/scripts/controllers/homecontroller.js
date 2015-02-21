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
                caption: 'Otaniemi3D - enhance building efficiency',
                description: 'With Otaniemi3D you can visualize the sensor values of k1-building of Otaniemi',
                link: 'support',
                linktext: 'Support'
            },
            {
                caption: '1D View',
                description: 'In 1D View you can see each value recorded by each sensor of k1-building in sortable 2-dimension grid',
                link: '1dview',
                linktext: '1D View'
            },
            {
                caption: '2D View',
                description: '2d view provides floor plans of k1-building with heat maps of each sensor values',
                link: '2dview',
                linktext: '2D View'

            },
            {
                caption: '3D View',
                description: 'In 3d view you can see the 3d model of the k1-building. From that view you can search' +
                    ' for rooms of k1 and see the panoramic views of those',
                link: '3dview',
                linktext: '3D View'

            });

    });

