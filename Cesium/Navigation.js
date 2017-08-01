function Navigation(edges,nodes,cellSpaceMembers) {
  var scene = viewer.scene;
  var canvas = viewer.canvas;
      canvas.setAttribute('tabindex', '0'); // needed to put focus on the canvas
      canvas.onclick = function() {
          canvas.focus();
      };
  var ellipsoid = scene.globe.ellipsoid;
  var camera = viewer.camera;
  var controller = scene.screenSpaceCameraController;

  // disable the default event handlers
  scene.screenSpaceCameraController.enableRotate = false;
  scene.screenSpaceCameraController.enableTranslate = false;
  scene.screenSpaceCameraController.enableZoom = false;
  scene.screenSpaceCameraController.enableTilt = false;
  scene.screenSpaceCameraController.enableLook = false;

  var startMousePosition;
  var mousePosition;
  var flags = {
      looking : false,
      moveForward : false,
      moveBackward : false,
      moveUp : false,
      moveDown : false,
      moveLeft : false,
      moveRight : false
  };

  var handler = new Cesium.ScreenSpaceEventHandler(canvas);

  handler.setInputAction(function(movement) {
      flags.looking = true;
      mousePosition = startMousePosition = Cesium.Cartesian3.clone(movement.position);
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

  handler.setInputAction(function(movement) {
      mousePosition = movement.endPosition;
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  handler.setInputAction(function(position) {
      flags.looking = false;
  }, Cesium.ScreenSpaceEventType.LEFT_UP);

  function getFlagForKeyCode(keyCode) {
      switch (keyCode) {
      case 'W'.charCodeAt(0):
          return 'turnUp';
      case 'S'.charCodeAt(0):
          return 'turnDown';
      case 'Q'.charCodeAt(0):
          return 'moveFront';
      case 'E'.charCodeAt(0):
          return 'moveBack';
      case 'D'.charCodeAt(0):
          return 'turnRight';
      case 'A'.charCodeAt(0):
          return 'turnLeft';
      default:
          return undefined;
      }
  }

  document.addEventListener('keydown', function(e) {
      var flagName = getFlagForKeyCode(e.keyCode);
      if (typeof flagName !== 'undefined') {
          flags[flagName] = true;
      }
  }, false);

  document.addEventListener('keyup', function(e) {
      var flagName = getFlagForKeyCode(e.keyCode);
      if (typeof flagName !== 'undefined') {
          flags[flagName] = false;
      }
  }, false);

  var cameraMoveMode = 0;
  var dstDirection = null;
  var srcDirection = new Cesium.Cartesian3(edges[249].stateMembers[0].coordinates[0],
                                           edges[249].stateMembers[0].coordinates[1],
                                           edges[249].stateMembers[0].coordinates[2]);


  viewer.clock.onTick.addEventListener(function(clock) {
      var camera = viewer.camera;

      if (flags.looking) {
          var width = canvas.clientWidth;
          var height = canvas.clientHeight;

          // Coordinate (0.0, 0.0) will be where the mouse was clicked.
          var x = (mousePosition.x - startMousePosition.x) / width;
          var y = -(mousePosition.y - startMousePosition.y) / height;

          var lookFactor = 0.05;
          camera.lookRight(x * lookFactor);
          camera.lookUp(y * lookFactor);
      }

      // Change movement speed based on the distance of the camera to the surface of the ellipsoid.
      var moveRate = ellipsoid.cartesianToCartographic(camera.position).height / 100.0;
      var turnRate = ellipsoid.cartesianToCartographic(camera.position).width / 100.0;

      function getHeading(src, dst){
          var src_Lat_radian = src.x *(Math.PI/180);
          var src_Lon_radian = src.y *(Math.PI/180);
          var dst_Lat_radian = dst.x *(Math.PI/180);
          var dst_Lon_radian = dst.y *(Math.PI/180);

          var radian_distance = 0;
          radian_distance = Math.acos(Math.sin(src_Lat_radian) * Math.sin(dst_Lat_radian) + Math.cos(src_Lat_radian) * Math.cos(dst_Lat_radian) * Math.cos(src_Lon_radian - dst_Lon_radian));

          var radian_bearing = Math.acos((Math.sin(dst_Lat_radian) - Math.sin(src_Lat_radian) * Math.cos(radian_distance)) / (Math.cos(src_Lat_radian) * Math.sin(radian_distance)));        // acos의 인수로 주어지는 x는 360분법의 각도가 아닌 radian(호도)값이다.

          var true_bearing = 0;
          if (Math.sin(dst_Lon_radian - src_Lon_radian) < 0){
              true_bearing = radian_bearing * (180 / Math.PI);
              true_bearing = 360 - true_bearing;
          }
          else{
              true_bearing = radian_bearing * (180 / Math.PI);
          }

         return true_bearing;

      }

      if (flags.turnUp) {
          camera.lookUp(moveRate);
      }
      if (flags.turnDown) {
          camera.lookDown(moveRate);
      }
      if (flags.turnRight) {
          camera.lookRight(moveRate);
      }
      if (flags.turnLeft) {
          camera.lookLeft(moveRate);
      }
      if (flags.moveFront) {

          if(cameraMoveMode == 1 && camera.direction == dstDirection){
              console.log("move mode : 1, now on dst");
              nowEdge = null;
              cameraMoveMode = 0;
          }else if(cameraMoveMode == 1
                   && camera.heading == getHeading(srcDirection, dstDirection)){
              console.log("move mode : 1, goingon");
              camera.moveForward(moveRate);
          }
          else{
              console.log("move mode : 0, find edge");
              function isConnectedFirstNode(value){
                  if (value.connects[0] == edges[2500].connects[0])
                          return true;
              }

              var connectedEdge = edges.filter(isConnectedFirstNode);
              var curHeading = Cesium.Math.toDegrees(camera.heading);
              var near = 10000;
              for(i = 0; i < connectedEdge.length; i++){

                      var tmpDst = new Cesium.Cartesian3(connectedEdge[i].stateMembers[1].coordinates[0],
                                        connectedEdge[i].stateMembers[1].coordinates[1],
                                        connectedEdge[i].stateMembers[1].coordinates[2]);
                      var tmpHeading = getHeading(srcDirection, tmpDst);
                      console.log("tmpHeading : "+tmpHeading+", carmeraHeading : "+curHeading);
                      if(tmpHeading-5< curHeading
                         && curHeading < tmpHeading+5
                         && Math.abs(tmpHeading-curHeading)<near){
                          cameraMoveMode = 1;
                          dstDirection = tmpDst;
                          camera.moveForward(moveRate);
                          near = Math.abs(tmpHeading-curHeading);
                          console.log("find edge : "+cameraMoveMode);
                      }
              }
          }
      }
      if (flags.moveBack) {
          camera.moveBackward(moveRate);
      }
  });


  camera.setView({
      destination : srcDirection,
      orientation: {
          heading : Cesium.Math.toRadians(0),
          pitch : Cesium.Math.toRadians(0),
          roll : 0.0
      }
  });

  // var patt = new RegExp("Usage=Stair");
  // for (var i = 0; i < cellSpaceMembers.length; i++) {
  //   if (patt.test(cellSpaceMembers[i].description) == true) {
  //     console.log(cellSpaceMembers[i].description);
  //     console.log(cellSpaceMembers[i].href);
  //   }
  // }
  // Moving from one floor to another
  document.getElementById('floor1').addEventListener("click",function(){
    // for (var i = 0; i < edges.length; i++) {
      // if (edges[i].connects[0] == "#R1414" || edges[i].connects[1] == "#R1414") {
        viewer.camera.flyTo({
            destination : new Cesium.Cartesian3(edges[249].stateMembers[2].coordinates[0],
                                                edges[249].stateMembers[2].coordinates[1],
                                                edges[249].stateMembers[2].coordinates[2]),
            orientation: {
                heading : Cesium.Math.toRadians(0),
                pitch : Cesium.Math.toRadians(0),
                roll : 0.0
            }

        });
        // console.log(i);
      // }
    // }
  });


  var headingSpan = document.getElementById('heading');

  viewer.scene.preRender.addEventListener(function(scene, time) {
      headingSpan.innerHTML = Cesium.Math.toDegrees(camera.heading).toFixed(1);
  });

}
