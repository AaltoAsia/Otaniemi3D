'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.Rooms
 * @description
 * # Rooms
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('Rooms', function ($rootScope, $q, apiService) {

    //Can be used inside this service to reference this service's public
    //properties and functions (e.g. self.dict).
    var self = this;

    /*
     * A dictionary object where all room objects are stored.
     */
    this.dict = {};

    /*
     * A JSON representation of the dictionary object.
     */
    this.json = '';

    /*
     * List of all sensors.
     */
    this.sensorList = [];

    /*
     * Return room dictionary as a list.
     */
    this.asList = function() {
      var roomList = [];

      var keys = Object.keys(self.dict);
      for (var i = 0; i < keys.length; i++) {
        var room = self.dict[keys[i]];
        room.id = keys[i];
        roomList.push(room);
      }

      return roomList;
    };

    this.valueSuffix = function (sensorType) {
      var suffix;

      switch (sensorType.toLowerCase()) {
        case 'temperature':
          suffix = '°C';
          break;
        case 'co2':
          suffix = 'ppm';
          break;
        case 'light':
          suffix = 'lux';
          break;
        case 'humidity':
          suffix = '%';
          break;
        case 'pir':
          suffix = '';
          break;
        default:
          suffix = '';
      }

      return suffix;
    };

    this.get = function (request, params) {
      var deferred = $q.defer();

      SensorData.get(request, params, 'sensordata-historical')
        .then(function success (data) {
          deferred.resolve(data);
        }, function error (reason) {
          deferred.reject(reason);
        });

      return deferred.promise;
    };

    /*
     * Add new room object to the list
     */
    this.add = function(id, name, node, floor) {
      self.dict[id] = {
        name: name,
        floor: floor,
        node: node,
        sensors: [],
        pulse: null
      };
    };

    /*
     * Watch for new sensor data sent by SensorData service.
     */
    $rootScope.$on('sensordata-new_', function(_, data) {
      self.sensorList = [];
      var keys = Object.keys(data);
      for (var i = 0; i < keys.length; i++) {
        var room = self.dict[keys[i]];
        if (room) {
          //Update only sensor info if room already exists. This way
          //the svg nodes stored in room objects won't reset.
          room.sensors = data[keys[i]].sensors;
        } else {
          //Room doesn't yet exist in the dictionary.
          self.dict[keys[i]] = data[keys[i]];
        }
        //Push sensors to self.sensorList
        for (var j = 0; j < data[keys[i]].sensors.length; j++) {
          self.sensorList.push(data[keys[i]].sensors[j]);
        }
      }

      //self.json = JSON.stringify(self.dict);

      $rootScope.$broadcast('sensordata-update',
        {dict: self.dict, list: self.sensorList});
    });

  });
