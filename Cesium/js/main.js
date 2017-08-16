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
  "json!../json/sample_data_lwm_3d.json",
  "./IndoorNavigation"
], function(
  GMLDataContainer,
  DisplayHelper,
  PrimitiveOption,
  sample_data_lwm_3d,
  IndoorNavigation,
) {
  'use strict';

  console.log(sample_data_lwm_3d);

  var gmlDataContainer = new GMLDataContainer(sample_data_lwm_3d);

  gmlDataContainer.rotateBuilding(viewer, new Cesium.Cartesian3.fromDegrees(127.1034, 37.51283, 0), 0.43); // LWM
  // gmlDataContainer.rotateBuilding(viewer, new Cesium.Cartesian3.fromDegrees(129.082678, 35.234898, 0), -1.5708); // PNU

  var displayHelper = new DisplayHelper(gmlDataContainer, viewer);

  displayHelper.displayBuilding(viewer,
    new PrimitiveOption("Image", false, "./Texture/blue.jpg", null),
    new PrimitiveOption("Image", false, "./Texture/marble.jpg", null),
    new PrimitiveOption("Image", false, "./Texture/marble.jpg", null));

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
    indoorNavigation.onClickLeftTurnBtn();
  });

  $('#turnRightBtn').click(function(){
    indoorNavigation.onClickRightTurnBtn();
  });

  $('#moveFront').click(function(){
    indoorNavigation.onClickMoveFrontBtn();
  });

  $('#moveBackward').click(function(){
    indoorNavigation.onClickMoveBackwardBtn();
  });

  $('#backToOrigianlViewBtn').click(function(){
    indoorNavigation.onClickBackToOrigianlViewBtn();
  });

  $('#zoomIn').click(function(){
    indoorNavigation.onClickZoomInBtn();
  });

  $('#zoomOut').click(function(){
    indoorNavigation.onClickZoomOutBtn();
  });


  var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
  handler.setInputAction(function(movement) {
    var feature = viewer.scene.pick(movement.position);
    if (Cesium.defined(feature)) {
      indoorNavigation.onClickEdge(feature);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

});
