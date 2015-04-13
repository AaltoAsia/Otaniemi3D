'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.Room
 * @description
 * # Room
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('Rooms', function () {
  
    /*
    * Array where room objects are stored
    */
    this.list = [];
  
    /*
    * Add new room object to the list
    */
    this.add = function(name, node, floor) {
      this.list.push({
        name: name,
        floor: floor,
        node: node,
        sensors: [],
        pulse: null
      });
    };
  
    /*
    * Construct and return new sensor object.
    */
    this.sensor = function(sensorId, type, value) {
      return {
        id: sensorId,
        type: type,
        value: value
      };
    };
  
    /*
    * Add new sensor object to a room object
    */
    this.addSensor = function(roomIndex, sensor) {
      this.list[roomIndex].sensors.push(sensor);
    };
    
    /*
    * Update sensor's value. If sensor doesn't exist add sensor as a new sensor.
    */
    this.updateSensor = function(roomIndex, sensorId, type, value) {
      var sensor = this.sensor(sensorId, type, value);
      var sensorExists = false;
      
      for (var i = 0; i < this.list[roomIndex].sensors.length; i++) {
        if (this.list[roomIndex].sensors[i].id === sensor.id && this.list[roomIndex].sensors[i].type === sensor.type) {
          this.list[roomIndex].sensors[i].value = sensor.value;
          sensorExists = true;
        }
      }
      
      if (!sensorExists) {
        this.addSensor(roomIndex, sensor);
      }
      
    };
    /*
     * Initialize rooms list without svg roomAreas. 
     * Do not use this function for 2dview since it needs those svg paths.
    */ 
    this.initRoomList = function(data){
          if(!data) {
            return;
          }
          var i, j, roomName;
          var exists = false;
          if(this.list.length === 0){
            for (i = 0; i < data.length; i++) {
              exists = false;
              roomName = data[i].room;
              for(j=0; j<this.list.length; j++){
                if(roomName === this.list[j].name){
                  exists = true;
                }
              }
              if(!exists){
                this.add(roomName, null, null);
                exists = false;
              }
            }
          }
          this.updateRoomInfo(data);  //after initializing get actual data for the rooms.list.
        };

    /*
     * Go through the data and update rooms sensor information.
     */
    this.updateRoomInfo = function(data) {
          if(!data) {
            return;
          }

          var i, j;
          var sensorUpdated = false;

          for (i = 0; i < data.length; i++) {
            var roomName = data[i].room;

            for (j = 0; j < this.list.length; j++) {
              if (roomName === this.list[j].name) {
                var k;
                //Check if sensor already exists
                for (k = 0; k < this.list[j].sensors.length; k++) {
                  if (this.list[j].sensors[k].id === data[i].sensorId && this.list[j].sensors[k].type === data[i].type) {
                    this.list[j].sensors[k].value = data[i].value;
                    sensorUpdated = true;
                  }
                }

                //If sensor doesn't yet exist, add it
                if (!sensorUpdated) {
                  this.list[j].sensors.push({
                    id: data[i].sensorId,
                    type: data[i].type,
                    value: data[i].value
                  });
                } else {
                //Reset updated flag
                  sensorUpdated = false;
                }


                break;
              }
            }
          }
        };  

    /*
    * Find spesific room from room.list and return its information to the new list
    */
    this.findRoom = function(roomName) {
        var room = null;
        for(var j = 0; j < this.list.length; j++) {
          if(this.list[j].name===roomName){
            room = this.list[j];
          }
        }
          if(room !== null){
            var roomInfo = [];
            var roomData = 'Room: ' + room.name;
            roomInfo.push(roomData);
            for (var i = 0; i < room.sensors.length; i++) {
                switch (room.sensors[i].type) {
                    case 'temperature':
                         roomData = room.sensors[i].type + ': ' + room.sensors[i].value + ' °C' ;
                         roomInfo.push(roomData);
                        break;
                    case 'humidity':
                        roomData = room.sensors[i].type + ': ' + room.sensors[i].value + ' %';
                        roomInfo.push(roomData);
                        break;
                    case 'co2':
                        roomData = room.sensors[i].type + ': ' + room.sensors[i].value + ' ppm';
                        roomInfo.push(roomData);
                        break;
                    case 'pir':
                        var occupancyState;
                        if (room.sensors[i].value > 0) {occupancyState = 'yes';} else {occupancyState = 'no';}
                        roomData = 'occupied' + ': ' + occupancyState ;
                        roomInfo.push(roomData);
                        break;
                    case 'light':
                        roomData = room.sensors[i].type + ': ' + room.sensors[i].value + ' lux';
                        roomInfo.push(roomData);
                        break;
                }
            }
        return roomInfo;
    }
    return null;
    };

    /*
    * Find room for panorama-tooltip and return information with []-tags(krpano recognize these tags as HTML-tags)
    */
    this.krpanoHTML = function(roomName){
      var roomInfo = this.findRoom(roomName);
      var roomHTML = '';
      var paragraph = null;
      if(roomInfo !== null){
        for(var i =0 ; i < roomInfo.length; i++){
          paragraph = '[p]' + roomInfo[i] + '[/p]';
          roomHTML += paragraph;
        }
      }
      return roomHTML;
    };



  });
