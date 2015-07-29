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
    'ngRoute',
    'ngTouch',
    'ui.bootstrap',
    'ui.grid',
    'ui.router',
    'angular-loading-bar',
    'angularSpinner',
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
      .state('sensor-list', {
        url: '/sensor-list',
        templateUrl: 'views/sensor-list.html',
        controller: 'SensorListCtrl as sensorlist'
      })
      .state('heat-map', {
        url: '/heat-map/{floorNum:[1-5]}',
        templateUrl: 'views/heat-map.html',
        controller: 'HeatMapCtrl as heatmap'
      })
      .state('3d-model', {
        url: '/3d-model',
        templateUrl: 'views/model-3d.html',
      })
      .state('x3dom', {
        url: '/3d-model/x3dom/:roomId',
        templateUrl: 'views/x3dom.html',
        controller: 'X3DomCtrl as x3dom',
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
        controller: 'UnityCtrl as unity'
      })
      .state('analytics', {
        url: '/analytics',
        templateUrl: 'views/analytics.html',
        controller: 'AnalyticsCtrl as analytics'
      })
      .state('panorama', {
        url: '/panorama/:roomId',
        templateUrl: 'views/panorama.html',
        controller: 'PanoramaCtrl as panorama'
      })
      .state('not-found', {
        url: '{path:.*}',
        templateUrl: 'views/not-found.html'
      });
  })
  .config(function(cfpLoadingBarProvider) {
      cfpLoadingBarProvider.includeSpinner = false;
  });
