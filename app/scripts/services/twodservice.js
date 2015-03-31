'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.2dservice
 * @description
 * # 2dservice
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('twodservice', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function
    
    var temperatureMin = 15,
        temperatureMax = 35,
        co2Min = 350,
        co2Max = 5000,
        lightMin = 30,
        lightMax = 10000,
        pirMin = 0,
        pirMax = 30,
        humidityMin = 30,
        humidityMax = 70,
        occupancyMin = 'no',
        occupancyMax = 'yes';
    
    //Source: https://gist.github.com/nowherenearithaca/4449376
    function getColor(sensorType, value) {
      var sensorLower = sensorType.toLowerCase();
      var min;
      var max;
      switch (sensorLower) {
          case 'temperature':
              min = temperatureMin;
              max = temperatureMax;
              break;
          case 'co2':
              min = co2Min;
              max = co2Max;
              break;
          case 'light':
              min = lightMin;
              max = lightMax;
              break;
          case 'pir':
              min = pirMin;
              max = pirMax;
              break;
          case 'humidity':
              min = humidityMin;
              max = humidityMax;
              break;
          default:
              break;
      }

      var percentage;
      
      if (sensorLower === 'occupancy' || sensorLower === 'pir' || sensorLower === 'occupied'){
        if (value <= 0) {
          percentage = 0;
        } else {
          percentage = 1;
        }
      } else {
        percentage = Math.min((value - min) / (max - min), 1);
        percentage = Math.max(percentage, 0);
      }
      
      var hueStart = 160, hueEnd = 0;
      var opacityStart = 0.3, opacityEnd = 1.0;
      var theHue, rgbString, opacity;

      theHue = hueStart + percentage * (hueEnd - hueStart);  
      rgbString = d3.hsl(theHue,1,0.6).toString();
      opacity = opacityStart + percentage * (opacityEnd - opacityStart);
      return {rgb:rgbString, opacity:opacity};
    }
  
    //Percent is represented as 0.5, not 50% or 50
    function valueAtPercent(sensorType, percent) {
      var min;
      var max;
      switch (sensorType) {
          case 'temperature':
              min = temperatureMin;
              max = temperatureMax;
              break;
          case 'co2':
              min = co2Min;
              max = co2Max;
              break;
          case 'light':
              min = lightMin;
              max = lightMax;
              break;
          case 'pir':
              if (percent <= 0.5) {return 'no';} else {return 'yes';}
              break;
          case 'humidity':
              min = humidityMin;
              max = humidityMax;
              break;
          case 'occupancy':
              if (percent <= 0.5) {return 'no';} else {return 'yes';}
              break;
      }
      var value = (min + percent * (max-min))/1;
      if (value < 0) { 
        return Math.ceil(value); 
      } else {
        return Math.floor(value);
      }      
    }
  
    function getValueUnit(sensorType){
      switch(sensorType.toLowerCase()) {
          case 'temperature':
            return '°C';
          case 'co2':
            return 'ppm';
          case 'light':
            return 'lux';
          case 'humidity':
            return '%';
          default:
            return '';
      }
    }
    
  
    return { 
      getColor: getColor,
      temperatureMin: temperatureMin,
      temperatureMax: temperatureMax,
      co2Min: co2Min,
      co2Max: co2Max,
      lightMin: lightMin,
      lightMax: lightMax,
      pirMin: pirMin,
      pirMax: pirMax,
      humidityMin: humidityMin,
      humidityMax: humidityMax,
      occupancyMin: occupancyMin,
      occupancyMax: occupancyMax,
      valueAtPercent: valueAtPercent,
      getValueUnit: getValueUnit
    };
  });
