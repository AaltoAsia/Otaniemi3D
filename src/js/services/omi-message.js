'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.omiMessage
 * @description
 * # omiMessage
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('omiMessage', function ($http) {

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

      if (!pendingRequests[request + method + JSON.stringify(params)]) {
        var promise = $http(options)
          .then(function(response) {
            return parse(response.data);
          })
          .finally(function() {
            delete pendingRequests[request];
          });

        pendingRequests[request] = promise;
      }

      return pendingRequests[request];
    };

    this.restApi = function (url, isInfoItem) {
      if (!pendingRequests[url]) {
        var promise = $http.get(url, {headers: {'Content-Type': 'text/xml'}})
          .then(function(response) {
            if (isInfoItem) {
              return parseInfoItem(response.data);
            } else {
              return parseObject(response.data);
            }
          })
          .finally(function() {
            delete pendingRequests[url];
          });

        pendingRequests[url] = promise;
      }

      return pendingRequests[url];
    };

    function parse(xml) {
      var data = new DOMParser().parseFromString(xml, 'text/xml');
      var root = data.querySelector('Objects');
      var objects = root.children;
      var parsedObjects = [];

      for (var i = 0; i < objects.length; i++) {
        parsedObjects.push(parseObject(objects[i]));
      }

      console.log(parsedObjects);

      return parsedObjects;
    }

    //sorting function
    function byName(a, b) {
      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      return 0;
    }
    //sorting function
    function byId(a, b) {
      if (a.id > b.id) {
        return 1;
      }
      if (a.id < b.id) {
        return -1;
      }
      return 0;
    }

    function parseObject(object) {
      if (typeof object === 'string') {
        object = new DOMParser().parseFromString(object, 'text/xml')
          .documentElement;
      }
      var children = object.children;
      var type = object.getAttribute('type');
      var id;
      var description;
      var infoItems = [];
      var odfObjects = [];

      for (var i = 0; i < children.length; i++) {
        if (children[i].nodeName === 'id') {
          id = children[i];
        } else if (children[i].nodeName === 'description') {
          description = children[i];
        } else if (children[i].nodeName === 'InfoItem') {
          infoItems.push(children[i]);
        } else if (children[i].nodeName === 'Object') {
          odfObjects.push(children[i]);
        }
      }

      return {
        id: id ? id.textContent : null,
        type: type,
        description: description ? description.textContent : null,
        infoItems: infoItems.map(
          function(item) { return parseInfoItem(item); }
        ).sort(byName),
        childObjects: odfObjects.map(
          function(object) { return parseObject(object); }
        ).sort(byId)
      };
    }

    function parseInfoItem(item) {
      if (typeof item === 'string') {
        item = new DOMParser().parseFromString(item, 'text/xml')
          .documentElement;
      }
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
        metaData: metaData ? parseMetaData(metaData) : null,
        values: values.map(
          function(value) { return parseValue(value); }
        )
      };
    }

    function parseMetaData(metaElem) {
      var children = metaElem.children;
      var infoItems = [];

      for (var i = 0; i < children.length; i++) {
        if (children[i].nodeName === 'InfoItem') {
          infoItems.push(children[i]);
        }
      }

      var metaData = infoItems.map(
        function(data) { return parseInfoItem(data); }
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
    }

    function parseValue(value) {
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
    }

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
