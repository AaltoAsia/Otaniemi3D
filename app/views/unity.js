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
    self.message = '';

    var config = {
			params: { debugLevel: 1 }
		};
    var unityId = '#unity-player';

    downloadUnity().then(function () {
      self.unity = initUnity(config);
    });

    self.installPlugin = function () {
      if (self.unity) {
        self.unity.installPlugin();
      }
    };

    function initUnity(config) {
      var unity = new UnityObject2(config);

  		unity.observeProgress(function (progress) {
  			switch(progress.pluginStatus) {
  				case 'broken':
            self.message = 'You will need to restart your browser after installing Unity Web Player.';
            self.missing = true;
            break;
  				case 'missing':
            self.message = 'You need to install Unity Web Player.';
  					self.missing = true;
  				  break;
          case 'installed':
            self.message = '';
            self.missing = false;
            break;
  				default:
            self.message = '';
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
