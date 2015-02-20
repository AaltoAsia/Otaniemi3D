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
            description: 'With Otaniemi3d you can access building sensor values in three different ways.',
            link: 'support',
            linktext: 'Support'
        });
        slides.push({
            caption: '1D View',
            description: 'In 1D View you can see each value recorded by each sensor of k1 building in sortable 2-dimension grid.',
            link: '1dview',
            linktext: '1D View'
        });
        slides.push({
            caption: '2D View',
            description: 'Some text to emphasize how awesome our 2D View is',
            link: '2dview',
            linktext: '2D View'

        });
        slides.push({
            caption: '3D View',
            description: 'Some text to emphasize how awesome our 3D View is and what it does',
            link: '3dview',
            linktext: '3D View'

        });

    });

