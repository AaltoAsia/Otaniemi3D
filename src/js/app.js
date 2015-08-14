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
    'ui.event',
    'angular-loading-bar',
    'highcharts-ng'
  ])
  .config(function ($stateProvider, $urlRouterProvider,
      $urlMatcherFactoryProvider) {

    function resolveBuilding ($stateParams, buildingData, $q) {
      var deferred = $q.defer();
      var building = buildingData.buildings[$stateParams.building];
      if (building) {
        buildingData.currentBuilding = building;
        deferred.resolve(building);
      } else {
        deferred.reject('Selected building is not in database');
      }
      return deferred.promise;
    }

    $urlMatcherFactoryProvider.strictMode(false);

    $urlRouterProvider
      .when('', ['$state', function ($state) {
        $state.go('home');
      }])
      .when('/home', ['$state', function ($state) {
        $state.go('home');
      }])
      .otherwise('not-found');

    $stateProvider
      .state('home', {
        url: '/:building',
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl as home'
      })
      .state('building', {
        abstract: true,
        url: '/:building',
        template: '<ui-view/>',
        resolve: {
          currentBuilding: resolveBuilding
        }
      })
      .state('sensor-list', {
        url: '/sensor-list',
        templateUrl: 'views/sensor-list.html',
        controller: 'SensorListCtrl as sensorlist',
        parent: 'building'
      })
      .state('heat-map', {
        url: '/heat-map/:floor',
        templateUrl: 'views/heat-map.html',
        controller: 'HeatMapCtrl as heatmap',
        parent: 'building',
        resolve: {
          floor: function ($stateParams, buildingData, $q) {
            var deferred = $q.defer();
            var floor = Number($stateParams.floor);
            var floorExists = false;
            var floorplans = buildingData.currentBuilding.floorplans;

            for (var i = 0; i < floorplans.length; i++) {
              if (floorplans[i].floor === floor) {
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
      .state('x3dom', {
        url: '/x3dom/:roomId',
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
        url: '{path:.*}',
        templateUrl: 'views/not-found.html'
      });
  })
  .config(function(cfpLoadingBarProvider) {
      cfpLoadingBarProvider.includeSpinner = false;
  })
  .run(function($rootScope, $state) {
    //Polyfill endsWith()
    if (!String.prototype.endsWith) {
      String.prototype.endsWith = function(searchString, position) {
        var subjectString = this.toString();
        if (position === undefined || position > subjectString.length) {
          position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
      };
    }

    FastClick.attach(document.body);

    //Hacky way to prevent app from navigating immediately to
    //home page after displaying 404 page.
    var notFound = false;

    $rootScope.$on('$stateChangeError', function (event) {
      $state.go('not-found');
      notFound = true;
      event.preventDefault();
    });

    $rootScope.$on('$locationChangeStart', function (event, newUrl) {
      if (notFound && newUrl.endsWith('/#/')) {
        notFound = false;
        event.preventDefault();
      }
    });
  });
