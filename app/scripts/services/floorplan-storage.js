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
        rooms: [],
        data: [],
        svg: null,
        floor: 1,
        translate: [0,0],
        scale: 1
      },
      {
        url: 'floorplans/floor2.svg',
        name: 'Floor 2',
        rooms: [],
        data: [],
        svg: null,
        floor: 2,
        translate: [0,0],
        scale: 1
      },
      {
        url: 'floorplans/floor3.svg',
        name: 'Floor 3',
        rooms: [],
        data: [],
        svg: null,
        floor: 3,
        translate: [0,0],
        scale: 1
      },
      {
        url: 'floorplans/floor4.svg',
        name: 'Floor 4',
        rooms: [],
        data: [],
        svg: null,
        floor: 4,
        translate: [0,0],
        scale: 1
      },
      {
        url: 'floorplans/floor5.svg',
        name: 'Floor 5',
        rooms: [],
        data: [],
        svg: null,
        floor: 5,
        translate: [0,0],
        scale: 1
      }
    ];

  });
