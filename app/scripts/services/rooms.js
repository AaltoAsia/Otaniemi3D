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
    this.add = function(name, node) {
      this.list.push({
        name: name,
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

    this.initRoomList = function(data){
          if(!data) {
            return;
          }
          var i, j;
          var exists = false;
          if(this.list.length === 0){
            for (i = 0; i < data.length; i++) {
              var roomName = data[i].room.split(' ')[0];
              for(j=0; j<this.list.length; j++){
                if(roomName === this.list[j].name){
                  exists = true;
                }
              }
              if(!exists){
                this.add(roomName, null);
                exists = false;
              }
            }
          }
          this.updateRoomInfo(data);
        };


    this.updateRoomInfo = function(data) {
          if(!data) {
            return;
          }

          var i, j;
          var sensorUpdated = false;

          for (i = 0; i < data.length; i++) {
            var roomName = data[i].room.split(' ')[0];

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
        };  //end updateRoomInfo

    this.findRoom = function(roomName) {
        var roomHTML = null;
        var room = null
        for(var i = 0; i < this.list.length; i++) {
          if(this.list[i].name===roomName){
            room = this.list[i];
          }
        }
          if(room !== null){
            roomHTML = '[p]Room:' + room.name + '[/p]';
            var paragraph = null;
            for (var i = 0; i < room.sensors.length; i++) {
                switch (room.sensors[i].type) {
                    case 'temperature':
                         paragraph = '[p]' + room.sensors[i].type + ': ' + room.sensors[i].value + ' °C' + '[/p]';
                         roomHTML += paragraph;
                        break;
                    case 'humidity':
                        paragraph = '[p]' + room.sensors[i].type + ': ' + room.sensors[i].value + ' %' + '[/p]';
                        roomHTML += paragraph;
                        break;
                    case 'co2':
                        paragraph = '[p]' + room.sensors[i].type + ': ' + room.sensors[i].value + ' ppm' + '[/p]';
                        roomHTML += paragraph;
                        break;
                    case 'pir':
                        var occupancyState;
                        if (room.sensors[i].value > 0) {occupancyState = 'yes';} else {occupancyState = 'no';}
                        paragraph = '[p]' + 'occupied' + ': ' + occupancyState + '[/p]';
                        roomHTML += paragraph;
                        break;
                    case 'light':
                        paragraph = '[p]' + room.sensors[i].type + ': ' + room.sensors[i].value + ' lux' +'[/p]';
                        roomHTML += paragraph;
                        break;
                }
            }
        return roomHTML;
    }
    return null;
    };
  
  });
