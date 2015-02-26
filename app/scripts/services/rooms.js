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
        node: node,
        floor: floor,
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
  
  });
