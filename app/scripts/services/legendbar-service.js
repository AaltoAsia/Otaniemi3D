'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.legendbarService
 * @description
 * # legendbarService
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('legendbarService', function (heatmapService) {

    var barWidth = 20,
        svgWidth = 80,
        x1 = 0,
        y1 = 1,
        legendLine,
        legendLineText,
        sensorType = null;

    this.setSensorType = function(type) {
      sensorType = type;
    };

    this.getSensorType = function() {
      return sensorType;
    };

    function gradientMouseOver() {
      legendLine.style('visibility', 'visible');
      legendLineText.style('visibility', 'visible');
    }

    function gradientMouseOut() {
      legendLine.style('visibility', 'hidden');
      legendLineText.style('visibility', 'hidden');
    }

    function gradientMouseMove() {
      var coordinates = [0, 0];

      var rectElem = d3.select('#gradientRect').node();

      coordinates = d3.mouse(rectElem);

      var bBoxHeight = rectElem.getBBox().height;

      //e.g. 60% if it's just below half way.
      var positionOnLegend = ((coordinates[1] - y1) / bBoxHeight);
      var valueText = heatmapService.valueAtPercent(sensorType.toLowerCase(), positionOnLegend) +
                        heatmapService.getValueUnit(sensorType);

      //The line shouldn't go all the way to top or bottom because
      //text would not fit completely inside the svg. Always
      //a few pixels away from top and bottom edge:
      var yLocation = Math.min((bBoxHeight - 3), Math.max(coordinates[1], 7));

      legendLine.attr('y1', yLocation).attr('y2', yLocation);
      legendLineText.attr('y', yLocation + 3)
        .text(valueText);
    }

    //Make and color the legend svg
    this.fillLegend = function() {

      d3.select('#legendMinText')
        .style('margin', '0px')
        .text(heatmapService.temperatureMin +
          heatmapService.getValueUnit('temperature'));

      d3.select('#legendContainingSvg')
        .attr('width', svgWidth)
        .attr('height', '100%');

      d3.select('#legendMaxText')
        .text(heatmapService.temperatureMax +
          heatmapService.getValueUnit('temperature'));

      //create the bar for the legend to go into
      // the "fill" attribute hooks the gradient up to this rect
      d3.select('#gradientRect')
        .attr('x',x1)
        .attr('y',y1)
        .attr('width',barWidth)
        .attr('height','99%');

      //mouseover line with the value of that point in legend
      legendLine = d3.select('#legendLine')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x1 + barWidth)
        .attr('y2', y1)
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .style('visibility', 'hidden');

      legendLineText = d3.select('#legendLineText')
        .attr('x', x1 + barWidth)
        .attr('y', y1)
        .style('visibility', 'hidden')
        .text('');

      d3.select('#gradientRect')
        .on('mouseover', gradientMouseOver)
        .on('mousemove', gradientMouseMove)
        .on('mouseout', gradientMouseOut);

      //we go from a somewhat transparent blue/green (hue = 160º, opacity = 0.3)
      //to a fully opaque reddish (hue = 0º, opacity = 1)
      var hueStart = 160, hueEnd = 0;
      var opacityStart = 0.3, opacityEnd = 1.0;
      var numberHues = 35;
      var theHue, rgbString, opacity,p;

      var deltaPercent = 1/(numberHues-1);
      var deltaHue = (hueEnd - hueStart)/(numberHues - 1);
      var deltaOpacity = (opacityEnd - opacityStart)/(numberHues - 1);

      //kind of out of order, but set up the data here
      var theData = [];
      for (var i=0;i < numberHues;i++) {
          theHue = hueStart + deltaHue*i;
          //the second parameter, set to 1 here, is the saturation
          // the third parameter is "lightness"
          rgbString = d3.hsl(theHue,1,0.6).toString();
          opacity = opacityStart + deltaOpacity*i;
          p = 0 + deltaPercent*i;
          theData.push({rgb:rgbString, opacity:opacity, percent:p});
      }

      //now the d3 magic (imo) ...
      var stops = d3.select('#legendGradient')
        .selectAll('stop')
        .data(theData);

      stops.enter().append('stop');

      stops
        .attr('offset', function(d) {
          return d.percent;
        })
        .attr('stop-color', function(d) {
          return d.rgb;
        })
        .attr('stop-opacity', function(d) {
          return d.opacity;
        });

      //And for binary rectangles, that is, for occupancy legend:
      var lowColor = heatmapService.getColor('occupancy', 0);
      var highColor = heatmapService.getColor('occupancy', 1);

      d3.select('#binaryRectTop')
        .attr('x',x1)
        .attr('y',y1)
        .attr('width',barWidth)
        .attr('height','50%')
        .attr('fill',lowColor.rgb)
        .attr('fill-opacity',lowColor.opacity);

      d3.select('#binaryRectBottom')
        .attr('x',x1)
        .attr('y','50%')
        .attr('width',barWidth)
        .attr('height','50%')
        .attr('fill',highColor.rgb)
        .attr('fill-opacity',highColor.opacity);
    };

    this.changeLegendText = function() {
      var minText, maxText;
      switch (sensorType.name.toLowerCase()) {
        case 'temperature':
          minText = heatmapService.temperatureMin;
          maxText = heatmapService.temperatureMax;
          break;
        case 'humidity':
          minText = heatmapService.humidityMin;
          maxText = heatmapService.humidityMax;
          break;
        case 'co2':
          minText = heatmapService.co2Min;
          maxText = heatmapService.co2Max;
          break;
        case 'pir': //We treat pir as occupancy
          minText = heatmapService.occupancyMin;
          maxText = heatmapService.occupancyMax;
          break;
        case 'light':
          minText = heatmapService.lightMin;
          maxText = heatmapService.lightMax;
          break;
        case 'occupancy':
          minText = heatmapService.occupancyMin;
          maxText = heatmapService.occupancyMax;
          break;
      }
      minText = minText + heatmapService.getValueUnit(sensorType.name);
      maxText = maxText + heatmapService.getValueUnit(sensorType.name);
      d3.select('#legendMinText').text(minText);
      d3.select('#legendMaxText').text(maxText);
    };

    this.changeLegendStyle = function() {
      //Here the legend would be made bicolor instead of gradient
    };
  });
