'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.omiMessage
 * @description
 * # omiMessage
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('omiMessage', function ($http, $q, $interval, dataStorage, JXON) {

    //Store pending http requests to an object
    var pendingRequests = {},
        self = this;

    this.send = function (method, request, params, broadcast, loadingBar) {
      var deferred = $q.defer(),
          url = 'https://otaniemi3d.cs.hut.fi/omi/node/';

      params = params || {};
      broadcast = broadcast || '';
      loadingBar = loadingBar || true;

      var requestXml;
      if (typeof request === 'string') {
        requestXml = request;
      } else if (typeof request === 'object') {
        requestXml = generateXml(request, method, params);
      }

      //If a pending request with the same url exists don't send a new request
      if (!pendingRequests[requestXml]) {
        pendingRequests[requestXml] = true;

        $http.post(url, requestXml,
          {
            headers: {'Content-Type': 'application/xml'},
            ignoreLoadingBar: !loadingBar
          })
          .then(function (response) {
            var data = parseData(response.data);
            deferred.resolve(data);
            dataStorage.sensors = data;
          }, function (reason) {
            var msg;
            if (reason.status === 404) {
              msg = 'Couldn\'t find such sensors or values.';
              console.log(msg);
              deferred.reject(msg);
            } else {
              msg = 'Failed to fetch sensor data. Please try again';
              console.log(msg);
              deferred.reject(msg);
            }
          })
          .finally(function () {
            pendingRequests[requestXml] = false;
          });

      } else {
        deferred.reject();
      }

      return deferred.promise;
    };

    self.parseInfoItem = function (xml) {
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

    this.parseMetaData = function (xml) {
      xml = new DOMParser().parseFromString(xml, 'text/xml');

      var metaData = {};

      $(xml).find('InfoItem').each(function () {
        metaData[$(this).attr('name')] = $(this).find('value').text();
      });

      return metaData;
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
      xml = new DOMParser().parseFromString(xml, 'text/xml');

      var objects = evaluateXPath(xml, '//*[local-name()="Object"]');

      if (objects.length === 0) {
        console.log('Couldn\'t fetch any sensor data from the server.');
      }

      var sensorList = [];

      for (var i = 0; i < objects.length; i++) {
        var id = objects[i].getElementsByTagName('id');

        if (id.length > 0) {
          id = id[0].textContent;
        } else {
          continue;
        }

        var objectSensors = objects[i].children;

        for (var j = 0; j < objectSensors.length; j++) {
          if (objectSensors[j].tagName !== 'InfoItem') {
            continue;
          }
          var name = objectSensors[j].getAttribute('name');
          var values = objectSensors[j].children;
          var valueList = [];
          var metaData = {};
          var metaDataNode;

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
            } else if (values[k].tagName === 'MetaData') {
              metaDataNode = values[k];
            }
          }

          if (metaDataNode) {
            var container = document.createElement('div');
            container.appendChild(metaDataNode);

            metaData = self.parseMetaData(container.innerHTML);
          }

          if (name) {
            sortDates(valueList);

            var sensorName;
            switch (name.toLowerCase()) {
              case 'co2':
                sensorName = 'CO2';
                break;
              case 'pir':
                sensorName = 'Occupancy';
                break;
              default:
                sensorName = name.charAt(0).toUpperCase() +
                  name.slice(1);
            }

            var suffix;
            switch (name.toLowerCase()) {
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

      	    var isPlug = false;
      	    if((name.toLowerCase().match(/:/g) || []).length==5) {
      		    isPlug=true;
      	    }

            sensorList.push({
              id: name + '-' + id,
              type: name,
              room: id.split('-').join(' '),
              roomId: id,
              name: sensorName,
              values: valueList,
              suffix: suffix,
              metaData: metaData,
      	      isPlug: isPlug,
      	      togglePlug(roomId, mac, currentValue) {

                var url = 'https://otaniemi3d.cs.hut.fi/omi/node/';
                var newValue = (parseInt(currentValue)>0 ? "0" : "1");

                var requestXml =
                  '<?xml version="1.0"?>'+
                  '<omi:omiEnvelope xmlns:xs="http://www.w3.org/2001/XMLSchema-instance" xmlns:omi="omi.xsd" version="1.0" ttl="0">'+
                    '<write xmlns="omi.xsd" msgformat="odf">'+
                      '<omi:msg>'+
                        '<Objects xmlns="odf.xsd">'+
                          '<Object>'+
                            '<id>K1</id>'+
                            '<Object>'+
                              '<id>'+roomId+'</id>'+
                              '<InfoItem name="'+mac+'">'+
                                '<value>'+newValue+'</value>'+
                              '</InfoItem>'+
                            '</Object>'+
                          '</Object>'+
                        '</Objects>'+
                      '</omi:msg>'+
                    '</write>'+
                  '</omi:omiEnvelope>';


                $http.post(url, requestXml, {
                  headers: {'Content-Type': 'application/xml'}
                })
                .then(function (response) {
                  //alert(response);
                }, function (reason) {
                  var msg;
                  if (reason.status === 404) {
                    msg = 'Couldn\'t find such sensors or values.';
                    console.log(msg);
                    deferred.reject(msg);
                  } else {
                    msg = 'Failed to fetch sensor data. Please try again';
                    console.log(msg);
                    deferred.reject(msg);
                  }
                })
                .finally(function () {
                  pendingRequests[requestXml] = false;
                });
      	      }
            });
          }
        }
      }
      return sensorList;
    }

    /*
     * Generate request xml to get data from one object with id.
     */
    function generateXml (request, method, params) {
      var preamble = {
        'omi:omiEnvelope': {
          '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@xmlns:omi': 'omi.xsd',
          '@version': '1.0',
          '@ttl': '0'
        }
      };
      var methodElement = preamble['omi:omiEnvelope']['omi:'+method] = {
        '@msgformat': 'odf',
        'omi:msg': true
      };

      angular.forEach(params, function (value, key) {
        methodElement['@'+key] = value;
      });

      var xmlDoc = JXON.createXML(preamble);

      var objects = document.createElementNS('odf.xsd', 'Objects');
      objects = objects.appendJXON(request);

      $(xmlDoc.documentElement).find('omi\\:msg').append(objects);

      var processingInstructions = xmlDoc.createProcessingInstruction('xml', 'version="1.0" encoding="UTF-8"');
      xmlDoc.insertBefore(processingInstructions, xmlDoc.firstChild);

      return new XMLSerializer().serializeToString(xmlDoc);
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
