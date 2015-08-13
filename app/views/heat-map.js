'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:HeatMapCtrl
 * @description
 * Controls Heat Map view.
 */
angular.module('otaniemi3dApp')
  .controller('HeatMapCtrl', function ($scope, buildingData,
    $modal, $state) {

    var self = this;

    $scope.floor = Number($state.params.floorNum);

    if (!$scope.floor) {
      $state.go('heat-map', {floorNum: 1}, {notify: false});
      $scope.floor = 1;
    }

    $scope.searchString = '';
    $scope.floorplans = buildingData.floorplans;
    $scope.room = {};
    $scope.svgSupport = Modernizr.svg;
    self.isFloorplanLoaded = false;
    $scope.floorplan = $scope.floorplans[$scope.floor-1];

    $scope.sensorTypes = [
      { text: 'Temperature',
        name: 'temperature',
        icon: 'images/temperature.svg' },

      { text: 'CO2',
        name: 'co2',
        icon: 'images/co2.svg' },

      { text: 'Humidity',
        name: 'humidity',
        icon: 'images/humidity.svg' },

      { text: 'Light',
        name: 'light',
        icon: 'images/light.svg' },

      { text: 'Occupancy',
        name: 'pir',
        icon: 'images/pir.svg' }
    ];

    var day = new Date(),
        week = new Date(),
        month = new Date(),
        year = new Date();

    day.setDate(day.getDate() - 1);
    week.setDate(week.getDate() - 7);
    month.setMonth(month.getMonth() - 1);
    year.setFullYear(year.getFullYear() - 1);

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
        //icon: 'images/time-range.svg',
        params: { begin: null, end: null } }
    ];

    $scope.sensorType = $scope.sensorTypes[0];
    $scope.timeFrame = $scope.timeFrames[0];

    /**
    * @ngdoc function
    * @name selectSensorType
    * @methodOf otaniemi3dApp.controller:HeatMapCtrl
    * @description
    * Select current sensor type. Heat map is then colored by that
    * sensor's values.
    *
    * @param {Object} sensor Sensor object with following properties:
    *   - ** text ** - `{string}` - Text that is displayed on sensor selector.
    *   - ** name ** - `{string}` - Sensor's name.
    *   - ** icon ** - `{string}` - Url to sensor's icon.
    */
    $scope.selectSensorType = function (sensor) {
      $scope.sensorType = sensor;
    };

    /**
    * @ngdoc function
    * @name selectTimeFrame
    * @methodOf otaniemi3dApp.controller:HeatMapCtrl
    * @description
    * Display average sensor values in that time frame.
    *
    * @param {Object} timeFrame Time frame object with following properties:
    *   - ** text ** - `{string}` - Text that is displayed on time frame selector.
    *   - ** params ** - `{Object}` - Object with properties:
    *     - `begin` - `{string}` [optional] - Begin date as an ISO string.
    *     - `end` - `{string}` [optional] - End date as an ISO string.
    *   - ** icon ** - `{string}` - Url to time frame's icon.
    */
    $scope.selectTimeFrame = function (timeFrame) {
      if (timeFrame.text === 'Select range') {
        $scope.modalInstance = $modal.open({
          templateUrl: 'templates/select-range.html',
          controller: 'ModalCtrl',
          controllerAs: 'modal',
          resolve: {
            params: function () {
              return {
                timeRange: {begin: null, end: null}
              };
            }
          }
        });

        $scope.modalInstance.result.then(function (params) {
          var time = params.timeRange;

          if (time.begin && time.end) {
            timeFrame.params.begin = time.begin.toISOString();
            timeFrame.params.end = time.end.toISOString();
            $scope.timeFrame = timeFrame;
          }
        });
      } else {
        $scope.timeFrame = timeFrame;
      }
    };

    $scope.toggleFullscreen = function (){
      $scope.App.fullscreen = !$scope.App.fullscreen;
    };

    $scope.nextFloor = function () {
      $state.go('heat-map', {floorNum: $scope.floor + 1});
    };

    $scope.prevFloor = function () {
      $state.go('heat-map', {floorNum: $scope.floor - 1});
    };

    $scope.selectRoom = function(room) {
      $scope.room = room;
      $scope.$broadcast('room-selected', room);
    };

    $scope.searchRoom = function(searchString) {
      var rooms = $scope.floorplan.rooms;
      var roomString;

      if (searchString.name) {
        roomString = searchString.name;
      } else {
        roomString = searchString;
      }

      for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].name.toLowerCase() === roomString.toLowerCase()) {
          return $scope.selectRoom(rooms[i]);
        }
      }

      $scope.selectRoom({});
    };

    $scope.resetZoom = function () {
      $scope.$broadcast('reset-zoom');
    };

    $scope.mobileModal = function () {
      self.modalInstance = $modal.open({
        templateUrl: 'templates/sensor-options.html',
        controller: 'ModalCtrl',
        controllerAs: 'modal',
        resolve: {
          params: function () {
            return {
              sensorTypes: $scope.sensorTypes,
              sensorType: $scope.sensorType,
              timeFrames: $scope.timeFrames,
              timeFrame: $scope.timeFrame,
              timeRange: {begin: null, end: null}
            };
          }
        }
      });

      self.modalInstance.result.then(function (params) {
        var time = params.timeRange;

        if (time.begin && time.end) {
          var length = $scope.timeFrames.length;
          var timeFrame = $scope.timeFrames[length-1];
          timeFrame.params.begin = time.begin.toISOString();
          timeFrame.params.end = time.end.toISOString();
          $scope.timeFrame = timeFrame;
        } else {
          $scope.timeFrame = params.timeFrame;
        }
        $scope.sensorType = params.sensorType;
      });
    };

    $scope.$on('floorplan-loaded', function () {
      self.isFloorplanLoaded = true;
    });

    $scope.$on('$destroy', function () {
      if (self.modalInstance) {
        self.modalInstance.dismiss();
      }
    });

});
