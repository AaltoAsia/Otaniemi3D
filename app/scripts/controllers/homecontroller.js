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
            caption: '1d View',
            description: 'In 1d view you can see each value recorded by each sensor of k1 building in sortable 2-dimension grid.',
            link: '1dview',
            linktext: '1d View'
        });
        slides.push({
            caption: '2d View',
            description: 'Some text to emphasize how awesome our 2dview is',
            link: '2dview',
            linktext: '2d View'

        });
        slides.push({
            caption: '3d View',
            description: 'Some text to emphasize how awesome our 3dview is and what it does',
            link: '3dview',
            linktext: '3d View'

        });

    });

