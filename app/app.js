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
    'angular-loading-bar',
    'angularSpinner',
    'highcharts-ng'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl'
      })
      .when('/home', {
        redirectTo: '/'
      })
      .when('/sensor-list', {
        templateUrl: 'views/sensor-list.html',
        controller: 'SensorListCtrl'
      })
      .when('/heat-map/:floorNumber', {
        templateUrl: 'views/floorplan.html',
        controller: 'FloorplanCtrl'
      })
      .when('/3d-model', {
        templateUrl: 'views/model-3d.html',
        controller: 'Model3dCtrl'
      })
      .when('/3d-model/x3dom', {
        templateUrl: 'views/x3dom.html',
        controller: 'X3DomCtrl'
      })
      .when('/3d-model/unity', {
        templateUrl: 'views/unity.html',
        controller: 'UnityCtrl'
      })
      .when('/analytics', {
        templateUrl: 'views/analytics.html',
        controller: 'AnalyticsCtrl'
      })
      .when('/heat-map/:floorNumber/panorama/:roomId', {
        templateUrl: 'views/panorama.html',
        controller: 'PanoramaCtrl'
      })
      .otherwise({
        templateUrl: 'views/not-found.html',
      });
  })
  .config(function(cfpLoadingBarProvider) {
      cfpLoadingBarProvider.includeSpinner = false;
  })
  .run(function(SensorData, Rooms) {
    //Inject SensorData and Room services so that browser can immediately
    //start to download sensor data from the server.
    FastClick.attach(document.body);
  });
