'use strict';

/**
 * @ngdoc service
 * @name otaniemi3dApp.Datahandler
 * @description
 * # Datahandler
 * Service in the otaniemi3dApp.
 */
angular.module('otaniemi3dApp')
    .service('Datahandler', ['$http', '$q', function ($http, $q) {
        // AngularJS will instantiate a singleton by calling "new" on this function

        var dataIsOk = function (data) {
            for (var i = 0; i < data.length; i = i + 1) {
                if      (data[i].id       === undefined) return false;
                else if (data[i].room     === undefined) return false;
                else if (data[i].sensorId === undefined) return false;
                else if (data[i].type     === undefined) return false;
                else if (data[i].value    === undefined) return false;

                else return true;
            }
        };

        var fetchData = function () {
            var deferred = $q.defer();

            $http.get('http://leap.cs.hut.fi/Otaniemi3DREST/webresources/entities.livedata')
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
        };
        return {fetchData: fetchData};

    }]);