'use strict';

/**
 * @ngdoc directive
 * @name otaniemi3dApp.filter:roomName
 * @description
 * # roomName
 */
angular.module('otaniemi3dApp')
  .filter('roomName', function() {
    return function(input) {
      return input ? input.replace('-', ' ') : '';
    };
  })
  .filter('sensorSuffix', function() {
    return function(input) {
      var sensorTypes = {
        temperature: '°C',
        co2: 'ppm',
        light: 'lux',
        humidity: '%'
      };
      var suffix = sensorTypes[input] ? sensorTypes[input] : '';

      return suffix;
    };
  });
