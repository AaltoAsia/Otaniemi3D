'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.SensorData
 * @description
 * # SensorData
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('SensorData', function ($http, $q, $interval, $rootScope) {

    //Store pending http requests to an object
    var pendingRequests = {},
        debugFile = 'odf-requests/response',
        self = this,
        debugNum = 1,
        debug = true;

    $interval(function () {
      self.get('K1', {}, 'sensordata-new');
    }, 2000);

    /*
     * @param {string} id - Id of the object whose data should be fetched.
     * @param {Object} params - Parameters that are used as OMI request attributes
     * @param {string} broadcast - Name of the event broadcasted by angular when
     *                             response has arrived.
     */
    this.get = function (id, params, broadcast) {
      var deferred = $q.defer(),
          url = 'http://otaniemi3d.cs.hut.fi/omi/node/',
          requestXml = generateXml(id, 'read', params);

      //If a pending request with the same url exists don't send a new request
      if (!pendingRequests[requestXml]) {
        pendingRequests[requestXml] = true;

        if (debugNum >= 3) {
          debugNum = 1;
        } else {
          debugNum++;
        }

        if (debug) {
          var file;
          if (id === 'Room-101') {
            file = 'odf-requests/response-room101.xml';
          } else {
            file = debugFile + debugNum + '.xml';
          }
          $http.get(file)
            .success(function (data) {
              data = parseData(data);
              deferred.resolve(data);
              $rootScope.$broadcast(broadcast, data);
            })
            .error(function () {
              console.log('Failed to fetch sensor data.');
              deferred.reject();
            })
            .finally(function () {
              pendingRequests[requestXml] = false;
            });

        } else {

          $http.post(url, requestXml, {headers: {'Content-Type': 'application/xml'}})
            .success(function (data) {
              data = parseData(data);
              deferred.resolve(data);
              $rootScope.$broadcast(broadcast, data);
            })
            .error(function () {
              console.log('Failed to fetch sensor data.');
              deferred.reject();
            })
            .finally(function () {
              pendingRequests[requestXml] = false;
            });
        }

      } else {
        deferred.reject();
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
                time = new Date(Number(unixTime) * 1000);
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

            var sensorName;
            switch (name.toLowerCase()) {
              case 'co2':
                sensorName = 'CO2';
                break;
              case 'pir':
                sensorName = 'PIR';
                break;
              default:
                sensorName = name.charAt(0).toUpperCase() +
                  name.slice(1);
            }

            sensorList.push({
              id: name + '-' + id,
              type: name,
              room: id.split('-').join(' '),
              roomId: id,
              name: sensorName,
              values: valueList
            });
          }
        }

        if (sensorList.length > 0) {
          sensorData[id] = {
            id: id,
            name: id.split('-').join(' '),
            sensors: sensorList,
            node: null
          };
        }
      }
      return sensorData;
    }

    /*
     * Generate request xml to get data from one object with id.
     */
    function generateXml (id, method, params) {
      var xsi = 'http://www.w3.org/2001/XMLSchema-instance',
          omi = 'omi.xsd',
          xmlString = '<?xml version="1.0" encoding="UTF-8" ?><omi:omiEnvelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:omi="omi.xsd" xsi:schemaLocation="omi.xsd omi.xsd" version="1.0" ttl="0"></omi:omiEnvelope>',
          xml = (new window.DOMParser())
            .parseFromString(xmlString, 'text/xml').documentElement;

      var methodElem = document.createElementNS(omi, method);
      methodElem.setAttribute('msgformat', 'odf');

      var keys = Object.keys(params);
      for (var i = 0; i < keys.length; i++) {
        methodElem.setAttribute(keys[i], params[keys[i]].toString());
      }

      var msg = document.createElementNS(omi, 'msg');
      msg.setAttribute('xmlns', 'odf.xsd');
      msg.setAttributeNS(xsi, 'schemaLocation', 'odf.xsd odf.xsd');

      var objects = document.createElement('Objects'),
          object = document.createElement('Object'),
          idElem = document.createElement('id'),
          idText = document.createTextNode(id);

      idElem.appendChild(idText);
      object.appendChild(idElem);
      objects.appendChild(object);
      msg.appendChild(objects);
      methodElem.appendChild(msg);
      xml.appendChild(methodElem);

      return xml;
    };

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
