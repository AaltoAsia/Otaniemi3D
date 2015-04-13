'use strict';

/**
 * @ngdoc function
 * @name otaniemi3dApp.controller:twoDViewCtrl
 * @description
 * # twoDViewCtrl
 * Controller of the otaniemi3dApp
 */
angular.module('otaniemi3dApp')
    .controller('twodview', function ($scope, Datahandler, Floorplans, Rooms, twodservice, $rootScope, $modal) {
  
var loaded = false;

$scope.panoramaViewer = function() {
    $scope.pano = true; //make panorama(pano) div visible
    var roomInfo = Rooms.krpanoHTML($scope.room); //find information for krpano tooltip
    var infos = {room: roomInfo};
    if(loaded === false){
    embedpano({
          xml:'panorama/' + $scope.room.split(' ').join('_') +'.xml',
          id:'pano_obj',
          target:'pano',
          html5:'only',
          passQueryParameters:true,
          vars:infos
        });
    loaded = true;
  }
    else{
        var xmlpath = $scope.room.split(' ').join('_') +'.xml';
        document.getElementById('pano_obj').call('loadpano('+ xmlpath +');');
        document.getElementById('pano_obj').call('set(room,' + roomInfo +');');

    }
};
$scope.stopPanorama = function(){
    $scope.pano = false;

};

  var floorplanClass = 'floorplan';
  var floorplanFullscreenClass = 'floorplan-fullscreen';
  var panoramaNormal = 'pano-2d-view';
  var panoramaFull = 'pano-2d-view-fullscreen';

  $scope.sensorData = null;
  $scope.floorplanClass = floorplanClass;
  $scope.panoramaClass = panoramaNormal;
  $scope.rooms = Rooms;
  $scope.searchString = '';
  $scope.highlightedRoom = null;
  $scope.roomValueType = 'Temperature';
  $scope.floors = Floorplans.floors.length;
  $scope.selectedRoom = null;
  $scope.timeFrame = '';
  $scope.room = null; // Room which panoramic button was clicked.
  $scope.selectedPlan = null;
  $scope.timeFrame = 'Latest';
  $scope.resetView = null;

  $scope.searchContainer = ''; //This is used to set correct top margin for search container

  $scope.svgSupport = Modernizr.svg;
  $scope.pano = false;

  /* These are ng-class definitions for buttons found in 2dview*/
  $scope.buttonClass = 'glyphicon glyphicon-resize-full';
  $scope.nextButtonClass = 'glyphicon glyphicon-arrow-right';
  $scope.previousButtonClass = 'glyphicon glyphicon-arrow-left';

  //Select default floorplan which is defined in Floorplans service
  $scope.planNumber = 0;
  for ($scope.planNumber; $scope.planNumber < Floorplans.floors.length; $scope.planNumber++) {
      if (Floorplans.floors[$scope.planNumber].isSelected) {
          $scope.selectedPlan = Floorplans.floors[$scope.planNumber];
          break;
      }
  }
  
  $scope.showGradient = function() {
    return $scope.roomValueType.toLowerCase() !== 'pir' && $scope.roomValueType.toLowerCase() !== 'occupancy';
  };

  // Toggle fullscreen button. It broadcasts to rootscope to change the view to fullscreen
  // which in turn hides the footer and header. Also it changes the fullscreen button glyphicon
  $scope.toggleFullscreen = function(){
      $rootScope.fullscreen = !$rootScope.fullscreen;
      if ($scope.floorplanClass === floorplanClass) {
          $scope.floorplanClass = floorplanFullscreenClass;
          $scope.panoramaClass = panoramaFull;
          $scope.searchContainer = 'search-container-full';
          $scope.buttonClass = ' glyphicon glyphicon-resize-small';
      }
      else {
          $scope.floorplanClass = floorplanClass;
           $scope.panoramaClass = panoramaNormal;
          $scope.searchContainer = '';
          $scope.buttonClass = 'glyphicon glyphicon-resize-full';
      }
  };

  /*
   * Fetch sensor data from the server.
   */
  Datahandler.fetchData().then(
      function(data) {
          $scope.sensorData = data;
      },
      function() {
          console.log('Error: Failed to fetch sensor data');
      }
  );

  /*
   * Change current floorplan to the previous of net floorplan
   * direction is either 1 if the user pressed next button or -1
   * if the user pressed previous button
   */
  $scope.selectPlan = function (direction) {

    if (direction === 1) {
      Floorplans.floors[$scope.planNumber].isSelected = false;
      Floorplans.floors[$scope.planNumber+1].isSelected = true;
      $scope.selectedPlan = Floorplans.floors[$scope.planNumber+1];
      $scope.planNumber++;
    }
    if (direction === -1) {
      Floorplans.floors[$scope.planNumber].isSelected = false;
      Floorplans.floors[$scope.planNumber-1].isSelected = true;
      $scope.selectedPlan = Floorplans.floors[$scope.planNumber-1];
      $scope.planNumber--;
    }
  };


  $scope.highlightRoom = function(item) {

    if ($scope.highlightedRoom !== null) {
      clearInterval($scope.highlightedRoom.pulse);
    }

    $scope.highlightedRoom = item;
    $scope.planNumber = $scope.highlightedRoom.floor;
  };

  $scope.onSelect = function($item) {
    $scope.highlightRoom($item);
  };

  $scope.onSearch = function(searchString) {
    if (searchString.name) { //If the room is once selected from the dropdown(typeahead), the searchString will actually be the room object
      $scope.highlightRoom(searchString);
    } else {
      var selected;
      for (var i = 0; i < Rooms.list.length; i++) {
        var room = Rooms.list[i];
        if (room.name.toLowerCase() === searchString.toLowerCase()) {
          selected = room;
          break;
        }
      }
      if (selected !== undefined) {
        $scope.highlightRoom(selected);
      }
    }
  };
  
  $scope.resetZoom = function() {
    if ($scope.resetView === null) {
      $scope.resetView = false;
    }
    $scope.resetView = !$scope.resetView;
  };

  /*
  / Refresh the room colours according to sensor that is chosen.
  / For example if the user changes from temperature heatmap to co2 heatmap
  / this function will colour the floorplans according to values measured by
  / co2 sensors.
  */
  $scope.refreshRoomColor = function(type) {
    for (var j = 0; j < Rooms.list.length; j++) {
      var room = Rooms.list[j];

      // Colour the room white, in case the room doesn't have any values for that particular sensor
      //
      d3.select(room.node).style('fill', 'rgb(255, 255, 255)');

      // Loop through sensors and check the value of the sensor that matches the parameter given
      //
      for (var i = 0; i < room.sensors.length; i++) {
        if (room.sensors[i].type.toLowerCase() === type.toLowerCase() ||
           (room.sensors[i].type.toLowerCase() === 'pir' && type.toLowerCase() === 'occupancy')) {
          var color = twodservice.getColor(room.sensors[i].type, room.sensors[i].value);
          d3.select(room.node)
            .style('fill', color.rgb)
            .style('fill-opacity', color.opacity);
        }
      }
    }
  };

  $scope.changeColour = function(type) {
      $scope.roomValueType = type;
      $scope.refreshRoomColor(type);
  };

  $scope.selectTimeFrame = function(timeFrame) {
      var time = timeFrame;

      if (time) {
        $scope.timeFrame = time;
      } else {
        $scope.timeFrame = 'Latest';
      }

      Datahandler.fetchData(time).then(
        function(data) {
            $scope.sensorData = data;
        },
        function() {
            console.log('Error: Failed to fetch sensor data');
        }
    );
  };



   /*Create a new modal pass timeframe and roomValueType variables into it
      Also parse the return values to aforementioned variables*/
  $scope.open = function () {

    var modalInstance = $modal.open({
      templateUrl: 'myModalContent.html',
      controller: 'ModalcontrollerCtrl',
      resolve: {
        timeFrame: function () {
          return $scope.timeFrame;
        },
        roomValueType: function () {
          return $scope.roomValueType;
        }
      }
    });

    modalInstance.result.then(function () {
      if (arguments[0][1] !== $scope.timeFrame) {
        $scope.timeFrame = arguments[0][1];
        $scope.roomValueType = arguments[0][0];
        $scope.selectTimeFrame($scope.timeFrame);
      }
      else if (arguments[0][0] !== $scope.roomValueType) {
        $scope.roomValueType = arguments[0][0];
        $scope.refreshRoomColor($scope.roomValueType);
      }
    });
  };
});
