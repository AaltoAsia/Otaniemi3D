'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.Floorplans
 * @description
 * # Floorplans
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('Floorplans', function () {
    
    return [
      {
        url: 'floorplans/Basement.svg',
        name: 'Basement',
        roomNumber: 'st10',
        roomArea: 'st1',
        svg: null,
        isSelected: true,
        translate: [0,0],
        scale: 1
      },
      {
        url: 'floorplans/FloorPlan (1).svg',
        name: 'Floor 1',
        roomNumber: 'st13',
        roomArea: 'st3',
        svg: null,
        isSelected: false,
        translate: [0,0],
        scale: 1
      },
      {
        url: 'floorplans/FloorPlan (2).svg',
        name: 'Floor 2',
        roomNumber: 'st11',
        roomArea: 'st3',
        svg: null,
        isSelected: false,
        translate: [0,0],
        scale: 1
      },
      {
        url: 'floorplans/FloorPlan (3).svg',
        name: 'Floor 3',
        roomNumber: 'st7',
        roomArea: 'st1',
        svg: null,
        isSelected: false,
        translate: [0,0],
        scale: 1
      },
      {
        url: 'floorplans/FloorPlan (4).svg',
        name: 'Floor 4',
        roomNumber: 'st10',
        roomArea: 'st3',
        svg: null,
        isSelected: false,
        translate: [0,0],
        scale: 1
      },
    ];
  
  });
