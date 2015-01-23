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
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap',
    'ui.grid'
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
      .otherwise({
        redirectTo: '/home'
      });
  })
  .run(function() {
    FastClick.attach(document.body);
  });