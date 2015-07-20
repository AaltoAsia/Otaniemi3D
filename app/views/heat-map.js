'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:FloorplanCtrl
 * @description
 * # FloorplanCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('HeatMapCtrl', function ($scope, floorplanService, Rooms,
    heatmapService, $modal, $interval, $state) {

    var floorNum = Number($state.params.floorNum);

    if (!floorNum) {
      $state.go('heat-map', {floorNum: 1}, {notify: false});
      floorNum = 1;
    }

    $scope.sensorData = Rooms.dict;
    $scope.rooms = Rooms;
    $scope.searchString = '';
    $scope.highlightedRoom = null;
    $scope.roomValueType = 'Temperature';
    $scope.floors = floorplanService.floors.length;
    $scope.selectedRoom = null;
    $scope.room = null;   //Room in which panoramic button was clicked.
    $scope.timeFrame = 'Latest';
    $scope.resetView = null;
    $scope.planNumber = floorNum - 1;
    $scope.svgSupport = Modernizr.svg;

    //Select current floorplan
    floorplanService.floors[$scope.planNumber].isSelected = true;
    $scope.selectedPlan = floorplanService.floors[$scope.planNumber];

    $scope.sensorTypes = [
      { name: 'Temperature',
        icon: 'images/temperature.svg' },

      { name: 'CO2',
        icon: 'images/co2.svg' },

      { name: 'Humidity',
        icon: 'images/humidity.svg' },

      { name: 'Light',
        icon: 'images/light.svg' },

      { name: 'Occupancy',
        icon: 'images/pir.svg' }
    ];

    var day, week, month, year;
    day = week = month = year = new Date();

    day.setDate(day.getDate() - 1);
    week.setDate(week.getDate() - 7);
    month.setMonth(month.getMonth() - 1);
    year.setYear(year.getYear() - 1);

    $scope.timeFrames = [
      { text: 'Current',
        icon: 'images/latest.svg',
        params: {}, },

      { text: 'Last Week',
        icon: 'images/week.svg',
        params: { begin: week.toISOString() } },

      { text: 'Last Month',
        icon: 'images/month.svg',
        params: { begin: month.toISOString() } },

      { text: 'Last Year',
        icon: 'images/year.svg',
        params: { begin: year.toISOString() } },

      { text: 'Select range',
        icon: 'images/time-range.svg',
        params: { begin: null, end: null } }
    ];

    $scope.timeFrame = $scope.timeFrames[0];

    $scope.$on('sensordata-update', function(_, data) {
      $scope.sensorData = data.dict;
    });

    $scope.panoramaViewer = function() {
      $state.go('panorama', {roomId: $scope.room.split(' ').join('-')});
    };

    $scope.showGradient = function() {
      return $scope.roomValueType.toLowerCase() !== 'pir' &&
             $scope.roomValueType.toLowerCase() !== 'occupancy';
    };

    /*
     * Toggle fullscreen button. It broadcasts to parent scope to change the view
     * to fullscreen which in turn hides the footer and header. Also it changes
     * the fullscreen button glyphicon.
     */
    $scope.toggleFullscreen = function(){
      $scope.App.fullscreen = !$scope.App.fullscreen;
    };

    /*
     * Change current floorplan to the previous of net floorplan
     * direction is either 1 if the user pressed next button or -1
     * if the user pressed previous button
     */
    $scope.selectPlan = function (direction) {
      if (direction === 1) {
        //floorNum indexing starts from 1 while planNumber starts from 0
        //so we must add 2 to the planNumber to increase floorNum by 1
        $state.go('heat-map', {floorNum: $scope.planNumber + 2});
      }
      if (direction === -1) {
        $state.go('heat-map', {floorNum: $scope.planNumber});
      }
    };


    $scope.highlightRoom = function(item) {
      if ($scope.highlightedRoom) {
        $interval.cancel($scope.highlightedRoom.pulse);
      }
      if (typeof item.floor === 'number' && !isNaN(item.floor)) {
        $scope.highlightedRoom = item;
        $scope.planNumber = item.floor;
        $state.go('heat-map', {floorNum: $scope.planNumber});
      }
    };

    $scope.onSelect = function(item) {
      $scope.highlightRoom(item);
    };

    $scope.onSearch = function(searchString) {
      //If the room is once selected from the dropdown(typeahead), the
      //searchString will actually be the room object.
      if (searchString.name) {
        $scope.highlightRoom(searchString);
      } else {
        var selected;
        var keys = Object.keys(Rooms.dict);
        for (var i = 0; i < keys.length; i++) {
          var room = Rooms.dict[keys[i]];

          if (room.name.toLowerCase() === searchString.toLowerCase()) {
            selected = room;
            break;
          }
        }
        if (selected) {
          $scope.highlightRoom(selected);
        }
      }
    };

    $scope.resetZoom = function() {
      if ($scope.resetView === null) {
        $scope.resetView = false;
      }
      $scope.resetView = !$scope.resetView;
    };

    /*
    / Refresh the room colours according to sensor that is chosen.
    / For example if the user changes from temperature heatmap to co2 heatmap
    / this function will colour the floorplanService according to values measured by
    / co2 sensors.
    */
    $scope.refreshRoomColor = function(type) {
      var keys = Object.keys(Rooms.dict);
      for (var i = 0; i < keys.length; i++) {
        var room = Rooms.dict[keys[i]];
        //Colour the room white, in case the room doesn't have any values for
        //that particular sensor.
        d3.select(room.node).style('fill', 'rgb(255, 255, 255)');

        //Loop through sensors and check the value of the sensor that matches
        //the parameter given.
        for (var j = 0; j < room.sensors.length; j++) {
          var sensor = room.sensors[j];

          if (sensor.type.toLowerCase() === type.toLowerCase() ||
             (sensor.type.toLowerCase() === 'pir' && type.toLowerCase() === 'occupancy')) {
            var color = heatmapService.getColor(sensor.type, sensor.values[0].value);
            d3.select(room.node)
              .style('fill', color.rgb)
              .style('fill-opacity', color.opacity);
          }
        }
      }
    };

    $scope.changeColour = function(type) {
      $scope.roomValueType = type;
      $scope.refreshRoomColor(type);
    };

    $scope.selectTimeFrame = function(timeFrame) {

      $scope.timeFrame = timeFrame;

    };

     /*Create a new modal pass timeframe and roomValueType variables into it
        Also parse the return values to aforementioned variables*/
    $scope.open = function () {

      var modalInstance = $modal.open({
        templateUrl: 'sensor-options.html',
        controller: 'ModalCtrl',
        controllerAs: 'modal',
        resolve: {
          params: function () {
            return {
              sensorTypes: $scope.sensorTypes,
              timeFrames: $scope.timeFrames
            };
          }
        }
      });

      modalInstance.result.then(function () {
        if (arguments[0][1] !== $scope.timeFrame) {
          $scope.timeFrame = arguments[0][1];
          $scope.roomValueType = arguments[0][0];
          $scope.selectTimeFrame($scope.timeFrame);
        }
        else if (arguments[0][0] !== $scope.roomValueType) {
          $scope.roomValueType = arguments[0][0];
          $scope.refreshRoomColor($scope.roomValueType);
        }
      });
    };

});
