require.config({
  waitSeconds: 2,
  paths: {
    text: "../json/text",
    json: "../json/json" //alias to plugin
  }
});

require([
  "./GMLDataContainer",
  "./DisplayHelper",
  "./Objects/PrimitiveOption",
  "json! YOUR JSON FILE PATH",
  "./IndoorNavigation"
], function(
  GMLDataContainer,
  DisplayHelper,
  PrimitiveOption,
  sample_data_lwm_3d,
  IndoorNavigation,
) {
  'use strict';

  console.log(YOUR JSON FILE NAME);

  var gmlDataContainer = new GMLDataContainer(YOUR JSON FILE NAME);

  gmlDataContainer.rotateBuilding(viewer, new Cesium.Cartesian3.fromDegrees(120.0, 20.0, 0), 0.43); // YOUR BULIDING LOCATION

  var displayHelper = new DisplayHelper(gmlDataContainer, viewer);

  displayHelper.displayBuilding(viewer,
    new PrimitiveOption("Image", false, "./Texture/dark_blue.png", null),
    new PrimitiveOption("Image", false, "./Texture/light_gray.png", null),
    new PrimitiveOption("Image", false, "./Texture/dark_gray.png", null),
    new PrimitiveOption("Image", false, "./Texture/light_gray.png", null));

  displayHelper.displayPath(viewer);

  viewer.flyTo(viewer.entities);

  var canvas = viewer.canvas;
  canvas.setAttribute('tabindex', '0'); // needed to put focus on the canvas
  canvas.onclick = function() {
    canvas.focus();
  };

  var indoorNavigation = new IndoorNavigation(viewer, gmlDataContainer);
  indoorNavigation.setTreeViewNavigation();



  // set onclick funtion for navigation
  $('#jstree').on("changed.jstree", function(e, data) {
    indoorNavigation.onClickTreeView(data.selected);
  });

  $('#turnLeftBtn').click(function(){
    indoorNavigation.actionTurnLeft();
  });

  $('#turnRightBtn').click(function(){
    indoorNavigation.actionTurnRight();
  });

  $('#moveFront').click(function(){
    indoorNavigation.actionMoveFront();
  });

  $('#moveBackward').click(function(){
    indoorNavigation.actionMoveBack();
  });

  $('#backToOrigianlViewBtn').click(function(){
    indoorNavigation.actionTurnStraight();
  });

  $('#zoomIn').click(function(){
    indoorNavigation.actionZoomIn();
  });

  $('#zoomOut').click(function(){
    indoorNavigation.actionZoomOut();
  });


  var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
  handler.setInputAction(function(movement) {
    var feature = viewer.scene.pick(movement.position);
    if (Cesium.defined(feature)) {
      indoorNavigation.onClickEdge(feature);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

});
