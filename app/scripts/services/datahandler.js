'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.Datahandler
 * @description
 * # Datahandler
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
  .service('Datahandler', ['$http', function ($http) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var fetchJson = function(){
     	return $http.get('http://leap.cs.hut.fi/Otaniemi3DREST/webresources/entities.livedata')
     	  .success(function(data){
          return data;
        });
      };
    return {fetchJson:fetchJson};

  }]);