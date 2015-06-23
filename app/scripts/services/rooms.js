'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.Room
 * @description
 * # Room
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('Rooms', function (SensorData) {
  
    /*
    * Dictionary object where all room objects are stored.
    */
    this.dict = {};

    /*
    * Return room dictionary as a list.
    */
    this.asList = function() {
      var roomList = [];

      for (var room in this.dict) {
        if (this.dict.hasOwnProperty(room)) {
          roomList.push(room);
        }
      }

      return roomList;
    };
  
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
    * Add new sensor object to a room object.
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
     * Initialize rooms list without svg roomAreas. (Called from
     * threedviewcontroller). This function shouldn't be called from 2dview
     * since it needs those svg paths.
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
     * Fetch new sensor data from the server and update every room's
     * sensor information.
     */
    this.updateRoomInfo = function() {
      SensorData.get().then(function (data) {
        for (var room in data) {
          if (data.hasOwnProperty(room)) {
            if (this.dict.room) {
              this.dict.room.sensors = data.room.sensors;
            } else {
              //Room doesn't yet exist in the dictionary.
              this.dict.room = data.room;
            }
          }
        }
      });
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
        var roomType, roomValue;
        for (var i = 0; i < room.sensors.length; i++) {
          switch (room.sensors[i].type) {
            case 'temperature':
              roomType = room.sensors[i].type;
              roomValue = room.sensors[i].value + ' °C' ;
              roomInfo.push({type:roomType, value:roomValue});
              break;
            case 'humidity':
              roomType = room.sensors[i].type;
              roomValue = room.sensors[i].value + ' %' ;
              roomInfo.push({type:roomType, value:roomValue});
              break;
            case 'co2':
              roomType = room.sensors[i].type;
              roomValue = room.sensors[i].value + ' ppm' ;
              roomInfo.push({type:roomType, value:roomValue});
              break;
            case 'pir':
              var occupancyState;
              if (room.sensors[i].value > 0) {occupancyState = 'yes';} else {occupancyState = 'no';}
              roomType = 'occupied';
              roomValue = occupancyState;
              roomInfo.push({type:roomType, value:roomValue});
              break;
            case 'light':
              roomType = room.sensors[i].type;
              roomValue = room.sensors[i].value + ' lux' ;
              roomInfo.push({type:roomType, value:roomValue});
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
      var tableInfo = null;
      roomHTML = '[table class= "tooltip-table"]';
      roomHTML += '[tr] [th]Room[/th] [td]' +  roomName + '[/td] [/tr]';
        if(roomInfo !== null){
          for(var i =0 ; i < roomInfo.length; i++){
            tableInfo = '[tr]';
            tableInfo += '[th]' + roomInfo[i].type+ '[/th]' + '[td]' + roomInfo[i].value + '[/td]';
            tableInfo += '[/tr]';
            roomHTML += tableInfo;
          }
        }
        roomHTML += '[/table]';
      return roomHTML;
    };



  });
