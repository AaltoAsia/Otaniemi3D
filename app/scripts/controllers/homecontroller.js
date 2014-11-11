'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:HomeCtrl
 * @description
 * # homeCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('home', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });

  $('.navbar .nav .nav1d').addClass('active');
   
    
    
    
    /*
    $scope.updateNav = function() {
      $scope.navid = function() {
          
          
          
      }
      $scope.$emit('updateNav', $scope.navid);
    
    
    };
  });


  // Change look of active navbar element on click
  $(document).ready(function(){

    //
    // handlers for clicking navigation elements
    //
    
    $('.home-navs > li .nav1d').click(function() {
        return $(this);
    });
    
    $('.home-navs > li .nav2d').click(function() {
        return $(this);
    });
    
    $('.home-navs > li .nav3d').click(function() {
        return $(this);
    });
    
    
    
});    
*/