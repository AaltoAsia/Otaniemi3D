'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.Datahandler
 * @description
 * # Datahandler
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('Datahandler', function ($http, $q, XmlParser) {
    /*
    var dataIsOk = function (data) {
      for (var i = 0; i < data.length; i = i + 1) {
        if      (data[i].id       === undefined) { return false; }
        else if (data[i].room     === undefined) { return false; }
        else if (data[i].sensorId === undefined) { return false; }
        else if (data[i].type     === undefined) { return false; }
        else if (data[i].value    === undefined) { return false; }
        data[i].value = Number(data[i].value);
      }
      return true;
    };
    */

    this.fetchData = function (timeFrame) {
      var deferred = $q.defer(),
          //time = timeFrame || '',
          url = 'http://otaniemi3d.cs.hut.fi/omi/node/';

      $http.get('odf-requests/data-all.xml')
        .success(function (xml) {

          $http.post(url, xml, {headers: {'Content-Type': 'application/xml'}})
            .success(function (data) {
              deferred.resolve(XmlParser.parse(data));
            })
            .error(function (data, status, headers, config) {
              console.log('Response:');
              console.log(data);
              console.log('Status: ' + status);
              console.log('Headers:');
              console.log(headers());
              console.log('Config:');
              console.log(config);
            });
        });

      return deferred.promise;

      /*
      switch(time) {
        case 'Day':
          url = 'sensor_data/data_day.json';
          break;
          
        case 'Week':
          url = 'sensor_data/data_week.json';
          break;
          
        case 'Month':
          url = 'sensor_data/data_month.json';
          break;
          
        case 'Year':
          url = 'sensor_data/data_year.json';
          break;
          
        default:
          url = 'sensor_data/data.json';
          //url = 'http://leap.cs.hut.fi/Otaniemi3DREST/webresources/entities.livedata';
      }
      
      
      $http.get(url)
        .success(function (data) {
          if (dataIsOk(data))
          {
            deferred.resolve(data);
          }
          else
          {
            deferred.reject([
                {error: 'Illegal format'}
            ]);
          }
        })
        .error(function (data, status)
        {
            deferred.reject([{error: status}]);
        });
      return deferred.promise;
      */
    };
  });
