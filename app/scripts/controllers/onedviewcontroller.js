'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:OneDViewCtrl
 * @description
 * # oneDViewCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')

  .controller('onedview', function ($scope, $location, Rooms, uiGridConstants) {

    $scope.timeFrame = 'Latest';

    function selectTimeFrame(timeFrame) {
      var time = timeFrame;
      
      if (time) {
        $scope.timeFrame = time;
      } else {
        $scope.timeFrame = 'Latest';
      }
    }

    $scope.gridOptions = {
      enableFiltering: true,
      enableGridMenu: true,
      gridMenuShowHideColumns: false,
      gridMenuCustomItems: [
        {
          title: 'Latest',
          action: function() {
            selectTimeFrame('Latest');
          },
          active: function () {
            return $scope.timeFrame === 'Latest';
          }
        },
        {
          title: 'Day',
          action: function() {
            selectTimeFrame('Day');
          },
          active: function () {
            return $scope.timeFrame === 'Day';
          }
        },
        {
          title: 'Week',
          action: function() {
            selectTimeFrame('Week');
          },
          active: function () {
            return $scope.timeFrame === 'Week';
          }
        },
        {
          title: 'Month',
          action: function() {
            selectTimeFrame('Month');
          },
          active: function () {
            return $scope.timeFrame === 'Month';
          }
        },
        {
          title: 'Year',
          action: function() {
            selectTimeFrame('Year');
          },
          active: function () {
            return $scope.timeFrame === 'Year';
          }
        }
      ]
      /*,
      columnDefs: [
        {
          field: 'room',
          filters: [
            {
              condition:  function(searchTerm, cellValue) {
                var strippedValue = cellValue.toLowerCase();
                return strippedValue.indexOf(searchTerm.toLowerCase()) >= 0;
              },
              placeholder: 'room name'
            }
          ]
        },
        {
          field: 'type',
          filters: [
            {
              condition:  function(searchTerm, cellValue) {
                var strippedValue = cellValue.toLowerCase();
                return strippedValue.indexOf(searchTerm.toLowerCase()) >= 0;
              },
              placeholder: 'sensor type'
            }
          ]
        },
        {
          field: 'value',
          filters: [
            {
              condition: uiGridConstants.filter.GREATER_THAN,
              placeholder: 'greater than'
            },
            {
              condition: uiGridConstants.filter.LESS_THAN,
              placeholder: 'less than'
            }
          ]
        }
      ]
      */
    };

    Rooms.updateRoomInfo().then(function () {
      var sensorList = [];

      for (var room in Rooms.dict) {
        if (Rooms.dict.hasOwnProperty(room)) {
          var sensors = Rooms.dict[room].sensors;

          for (var i = 0; i < sensors.length; i++) {
            var sensor = sensors[i];
            sensor.room = Rooms.dict[room].name;
            sensor.roomId = room;

            sensorList.push(sensor);
          }
        }
      }

      $scope.gridOptions.data = sensorList;
    });

  });