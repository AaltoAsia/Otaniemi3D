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
        controller: 'home'
      })
      .when('/1dview', {
        templateUrl: 'views/1dview.html',
        controller: 'onedview'
      })
      .when('/2dview', {
        templateUrl: 'views/2dview.html',
        controller: 'twodview'
      })
      .when('/3dview', {
        templateUrl: 'views/3dview.html',
        controller: 'threedview'
      })
      .when('/support', {
        templateUrl: 'views/support.html',
        controller: 'support'
      })
      .when('/panorama', {
        templateUrl: 'views/panorama.html',
        controller: 'PanoramaCtrl'
      })
      .otherwise({
        redirectTo: '/home'
      });
  })
  .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
      cfpLoadingBarProvider.includeSpinner = false;
  }])
  .run(function() {
    FastClick.attach(document.body);
  });