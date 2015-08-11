'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:UnityCtrl
 * @description
 * # UnityCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
  .controller('UnityCtrl', function ($q) {
    var self = this;

    self.missing = true;

    var config = {
			params: { debugLevel: 1 }
		};
    var unityId = '#unity-player';

    downloadUnity().then(function () {
      self.unity = initUnity(config);
    });

    function initUnity(config) {
      var unity = new UnityObject2(config);

  		unity.observeProgress(function (progress) {
  			switch(progress.pluginStatus) {
  				case 'broken':
  				case 'missing':
  				  break;
          case 'installed':
            self.missing = false;
            break;
  				default:
            break;
  			}
  		});

  		unity.initPlugin($(unityId)[0], 'web.unity3d');

      return unity;
    }

    function downloadUnity() {
      var deferred = $q.defer();

      var unityObjectUrl =
        'http://webplayer.unity3d.com/download_webplayer-3.x/3.0/uo/UnityObject2.js';
      if (document.location.protocol === 'https:') {
        unityObjectUrl = unityObjectUrl.replace('http://', 'https://ssl-');
      }
      $.getScript(unityObjectUrl, function () {
        deferred.resolve();
      });

      return deferred.promise;
    }
  });
