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


  var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
  handler.setInputAction(function(movement) {
    var feature = viewer.scene.pick(movement.position);
    if (Cesium.defined(feature)) {
      indoorNavigation.onClickEdge(feature);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);


  $('#controller').click(function(event){
    var offsetX = event.offsetX == undefined ? event.layerX : event.offsetX;
    var offsetY = event.offsetY == undefined ? event.layerY : event.offsetY;
    checkButtonAndExcuteOnClick(offsetX, offsetY);
  });

  function checkButtonAndExcuteOnClick(offsetX, offsetY){

    if( 66 <= offsetX && offsetX <= 81 && 37 <= offsetY && offsetY <= 56 ){
      console.log("onclick moveFront");
      indoorNavigation.actionMoveFront();
    } else if( 66 <= offsetX && offsetX <= 81 && 91 <= offsetY && offsetY <= 111 ){
      console.log("onclick moveBack");
      indoorNavigation.actionMoveFront();
    } else if( 37 <= offsetX && offsetX <= 57 && 65 <= offsetY && offsetY <= 80 ){
      console.log("onclick TurnLeft");
      indoorNavigation.actionTurnLeft();
    } else if( 92 <= offsetX && offsetX <= 111 && 65 <= offsetY && offsetY <= 80 ){
      console.log("onclick TurnRight");
      indoorNavigation.actionTurnRight();
    } else if( 225 <= offsetX && offsetX <= 255 && 36 <= offsetY && offsetY <= 64 ){
      console.log("onclick TurnStraight");
      indoorNavigation.actionTurnStraight();
    } else if( 204 <= offsetX && offsetX <= 234 && 74 <= offsetY && offsetY <= 104 ){
      console.log("onclick ZoomIn");
      indoorNavigation.actionZoomIn();
    } else if( 249 <= offsetX && offsetX <= 279 && 77 <= offsetY && offsetY <= 107 ){
      console.log("onclick ZoomOut");
      indoorNavigation.actionZoomOut();
    }
  }

});
