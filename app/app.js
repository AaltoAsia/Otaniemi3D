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
    'ngResource',
    'ngRoute',
    'ngTouch',
    'ui.bootstrap',
    'ui.grid',
    'angular-loading-bar',
    'angularSpinner'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/home', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl'
      })
      .when('/sensor-list', {
        templateUrl: 'views/sensor-list.html',
        controller: 'SensorListCtrl'
      })
      .when('/floorplan', {
        templateUrl: 'views/floorplan.html',
        controller: 'FloorplanCtrl'
      })
      .when('/model-3d', {
        templateUrl: 'views/model-3d.html',
        controller: 'Model3dCtrl'
      })
      .when('/analytics', {
        templateUrl: 'views/analytics.html',
        controller: 'AnalyticsCtrl'
      })
      .otherwise({
        redirectTo: '/home'
      });
  })
  .config(function(cfpLoadingBarProvider) {
      cfpLoadingBarProvider.includeSpinner = false;
  })
  .run(function() {
    FastClick.attach(document.body);
  });