'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:HeatMapCtrl
 * @description
 * Controls Heat Map view.
 */
angular.module('otaniemi3dApp')
  .controller('HeatMapCtrl', function ($scope, floorplanStorage,
    $modal, $state) {

    this.floor = Number($state.params.floorNum);

    if (!this.floor) {
      $state.go('heat-map', {floorNum: 1}, {notify: false});
      this.floor = 1;
    }

    this.searchString = '';
    this.floorplans = floorplanStorage.list;
    this.room = {};
    this.svgSupport = Modernizr.svg;
    this.isFloorplanLoaded = false;
    this.floorplan = this.floorplans[this.floor-1];

    this.sensorTypes = [
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

    this.timeFrames = [
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

    this.sensorType = this.sensorTypes[0];
    this.timeFrame = this.timeFrames[0];

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
    this.selectSensorType = (sensor) => {
      this.sensorType = sensor;
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
    this.selectTimeFrame = (timeFrame) => {
      if (timeFrame.text === 'Select range') {
        this.modalInstance = $modal.open({
          templateUrl: 'templates/select-range.html',
          controller: 'ModalCtrl',
          controllerAs: 'modal',
          resolve: {
            params() {
              return {
                timeRange: {begin: null, end: null}
              };
            }
          }
        });

        this.modalInstance.result.then((params) => {
          var time = params.timeRange;

          if (time.begin && time.end) {
            timeFrame.params.begin = time.begin.toISOString();
            timeFrame.params.end = time.end.toISOString();
            this.timeFrame = timeFrame;
          }
        });
      } else {
        this.timeFrame = timeFrame;
      }
    };

    this.toggleFullscreen = () => {
      $scope.App.fullscreen = !$scope.App.fullscreen;
    };

    this.nextFloor = () => {
      $state.go('heat-map', {floorNum: this.floor + 1});
    };

    this.prevFloor = () => {
      $state.go('heat-map', {floorNum: this.floor - 1});
    };

    this.selectRoom = (room) => {
      this.room = room;
      $scope.$broadcast('room-selected', room);
    };

    this.searchRoom = (searchString) => {
      var rooms = this.floorplan.rooms;
      var roomString;

      if (searchString.name) {
        roomString = searchString.name;
      } else {
        roomString = searchString;
      }

      for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].name.toLowerCase() === roomString.toLowerCase()) {
          return this.selectRoom(rooms[i]);
        }
      }

      this.selectRoom({});
    };

    this.resetZoom = () => {
      $scope.$broadcast('reset-zoom');
    };

    this.mobileModal = () => {
      this.modalInstance = $modal.open({
        templateUrl: 'templates/sensor-options.html',
        controller: 'ModalCtrl',
        controllerAs: 'modal',
        resolve: {
          params() {
            return {
              sensorTypes: this.sensorTypes,
              sensorType: this.sensorType,
              timeFrames: this.timeFrames,
              timeFrame: this.timeFrame,
              timeRange: {begin: null, end: null}
            };
          }
        }
      });

      this.modalInstance.result.then((params) => {
        var time = params.timeRange;

        if (time.begin && time.end) {
          var length = this.timeFrames.length;
          var timeFrame = this.timeFrames[length-1];
          timeFrame.params.begin = time.begin.toISOString();
          timeFrame.params.end = time.end.toISOString();
          this.timeFrame = timeFrame;
        } else {
          this.timeFrame = params.timeFrame;
        }
        this.sensorType = params.sensorType;
      });
    };

    $scope.$on('floorplan-loaded', () => {
      this.isFloorplanLoaded = true;
    });

    $scope.$on('$destroy', () => {
      if (this.modalInstance) {
        this.modalInstance.dismiss();
      }
    });

});
