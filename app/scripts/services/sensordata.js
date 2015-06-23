'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.SensorData
 * @description
 * # SensorData
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('SensorData', function ($http, $q) {

    this.get = function () {
      var deferred = $q.defer();
      //var url = 'http://otaniemi3d.cs.hut.fi/omi/node/';
      //time = timeFrame || '';

      $http.get('odf-requests/sample-response.xml')
        .success(function (xml) {
          deferred.resolve(parseData(xml));
        });

      /*
      $http.get('odf-requests/data-all.xml')
        .success(function (xml) {

          $http.post(url, xml, {headers: {'Content-Type': 'application/xml'}})
            .success(function (data) {
              deferred.resolve(XmlParser.parse(data));
            })
            .error(function (data, status, headers, config) {
              console.log('Failed to fetch sensor data.');
              console.log('Response:');
              console.log(data);
              console.log('Status: ' + status);
              console.log('Headers:');
              console.log(headers());
              console.log('Config:');
              console.log(config);
            });
        });
      */
      return deferred.promise;
    };


    /*
     * Convert the sensor data xml to a javascript object and return it.
     */
    function parseData(xml) {
      xml = $.parseXML(xml);
      var objects = $(xml).find('Objects')[0];
      var sensorData = {};

      if (objects) {
        //Pass data storage variable (sensorData) to the function.
        traverse(objects, sensorData);
      } else {
        console.log('Couldn\'t fetch any sensor data from the server.');
      }

      return sensorData;
    }


    /*
     * Traverse recursively through the xml elements and transform them
     * into javascript objects.
     */
    function traverse(object, sensorData) {
      var id = $(object).children('id').text();

      if (id) {
        var sensors = [];

        $(object).children('InfoItem').each(function() {
          var sensor = $(this).attr('name');
          var value = $(this).children('value');

          if (sensor && value) {
            sensors.push(
              {
                'id': 'room_' + id + '_' + sensor,
                'type': sensor,
                'value': value
              }
            );
          }
        });

        if (sensors.length > 0) {
          var roomId = 'room_' + id;

          sensorData[roomId] = {
            'name': id,
            'sensors': sensors
          };
        }
      }

      if (object.hasChildNodes()) {
        var node = object.firstChild;

        while (node) {
          traverse(node, sensorData);
          node = node.nextSibling;
        }
      }
    }
  });
