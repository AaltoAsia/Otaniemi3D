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
        humidityMax = 70;
  
    //Translate value between low and high parameters to a percentage
    function scaleValueLowHigh(value, low, high) {
      return Math.max(0, Math.min(1, (value - low) / (high - low)));
    }
  
    function getColor(sensorType, value) {
      
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
              min = pirMin;
              max = pirMax;
              break;
          case 'humidity':
              min = humidityMin;
              max = humidityMax;
              break;
      }

      var percentage = Math.min((value - min) / (max - min), 1);
      percentage = Math.max(percentage, 0);
      
      var hueStart = 160, hueEnd = 0;
      var opacityStart = 0.3, opacityEnd = 1.0;
      var numberHues = 35;
      var theHue, rgbString, opacity, p;

      var deltaPercent = 1 / (numberHues - 1);
      var deltaHue = (hueEnd - hueStart)/(numberHues - 1);
      var deltaOpacity = (opacityEnd - opacityStart)/(numberHues - 1);

      theHue = hueStart + percentage * (hueEnd - hueStart);  
      rgbString = d3.hsl(theHue,1,0.6).toString();
      opacity = opacityStart + percentage * (opacityEnd - opacityStart);
      console.log(rgbString);
      return {"rgb":rgbString, "opacity":opacity}
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
      humidityMax: humidityMax
    };
  });
