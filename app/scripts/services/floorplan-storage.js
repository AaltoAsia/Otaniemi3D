'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.floorplanService
 * @description
 * # floorplanService
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('floorplanStorage', function () {

    var self = this;

    self.list = [
      {
        url: 'floorplans/floor1.svg',
        name: 'Floor 1',
        svg: null,
        floor: 1,
        isSelected: true,
        translate: [0,0],
        scale: 1
      },
      {
        url: 'floorplans/floor2.svg',
        name: 'Floor 2',
        svg: null,
        floor: 2,
        isSelected: false,
        translate: [0,0],
        scale: 1
      },
      {
        url: 'floorplans/floor3.svg',
        name: 'Floor 3',
        svg: null,
        floor: 3,
        isSelected: false,
        translate: [0,0],
        scale: 1
      },
      {
        url: 'floorplans/floor4.svg',
        name: 'Floor 4',
        svg: null,
        floor: 4,
        isSelected: false,
        translate: [0,0],
        scale: 1
      },
      {
        url: 'floorplans/floor5.svg',
        name: 'Floor 5',
        svg: null,
        floor: 5,
        isSelected: false,
        translate: [0,0],
        scale: 1
      }
    ];

  });
