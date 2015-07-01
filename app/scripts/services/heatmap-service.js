'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.heatmapService
 * @description
 * # heatmapService
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('heatmapService', function () {
    
    var self = this;
    
    this.temperatureMin = 15;
    this.temperatureMax = 35;
    this.co2Min = 350;
    this.co2Max = 5000;
    this.lightMin = 30;
    this.lightMax = 10000;
    this.pirMin = 0;
    this.pirMax = 30;
    this.humidityMin = 30;
    this.humidityMax = 70;
    this.occupancyMin = 'no';
    this.occupancyMax = 'yes';
    
    //Source: https://gist.github.com/nowherenearithaca/4449376
    this.getColor = function(sensorType, value) {
      var sensorLower = sensorType.toLowerCase();
      var min;
      var max;
      switch (sensorLower) {
        case 'temperature':
          min = self.temperatureMin;
          max = self.temperatureMax;
          break;
        case 'co2':
          min = self.co2Min;
          max = self.co2Max;
          break;
        case 'light':
          min = self.lightMin;
          max = self.lightMax;
          break;
        case 'pir':
          min = self.pirMin;
          max = self.pirMax;
          break;
        case 'humidity':
          min = self.humidityMin;
          max = self.humidityMax;
          break;
        default:
          break;
      }

      var percentage;
      
      if (sensorLower === 'occupancy' ||
          sensorLower === 'pir' ||
          sensorLower === 'occupied'){
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
      var theHue, rgbString, opacity, fullString;

      theHue = hueStart + percentage * (hueEnd - hueStart);  
      rgbString = d3.hsl(theHue,1,0.6).toString();
      opacity = opacityStart + percentage * (opacityEnd - opacityStart);
      var rgb = d3.hsl(theHue,1,0.6).rgb();
      fullString = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + opacity + ')';
      
      return {rgb:rgbString, opacity:opacity, rgbaString:fullString};
    };
  
    //Percent is represented as 0.5, not 50% or 50
    this.valueAtPercent = function(sensorType, percent) {
      var min;
      var max;
      switch (sensorType) {
        case 'temperature':
          min = self.temperatureMin;
          max = self.temperatureMax;
          break;
        case 'co2':
          min = self.co2Min;
          max = self.co2Max;
          break;
        case 'light':
          min = self.lightMin;
          max = self.lightMax;
          break;
        case 'pir':
          if (percent <= 0.5) {return 'no';} else {return 'yes';}
          break;
        case 'humidity':
          min = self.humidityMin;
          max = self.humidityMax;
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
    };
  
    this.getValueUnit = function(sensorType){
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
    };
  });
