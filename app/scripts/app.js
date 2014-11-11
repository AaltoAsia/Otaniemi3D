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
  });



// Change look of active navbar element on click
$(document).ready(function(){
   
   
    //
    // handlers for clicking navigation elements
    //
   
  $(window).on('hashchange',function() {
    if ( window.location.href.indexOf('1dview') !== -1 ) {
      $('.navbar .nav .nav1d').addClass('active');
    } else if ( window.location.href.indexOf('2dview') !== -1 ) {
      $('.navbar .nav .nav2d').addClass('active');
    } else if ( window.location.href.indexOf('3dview') !== -1 ) {
      $('.navbar .nav .nav3d').addClass('active');
    } else if ( window.location.href.indexOf('support') !== -1) {
      $('.navbar .nav .nav-support').addClass('active');
    } else if ( window.location.href.indexOf('home') !== -1) {
        // TODO
    }     
  });
   
  $('.navbar .nav > li').click(function() {
    $(this).siblings('li').removeClass('active');
    $(this).addClass('active');    
    $('.navbar .nav .nav-support').removeClass('active');    
  });
  
  // when clicking support we make sure there are no actives around
  $('.navbar .nav .nav-support').click(function() {
    $('.navbar .nav .nav-support').addClass('active');  
    $('.navbar .navbar-brand').css('color','gray'); 
    $('.navbar .nav .nav1d').removeClass('active');
    $('.navbar .nav .nav2d').removeClass('active');
    $('.navbar .nav .nav3d').removeClass('active');
  });
  
  // TODO: clicking home 
  $('.navbar .navbar-brand').click(function() {
    $('.navbar .nav .nav1d').removeClass('active');
    $('.navbar .nav .nav2d').removeClass('active');
    $('.navbar .nav .nav3d').removeClass('active');  
  });
});

