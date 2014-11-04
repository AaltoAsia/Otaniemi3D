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
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/1dview.html',
        controller: '1dview'
      })
      .when('/2dview', {
        templateUrl: 'views/2dview.html',
        controller: '2dview'
      })
      .when('/3dview', {
        templateUrl: 'views/3dview.html',
        controller: '3dview'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
