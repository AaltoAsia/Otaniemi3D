'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.SensorData
 * @description
 * # SensorData
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('SensorData', function ($http, $q, $rootScope) {

    this.get = function () {
      var deferred = $q.defer();
      var url = 'http://otaniemi3d.cs.hut.fi/omi/node/';
      var debug = false;   //use local data if true

      if (debug) {
        $http.get('odf-requests/example-response.xml')
          .success(function (xml) {
            var data = parseData(xml);
            deferred.resolve(data);
            $rootScope.$broadcast('sensordata-new', data);
          });
      } else {
        $http.get('odf-requests/K1-request.xml')
          .success(function (xml) {

            $http.post(url, xml, {headers: {'Content-Type': 'application/xml'}})
              .success(function (data) {
                data = parseData(data);
                deferred.resolve(data);
                $rootScope.$broadcast('sensordata-new', data);
              })
              .error(function () {
                console.log('Failed to fetch sensor data.');
                deferred.reject({});
              });
          });
      }
      return deferred.promise;
    };

    /*
     * Convert the sensor data xml to a javascript object and return it.
     */
    function parseData(xml) {
      var sensorData = {};

      xml = new DOMParser().parseFromString(xml, 'text/xml');

      var objects = evaluateXPath(xml, '//*[local-name()="Object"]');

      if (objects.length === 0) {
        console.log('Couldn\'t fetch any sensor data from the server.');
      }

      for (var i = 0; i < objects.length; i++) {
        var id = objects[i].getElementsByTagName('id');

        if (id.length > 0) {
          id = id[0].textContent;
        } else {
          continue;
        }

        var sensors = objects[i].children;
        var sensorList = [];

        for (var j = 0; j < sensors.length; j++) {
          if (sensors[j].tagName !== 'InfoItem') {
            continue;
          }
          var name = sensors[j].getAttribute('name');
          var values = sensors[j].children;
          var valueList = [];

          for (var k = 0; k < values.length; k++) {
            if (values[k].tagName === 'value') {
              var value = values[k].textContent;
              var unixTime = values[k].getAttribute('unixTime');
              var dateTime = values[k].getAttribute('dateTime');
              var time;

              //Check if value is empty string because Number()
              //turns empty strings into zero.
              if (value) {
                value = Number(value);
                value = Math.round(value * 100) / 100;
              }

              if (dateTime) {
                time = new Date(dateTime).getTime();
              } else {
                time = Number(unixTime) * 1000;
              }

              if (!isNaN(value) && time) {
                valueList.push({
                  value: value,
                  time: time
                });
              }
            }
          }

          if (name && valueList.length > 0) {
            sortDates(valueList);

            sensorList.push({
              sensorId: name + '-' + id,
              type: name,
              values: valueList
            });
          }
        }

        if (sensorList.length > 0) {
          sensorData[id] = {
            name: id.split('-').join(' '),
            sensors: sensorList,
            node: null
          };
        }
      }
      return sensorData;
    }

    /*
     * Sort value list by date
     */
    function sortDates (array) {
      array.sort(function(a, b){
        return a.time - b.time;
      });
    }

    /*
     * Evaluate an XPath expression aExpr against a given DOM node
     * or Document object (aNode), returning the results as an array.
     * https://developer.mozilla.org/en-US/docs/Using_XPath
     */
    function evaluateXPath(aNode, aExpr) {
      var xpe = new XPathEvaluator();
      var nsResolver = xpe.createNSResolver(aNode.ownerDocument === null ?
        aNode.documentElement : aNode.ownerDocument.documentElement);
      var result = xpe.evaluate(aExpr, aNode, nsResolver, 0, null);
      var found = [];
      var res = result.iterateNext();

      while (res) {
        found.push(res);
        res = result.iterateNext();
      }

      return found;
    }

  });
