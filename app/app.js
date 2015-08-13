'use strict';

/**
 * @ngdoc overview
 * @name otaniemi3dApp
 * @description
 * # otaniemi3dApp
 *
 * Main module of the application.
 */
angular
  .module('otaniemi3dApp', [
    'ui.bootstrap',
    'ui.grid',
    'ui.router',
    'angular-loading-bar',
    'highcharts-ng'
  ])
  .config(function ($stateProvider, $urlRouterProvider,
      $urlMatcherFactoryProvider) {

    $urlMatcherFactoryProvider.strictMode(false);

    $urlRouterProvider
      .when('', ['$state', function ($state) {
        $state.go('home');
      }])
      .when('/home', ['$state', function ($state) {
        $state.go('home');
      }])
      .otherwise('not-found', {
        url: '',
        templateUrl: 'views/not-found.html'
      });

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl as home'
      })
      .state('building', {
        abstract: true,
        url: '/:building',
        template: '<ui-view/>',
        resolve: {
          currentBuilding: function ($stateParams, buildingData, $q) {
            var deferred = $q.defer();
            var building = buildingData.buildings[$stateParams.building];
            if (building) {
              buildingData.url = building.url;
              buildingData.name = $stateParams.building;
              buildingData.coords = building.coords;
              buildingData.floorplans = building.floorplans;
              deferred.resolve(building);
            } else {
              deferred.reject('Selected building is not in database');
            }
            return deferred.promise;
          }
        }
      })
      .state('sensor-list', {
        url: '/sensor-list',
        templateUrl: 'views/sensor-list.html',
        controller: 'SensorListCtrl as sensorlist',
        parent: 'building'
      })
      .state('heat-map', {
        url: '/heat-map/:floorNum',
        templateUrl: 'views/heat-map.html',
        controller: 'HeatMapCtrl as heatmap',
        parent: 'building',
        resolve: {
          floor: function ($stateParams, buildingData, $q) {
            var deferred = $q.defer();
            var floor = Number($stateParams.floorNum);
            var floorExists = false;

            for (var i = 0; i < buildingData.floorplans.length; i++) {
              var floorplan = buildingData.floorplans[i];

              if (floorplan.floor === floor) {
                floorExists = true;
                break;
              }
            }

            if (!floorExists) {
              deferred.reject('Selected building is not in database');
            } else {
              deferred.resolve(floor);
            }
            return deferred.promise;
          }
        }
      })
      .state('3d-model', {
        url: '/3d-model',
        templateUrl: 'views/model-3d.html',
        parent: 'building'
      })
      .state('x3dom', {
        url: '/3d-model/x3dom/:roomId',
        templateUrl: 'views/x3dom.html',
        controller: 'X3DomCtrl as x3dom',
        parent: 'building',
        params:  {
          roomId: {
            value: null,
            squash: true
          }
        }
      })
      .state('unity', {
        url: '/3d-model/unity',
        templateUrl: 'views/unity.html',
        controller: 'UnityCtrl as unity',
        parent: 'building'
      })
      .state('analytics', {
        url: '/analytics',
        templateUrl: 'views/analytics.html',
        controller: 'AnalyticsCtrl as analytics',
        parent: 'building'
      })
      .state('panorama', {
        url: '/panorama/:roomId',
        templateUrl: 'views/panorama.html',
        controller: 'PanoramaCtrl as panorama',
        parent: 'building'
      })
      .state('not-found', {
        //url: '{path:.*}',
        templateUrl: 'views/not-found.html'
      });
  })
  .config(function(cfpLoadingBarProvider) {
      cfpLoadingBarProvider.includeSpinner = false;
  })
  .run(function($rootScope, $state) {
    FastClick.attach(document.body);

    $rootScope.$on('$stateChangeError', function (event) {
      console.log('change error');
      $state.go('not-found');
      event.preventDefault();
    });

    $rootScope.$on('$stateChangeStart', function (event, toState) {
      console.log('change started');
      console.log(toState);
    });

    $rootScope.$on('$stateChangeSuccess', function () {
      console.log('change success');
    });
  });
