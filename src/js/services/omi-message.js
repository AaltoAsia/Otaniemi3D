'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.omiMessage
 * @description
 * # omiMessage
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('omiMessage', function ($http, $q, $interval, dataStorage) {

    //Store pending http requests to an object
    var pendingRequests = Object.create(null);
    var self = this;

    this.send = function (method, request, params, loadingBar) {
      params = params || {};
      if (typeof loadingBar === 'undefined') {
        loadingBar = true;
      }

      var options = {
        url: 'https://otaniemi3d.cs.hut.fi/omi/node/',
        method: 'POST',
        data: createOmiRequest(request, method, params),
        headers: {'Content-Type': 'text/xml'},
        ignoreLoadingBar: !loadingBar
      };

      if (!pendingRequests[request]) {
        var promise = $http(options)
          .then(function(response) {
            dataStorage.sensorData = parse(response.data);
            return dataStorage.sensorData;
          })
          .then(function(error) {
            if (error.status === 404) {
              return 'Couldn\'t find such sensors or values.';
            } else {
              return 'Failed to fetch sensor data. Please try again';
            }
          })
          .finally(function() {
            pendingRequests[request] = false;
          });

        pendingRequests[request] = promise;
      }

      return pendingRequests[request];
    };

    function parse(xml) {
      var data = new DOMParser().parseFromString(xml, 'text/xml');
      console.log(data.querySelector('Objects'));
      var root = data.querySelector('Objects');
      var objects = root.children;
      var parsedObjects = [];

      for (var i = 0; i < objects.length; i++) {
        parsedObjects.push(self.parseObject(objects[i]));
      }

      console.log(parsedObjects);

      return parsedObjects;
    }

    self.parseObject = function (object) {
      var children = object.children;
      var type = object.getAttribute('type');
      var id;
      var description;
      var infoItems = [];
      var omiObjects = [];

      for (var i = 0; i < children.length; i++) {
        if (children[i].nodeName === 'id') {
          id = children[i];
        } else if (children[i].nodeName === 'description') {
          description = children[i];
        } else if (children[i].nodeName === 'InfoItem') {
          infoItems.push(children[i]);
        } else if (children[i].nodeName === 'Object') {
          omiObjects.push(children[i]);
        }
      }

      return {
        id: id ? id.textContent : null,
        type: type,
        description: description ? description.textContent : null,
        infoItems: infoItems.map(
          function(item) { return self.parseInfoItem(item); }
        ),
        childObjects: omiObjects.map(
          function(object) { return self.parseObject(object); }
        )
      };
    };

    self.parseInfoItem = function(item) {
      var children = item.children;
      var name = item.getAttribute('name');
      var description;
      var metaData;
      var values = [];

      for (var i = 0; i < children.length; i++) {
        if (children[i].nodeName === 'description') {
          description = children[i];
        } else if (children[i].nodeName === 'MetaData') {
          metaData = children[i];
        } else if (children[i].nodeName === 'value') {
          values.push(children[i]);
        }
      }

      return {
        name: name,
        description: description ? description.textContent : null,
        metaData: metaData ? self.parseMetaData(metaData) : null,
        values: values.map(
          function(value) { return self.parseValue(value); }
        )
      };
    };

    self.parseMetaData = function (metaElem) {
      var children = metaElem.children;
      var infoItems = [];

      for (var i = 0; i < children.length; i++) {
        if (children[i].nodeName === 'InfoItem') {
          infoItems.push(children[i]);
        }
      }

      var metaData = infoItems.map(
        function(data) { return self.parseInfoItem(data); }
      );

      return metaData.reduce(
        function(previous, current) {
          if (current.values.length === 1) {
            previous[current.name] = current.values[0].value;
          } else if (current.values.length > 1) {
            previous[current.name] = current.values;
          }
          return previous;
        }, {}
      );
    };

    self.parseValue = function (value) {
      var dateTime = value.getAttribute('dateTime');
      var unixTime = value.getAttribute('unixTime');
      var time;

      if (dateTime) {
        time = new Date (dateTime);
      } else if (unixTime) {
        time = new Date (Number(unixTime) * 1000);
      }

      return {
        value: value.textContent,
        time: time
      };
    };

    function createOmiRequest(request, method, params) {
      params = params || {};
      //Because 'ttl' is located in a different place in request XML we
      //store it in a different variable.
      var ttl = '0';
      if ('ttl' in Object.keys(params)) {
        ttl = params.ttl;
        delete params.ttl;
      }
      //This function turns object into a string with format:
      //`key1="value1" key2="value2"`
      var parseParams = function(params) {
        return Object.keys(params).reduce(
          function(previous, key) {
            return previous + ' ' + key + '="' + params[key] + '"';
          }, ''
        );
      };

      return (
        '<?xml version="1.0"?>' +
        '<omi:omiEnvelope xmlns:xs="http://www.w3.org/2001/XMLSchema-instance" ' +
          'xmlns:omi="omi.xsd" version="1.0" ttl="' + ttl + '">' +
          '<omi:' + method.toLowerCase() +' msgformat="odf"' + parseParams(params) + '>' +
            '<omi:msg>' +
              '<Objects xmlns="odf.xsd">' +
                request +
              '</Objects>' +
            '</omi:msg>' +
          '</omi:read>' +
        '</omi:omiEnvelope>');
    }

  });
