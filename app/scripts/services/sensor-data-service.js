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
        debug = false,
        requestK1 = {
          'Objects': {
            'Object': {
              'id': {
                'keyValue': 'K1'
              }
            }
          }
        };

    /*
     * @param {string} id - Id of the object whose data should be fetched.
     * @param {Object} params - Parameters that are used as OMI request attributes
     * @param {string} broadcast - Name of the event broadcasted by angular when
     *                             response has arrived.
     */
    this.get = function (request, params, broadcast) {
      var deferred = $q.defer(),
          url = 'http://otaniemi3d.cs.hut.fi/omi/node/',
          requestXml = generateXml(request, 'read', params);

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
              deferred.reject('Failed to fetch sensor data.');
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

    self.get(requestK1, {}, 'sensordata-new');
    /*
    $interval(function () {
      self.get(requestK1, {}, 'sensordata-new');
    }, 10000);
    */

    this.parseInfoItem = function (xml) {
      xml = new DOMParser().parseFromString(xml, 'text/xml');

      var values = [];

      $(xml).find('value').each(function () {
        var time = $(this).attr('unixTime');
        if (!time) {
          time = $(this).attr('dateTime');
          time = new Date(time);
        } else {
          time = new Date(Number(time) * 1000);
        }

        var value = $(this).text();
        if (value) {
          value = Math.round(Number(value) * 100) / 100;
        }

        values.push({
          value: value,
          time: time
        });
      });

      return values;
    };

    this.parseObject = function(xml) {
      xml = new DOMParser().parseFromString(xml, 'text/xml');

      var root = $(xml).find(':root'),
          id = root.children('id').first().text(),
          childObjects = [],
          infoItems = [];

      root.children('Object').each(function () {
        childObjects.push(
          $(this).children('id').text()
        );
      });

      root.children('InfoItem').each(function () {
        infoItems.push(
          $(this).attr('name')
        );
      });

      return {
        id: id,
        text: id.split('-').join(' '),
        infoItems: infoItems,
        objects: childObjects
      };
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
                value = Math.round(Number(value) * 100) / 100;
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
    function generateXml (request, method, params) {
      var xsi = 'http://www.w3.org/2001/XMLSchema-instance',
          omi = 'omi.xsd',
          xmlString = '<?xml version="1.0" encoding="UTF-8" ?><omi:omiEnvelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:omi="omi.xsd" xsi:schemaLocation="omi.xsd omi.xsd" version="1.0" ttl="0"></omi:omiEnvelope>',
          xml = new window.DOMParser()
            .parseFromString(xmlString, 'text/xml').documentElement;

      var methodElem = document.createElementNS(omi, 'omi:' + method);
      methodElem.setAttribute('msgformat', 'odf');

      var keys = Object.keys(params);
      for (var i = 0; i < keys.length; i++) {
        methodElem.setAttribute(keys[i], params[keys[i]].toString());
      }

      var msg = document.createElementNS(omi, 'omi:msg');
      msg.setAttribute('xmlns', 'odf.xsd');
      msg.setAttributeNS(xsi, 'xsi:schemaLocation', 'odf.xsd odf.xsd');

      var requestBody = createXML(request).documentElement;

      msg.appendChild(requestBody);
      methodElem.appendChild(msg);
      xml.appendChild(methodElem);

      /*
      var objects = document.createElementNS(null, 'Objects'),
          object = document.createElementNS(null, 'Object');

      var idElem = document.createElementNS(null, 'id'),
      idText = document.createTextNode(id);

      idElem.appendChild(idText);
      object.appendChild(idElem);
      objects.appendChild(object);
      msg.appendChild(objects);
      methodElem.appendChild(msg);
      xml.appendChild(methodElem);
      */

      return new XMLSerializer().serializeToString(xml);
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

    /*
     * JXON Snippet #5 - Mozilla Developer Network
     * https://developer.mozilla.org/en-US/docs/JXON
     */
    function createXML (oObjTree) {
      function loadObjTree (oParentEl, oParentObj) {
        var vValue, oChild;
        if (oParentObj.constructor === String || oParentObj.constructor === Number || oParentObj.constructor === Boolean) {
          oParentEl.appendChild(oNewDoc.createTextNode(oParentObj.toString())); /* verbosity level is 0 or 1 */
          if (oParentObj === oParentObj.valueOf()) { return; }
        } else if (oParentObj.constructor === Date) {
          oParentEl.appendChild(oNewDoc.createTextNode(oParentObj.toGMTString()));
        }
        for (var sName in oParentObj) {
          if (isFinite(sName)) { continue; } /* verbosity level is 0 */
          vValue = oParentObj[sName];
          if (sName === 'keyValue') {
            if (vValue !== null && vValue !== true) { oParentEl.appendChild(oNewDoc.createTextNode(vValue.constructor === Date ? vValue.toGMTString() : String(vValue))); }
          } else if (sName === 'keyAttributes') { /* verbosity level is 3 */
            for (var sAttrib in vValue) { oParentEl.setAttribute(sAttrib, vValue[sAttrib]); }
          } else if (sName.charAt(0) === '@') {
            oParentEl.setAttribute(sName.slice(1), vValue);
          } else if (vValue.constructor === Array) {
            for (var nItem = 0; nItem < vValue.length; nItem++) {
              oChild = oNewDoc.createElement(sName);
              loadObjTree(oChild, vValue[nItem]);
              oParentEl.appendChild(oChild);
            }
          } else {
            oChild = oNewDoc.createElement(sName);
            if (vValue instanceof Object) {
              loadObjTree(oChild, vValue);
            } else if (vValue !== null && vValue !== true) {
              oChild.appendChild(oNewDoc.createTextNode(vValue.toString()));
            }
            oParentEl.appendChild(oChild);
          }
        }
      }
      var oNewDoc = document.implementation.createDocument('', '', null);
      loadObjTree(oNewDoc, oObjTree);
      return oNewDoc;
    }

  });
