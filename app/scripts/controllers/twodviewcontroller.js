'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:twoDViewCtrl
 * @description
 * # twoDViewCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('twodview', function ($scope, Datahandler, Floorplans, Rooms) {

    $scope.floorplans = Floorplans;
    $scope.rooms = Rooms;
    $scope.sensorData = null;
    $scope.selectedPlan = $scope.floorplans[0];

    Datahandler.fetchData().then(
      function (data) {
        $scope.sensorData = data;
        updateRoomInfo(data);
      },
      function (error) {
        console.log('Error: Failed to fetch sensor data');
      }
    )
  
    function updateRoomInfo(data) {
      var i, j;
      
      iterateRooms:
      for (i = 0; i < data.length; i++) {
        var roomName = data[i].room.split(' ')[0];
        
        for (j = 0; j < $scope.rooms.length; j++) {
          
          if (roomName === $scope.rooms[j].name) {
            $scope.rooms[j].sensors.push({
              id: data[i].sensorId,
              type: data[i].type,
              value: data[i].value
            });
            
            continue iterateRooms;
          }
        }
        
        $scope.rooms.push({
          name: roomName,
          node: null,
          sensors: [{
            id: data[i].sensorId,
            type: data[i].type,
            value: data[i].value
          }],
        });
      }
    }
  
  });