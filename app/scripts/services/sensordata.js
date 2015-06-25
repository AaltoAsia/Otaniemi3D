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
              deferred.reject({});
            });
        });
      */
      return deferred.promise;
    };

    /*
     * Convert the sensor data xml to a javascript object and return it.
     */
    function parseData(xml) {
      var sensorData = {};

      xml = new DOMParser().parseFromString(xml, 'text/xml');

      var objects = evaluateXPath(xml, '//Object');

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

        //Check if id starts with string 'room'
        if (id.lastIndexOf('room', 0) === 0) {
          var sensors = objects[i].children;
          var sensorList = [];

          for (var j = 0; j < sensors.length; j++) {
            if (sensors[j].tagName !== 'InfoItem') {
              continue;
            }
            var name = sensors[j].getAttribute('name');
            var value = Number(sensors[j].children[0].textContent);

            if (name && value) {
              sensorList.push({
                sensorId: name + '_' + id,
                type: name,
                value: value
              });
            }
          }

          if (sensorList.length > 0) {
            sensorData[id] = {
              name: id.split(/_(.+)/)[1],
              sensors: sensorList,
              node: null
            };
          }
        }
        //Break from the xpath iteration loop. There's no need to return
        //the list of elements.
        //return false;
      }
      return sensorData;
    }

    /*
     * Evaluate an XPath expression aExpr against a given DOM node
     * or Document object (aNode), returning the results as an array.
     * This function can also be given a callback that is called on every
     * element found.
     * https://developer.mozilla.org/en-US/docs/Using_XPath
     */
    function evaluateXPath(aNode, aExpr, fn) {
      var xpe = new XPathEvaluator();
      var nsResolver = xpe.createNSResolver(aNode.ownerDocument === null ?
        aNode.documentElement : aNode.ownerDocument.documentElement);
      var result = xpe.evaluate(aExpr, aNode, nsResolver, 0, null);
      var found = [];
      var callback = (typeof fn === 'function');
      var res = result.iterateNext();

      while (res) {
        if (callback) {
          fn(res);
        }
        found.push(res);
        res = result.iterateNext();
      }

      return found;
    }

  });
