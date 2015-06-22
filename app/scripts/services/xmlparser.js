'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.XmlParser
 * @description
 * # XmlParser
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('XmlParser', function () {

    this.parse = function(xml) {

      xml = $.parseXML(xml);
      var resultData = [];
      var objects = $(xml).find('Objects')[0];

      if (objects) {
        traverse(objects, resultData);
      } else {
        console.log('Couldn\'t fetch any sensor data from the server.')
      }

      console.log(resultData);
      return resultData;

    };


    function traverse(object, resultData) {

      var id = $(object).children('id').text();

      if (id) {
        //var sensors = [];

        $(object).children('InfoItem').each(function() {
          var sensor = $(this).attr('name');
          var value = $(this).children('value').text();

          if (sensor && value) {
            resultData.push(
              {
                'sensor': sensor,
                'value': value,
                'location': id
              }
            );
          }
          
        });
        /*
        resultData.push(
          {
            'id': id,
            'name': $(object).children('description').text(),
            'sensors': sensors
          }
        );
        */
      }

      if (object.hasChildNodes()) {
        var node = object.firstChild;

        while (node) {
          traverse(node, resultData);
          node = node.nextSibling;
        }
      }
    }

  });
