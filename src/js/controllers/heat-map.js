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

    $scope.floor = Number($state.params.floor);
    $scope.currentBuilding = buildingData.currentBuilding;
    $scope.App.statistics = true;

    var floorExists = false;
    for (var i = 0; i < $scope.currentBuilding.floorplans.length; i++) {
      var floorplan = $scope.currentBuilding.floorplans[i];

      if (floorplan.floor === $scope.floor) {
        floorExists = true;
        break;
      }
    }

    if (!floorExists) {
      $state.go('not-found');
      $scope.floor = 1;
      return;
    }

    $scope.room = {};

    if ($state.params.room) {
      $scope.App.room = findRoom($state.params.room);
      selectRoom($scope.App.room);
    }

    $scope.searchString = '';
    $scope.floorplans = $scope.currentBuilding.floorplans;
    $scope.svgSupport = Modernizr.svg;
    self.isFloorplanLoaded = false;
    $scope.floorplan = $scope.floorplans[$scope.floor-1];

    $scope.sensorTypes = [
      { text: 'Temperature',
        name: 'temperature',
        icon: 'assets/shared/images/temperature.svg' },

      { text: 'CO2',
        name: 'co2',
        icon: 'assets/shared/images/co2.svg' },

      { text: 'Humidity',
        name: 'humidity',
        icon: 'assets/shared/images/humidity.svg' },

      { text: 'Light',
        name: 'light',
        icon: 'assets/shared/images/light.svg' },

      { text: 'Occupancy',
        name: 'pir',
        icon: 'assets/shared/images/pir.svg' }
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
        icon: 'assets/shared/images/latest.svg',
        params: {}, },

      { text: 'Last Week',
        icon: 'assets/shared/images/week.svg',
        params: { begin: week.toISOString() } },

      { text: 'Last Month',
        icon: 'assets/shared/images/month.svg',
        params: { begin: month.toISOString() } },

      { text: 'Last Year',
        icon: 'assets/shared/images/year.svg',
        params: { begin: year.toISOString() } },

      { text: 'Select range',
        icon: 'assets/shared/images/time-range.svg',
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
          templateUrl: 'html/templates/select-range.html',
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
            $scope.App.timeFrame = $scope.timeFrame = timeFrame;
          }
        });
      } else {
        $scope.App.timeFrame = $scope.timeFrame = timeFrame;
      }
    };

    $scope.toggleFullscreen = function (){
      $scope.App.fullscreen = !$scope.App.fullscreen;
    };

    $scope.nextFloor = function () {
      $state.go('heat-map', {floor: $scope.floor + 1});
    };

    $scope.prevFloor = function () {
      $state.go('heat-map', {floor: $scope.floor - 1});
    };

    $scope.App.showOptions = function () {
      $scope.App.sensorTypes = $scope.sensorTypes;
      $scope.App.sensorType = $scope.sensorType;
      $scope.App.timeFrames = $scope.timeFrames;
      $scope.App.timeFrame = $scope.timeFrame;

      //TODO: Reduce duplication by removing sensorType and timeFrame
      //from either this controller or App controller
      $scope.App.selectOptions = function (sensor, time) {
        $scope.sensorType = $scope.App.sensorType = sensor;

        $scope.selectTimeFrame(time);
      };
    };

    function selectRoom (room) {
      $scope.room = room;
    }

    function findRoom (roomId) {
      var rooms = buildingData.currentBuilding.rooms;
      for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].id === roomId) {
          return rooms[i];
        }
      }
    }

    $scope.mobileModal = function () {
      self.modalInstance = $modal.open({
        templateUrl: 'html/templates/sensor-options.html',
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

    $scope.$on('room-selection-change', function (event, room) {
      if (room) {
        $state.go('heat-map',
          {
            building: $scope.App.building.id,
            floor: room.floor,
            room: room.id
          }
        );
      } else {
        $state.go('heat-map',
          {
            building: $scope.App.building.id,
            floor: $scope.floor,
            room: null
          }, {location: 'replace', notify: false}
        );
      }
    });

    $scope.$on('floorplan-loaded', function () {
      self.isFloorplanLoaded = true;
    });

    $scope.$on('$destroy', function () {
      if (self.modalInstance) {
        self.modalInstance.dismiss();
      }
      $scope.App.statistics = false;
    });

});
