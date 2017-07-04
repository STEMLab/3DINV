function loadJSON(callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'sample_data_lwm_3d.json', true);
    xobj.onreadystatechange = function() {
        // When response is ready
        if (xobj.readyState == 4 && xobj.status == 200) {

            // .open will NOT return a value but simply returns undefined in async mode so use a callback
            callback(xobj.responseText);

        }
    }
    xobj.send(null);

}

loadJSON(function(response) {

    // Parsing the json response.
    jsonresponse = JSON.parse(response);

    // State Member Class
    function stateMember(coordinates){
      this.coordinates = coordinates; // Array of coordinates
    }

    // Array of nodes
    var nodes = [];

    // Variables where the maximum and minimum coordinates will be stored
    var x_max = 0;
    var y_max = 0;
    var z_max = 0;

    var x_min = 0;
    var y_min = 0;
    var z_min = 0;

    // Extracting state members
    var sm = jsonresponse.value.multiLayeredGraph.spaceLayers["0"].spaceLayerMember["0"].spaceLayer.nodes["0"].stateMember;

    // Loop through state members and extracting each state member coordinates
    for (var i = 0; i < sm.length; i++) {

        // Creating a state member instance
        var stateMemberObject = new stateMember([]);

        // X,Y,Z coordinates of a state member
        var coordinates = sm[i].state.geometry.point.pos.value;

        // Getting the maximum and minimum coordinates
        if (coordinates[0] > x_max) {
            x_max = coordinates[0];
        }
        else if (coordinates[0] < x_min) {
            x_min = coordinates[0];
        }
        if (coordinates[1] > y_max) {
            y_max = coordinates[1];
        }
        else if (coordinates[1] < y_min) {
            y_min = coordinates[1];
        }
        if (coordinates[2] > z_max) {
            z_max = coordinates[2];
        }
        else if (coordinates[2] < z_min) {
            z_min = coordinates[2];
        }

        stateMemberObject.coordinates.push(coordinates[0],coordinates[1],coordinates[2]);

        // Adding the state member to the nodes array
        nodes.push(stateMemberObject);
    }


    // Transition member Class
    function transitionMember(connects,description,coordinates){
      this.connects = connects; // Array of href
      this.description = description; // information about section and floor...
      this.stateMembers = stateMembers; // Array of state members, each state member has X,Y,Z coordinates
    }

    // Array of edges
    var edges = [];

    // Variables where the maximum and minimum coordinates will be stored
    var max_x = 0;
    var max_y = 0;
    var max_z = 0;

    var min_x = 0;
    var min_y = 0;
    var min_z = 0;

    // Extracting transition members
    var tm = jsonresponse.value.multiLayeredGraph.spaceLayers["0"].spaceLayerMember["0"].spaceLayer.edges["0"].transitionMember;

    // Loop through transition Members and extracting connection, description and state members of each transition member
    for (var i = 0; i < tm.length; i++) {

        // Array of connections of a transition member
        var connects = [];

        // Getting the href of each connection
        for (var j = 0; j < tm[i].transition.connects.length; j++) {
              connects.push(tm[i].transition.connects[j].href);
        }

        // Description of a transition member
        var description = tm[i].transition.description.value;

        // Array of state members
        var stateMembers = [];

        // Getting coordinates of each state member
        for (var k = 0; k < tm[i].transition.geometry.abstractCurve.value.posOrPointPropertyOrPointRep.length; k++) {
            // Creating a state member instance
            var smObject = new stateMember([]);
            var coordinates = tm[i].transition.geometry.abstractCurve.value.posOrPointPropertyOrPointRep[k].value.value;
            smObject.coordinates.push(coordinates[0],coordinates[1],coordinates[2]);

            // Getting the maximum and minimum coordinates
            if (coordinates[0] > max_x) {
                max_x = coordinates[0];
            }
            else if (coordinates[0] < min_x) {
                min_x = coordinates[0];
            }
            if (coordinates[1] > max_y) {
                max_y = coordinates[1];
            }
            else if (coordinates[1] < min_y) {
                min_y = coordinates[1];
            }
            if (coordinates[2] > max_z) {
                max_z = coordinates[2];
            }
            else if (coordinates[2] < min_z) {
                min_z = coordinates[2];
            }

            stateMembers.push(smObject);
        }

        // Creating a transition member instance
        var transitionMemberObject = new transitionMember(connects,description,stateMembers);

        // Adding the transition member to edges array
        edges.push(transitionMemberObject);

    }


    // Applying translation and rotation to the nodes
    var x_center = (x_max + x_min) / 2;
    var y_center = (y_max + y_min) / 2;
    var ellipsoid = viewer.scene.globe.ellipsoid;
    var position = Cesium.Cartesian3.fromDegrees(127.1034,37.51283,0); // Center of LWM
    var ENU = new Cesium.Matrix4(); // The object onto which to store the transformation result
    Cesium.Transforms.eastNorthUpToFixedFrame(position,ellipsoid,ENU);
    var angle = 0.43; // Rotation angle
    var orientation  = new Cesium.Matrix4(Math.cos(angle),-Math.sin(angle),0,0,
                                          Math.sin(angle), Math.cos(angle),0,0,
                                          0,0,1,0,
                                          0,0,0,1); // Rotation matrix

    for (var i = 0; i < nodes.length; i++) {

      // Translating coordinates + converting the result to Cartesian3
      var offset = new Cesium.Cartesian3(nodes[i].coordinates[0] - x_center,
                                         nodes[i].coordinates[1] - y_center,
                                         nodes[i].coordinates[2] - z_min);

      // Applying rotation to the offset
      var finalPos = Cesium.Matrix4.multiplyByPoint(orientation, offset, new Cesium.Cartesian3());

      // Report offset to the actual position of LWM
      var new_coord = Cesium.Matrix4.multiplyByPoint(ENU, finalPos, finalPos);

      // Replacing the old coordinates by the new ones
      nodes[i].coordinates[0] = new_coord.x;
      nodes[i].coordinates[1] = new_coord.y;
      nodes[i].coordinates[2] = new_coord.z;

    }

    var center_x = (max_x + min_x) / 2;
    var center_y = (max_x + min_y) / 2;

    for (var i = 0; i < edges.length; i++) {

      for (var j = 0; j < edges[i].stateMembers.length; j++) {

          var offset = new Cesium.Cartesian3(edges[i].stateMembers[j].coordinates[0] - center_x,
                                             edges[i].stateMembers[j].coordinates[1] - center_y,
                                             edges[i].stateMembers[j].coordinates[2] - min_z);

          var finalPos = Cesium.Matrix4.multiplyByPoint(orientation, offset, new Cesium.Cartesian3());

          var new_coord = Cesium.Matrix4.multiplyByPoint(ENU, finalPos, finalPos);

          edges[i].stateMembers[j].coordinates[0] = new_coord.x;
          edges[i].stateMembers[j].coordinates[1] = new_coord.y;
          edges[i].stateMembers[j].coordinates[2] = new_coord.z;

      }


    }

    //console.log(nodes);
    console.log(edges);











    // var scene = viewer.scene;
    // var canvas = viewer.canvas;
    //     canvas.setAttribute('tabindex', '0'); // needed to put focus on the canvas
    //     canvas.onclick = function() {
    //         canvas.focus();
    //     };
    // var ellipsoid = scene.globe.ellipsoid;
    // var camera = viewer.camera;
    // var controller = scene.screenSpaceCameraController;
    //
    // // disable the default event handlers
    // scene.screenSpaceCameraController.enableRotate = false;
    // scene.screenSpaceCameraController.enableTranslate = false;
    // scene.screenSpaceCameraController.enableZoom = false;
    // scene.screenSpaceCameraController.enableTilt = false;
    // scene.screenSpaceCameraController.enableLook = false;
    //
    // var startMousePosition;
    // var mousePosition;
    // var flags = {
    //     looking : false,
    //     moveForward : false,
    //     moveBackward : false,
    //     moveUp : false,
    //     moveDown : false,
    //     moveLeft : false,
    //     moveRight : false
    // };
    //
    // var handler = new Cesium.ScreenSpaceEventHandler(canvas);
    //
    // handler.setInputAction(function(movement) {
    //     flags.looking = true;
    //     mousePosition = startMousePosition = Cesium.Cartesian3.clone(movement.position);
    // }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    //
    // handler.setInputAction(function(movement) {
    //     mousePosition = movement.endPosition;
    // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    //
    // handler.setInputAction(function(position) {
    //     flags.looking = false;
    // }, Cesium.ScreenSpaceEventType.LEFT_UP);
    //
    // function getFlagForKeyCode(keyCode) {
    //     switch (keyCode) {
    //     case 'W'.charCodeAt(0):
    //         return 'turnUp';
    //     case 'S'.charCodeAt(0):
    //         return 'turnDown';
    //     case 'Q'.charCodeAt(0):
    //         return 'moveFront';
    //     case 'E'.charCodeAt(0):
    //         return 'moveBack';
    //     case 'D'.charCodeAt(0):
    //         return 'turnRight';
    //     case 'A'.charCodeAt(0):
    //         return 'turnLeft';
    //     default:
    //         return undefined;
    //     }
    // }
    //
    // document.addEventListener('keydown', function(e) {
    //     var flagName = getFlagForKeyCode(e.keyCode);
    //     if (typeof flagName !== 'undefined') {
    //         flags[flagName] = true;
    //     }
    // }, false);
    //
    // document.addEventListener('keyup', function(e) {
    //     var flagName = getFlagForKeyCode(e.keyCode);
    //     if (typeof flagName !== 'undefined') {
    //         flags[flagName] = false;
    //     }
    // }, false);
    //
    // var cameraMoveMode = 0;
    // var dstDirection = null;
    // var srcDirection = new Cesium.Cartesian3(edges[2500].stateMembers[0].coordinates[0],
    //                                          edges[2500].stateMembers[0].coordinates[1],
    //                                          edges[2500].stateMembers[0].coordinates[2]);
    //
    //
    // viewer.clock.onTick.addEventListener(function(clock) {
    //     var camera = viewer.camera;
    //
    //     if (flags.looking) {
    //         var width = canvas.clientWidth;
    //         var height = canvas.clientHeight;
    //
    //         // Coordinate (0.0, 0.0) will be where the mouse was clicked.
    //         var x = (mousePosition.x - startMousePosition.x) / width;
    //         var y = -(mousePosition.y - startMousePosition.y) / height;
    //
    //         var lookFactor = 0.05;
    //         camera.lookRight(x * lookFactor);
    //         camera.lookUp(y * lookFactor);
    //     }
    //
    //     // Change movement speed based on the distance of the camera to the surface of the ellipsoid.
    //     var moveRate = ellipsoid.cartesianToCartographic(camera.position).height / 100.0;
    //     var turnRate = ellipsoid.cartesianToCartographic(camera.position).width / 100.0;
    //
    //     function getHeading(src, dst){
    //         var src_Lat_radian = src.x *(Math.PI/180);
    //         var src_Lon_radian = src.y *(Math.PI/180);
    //         var dst_Lat_radian = dst.x *(Math.PI/180);
    //         var dst_Lon_radian = dst.x *(Math.PI/180);
    //
    //         var radian_distance = 0;
    //         radian_distance = Math.acos(Math.sin(src_Lat_radian) * Math.sin(dst_Lat_radian) + Math.cos(src_Lat_radian) * Math.cos(dst_Lat_radian) * Math.cos(src_Lon_radian - dst_Lon_radian));
    //
    //         var radian_bearing = Math.acos((Math.sin(dst_Lat_radian) - Math.sin(src_Lat_radian) * Math.cos(radian_distance)) / (Math.cos(src_Lat_radian) * Math.sin(radian_distance)));        // acos의 인수로 주어지는 x는 360분법의 각도가 아닌 radian(호도)값이다.
    //
    //         var true_bearing = 0;
    //         if (Math.sin(dst_Lon_radian - src_Lon_radian) < 0){
    //             true_bearing = radian_bearing * (180 / Math.PI);
    //             true_bearing = 360 - true_bearing;
    //         }
    //         else{
    //             true_bearing = radian_bearing * (180 / Math.PI);
    //         }
    //
    //        return true_bearing;
    //
    //     }
    //
    //     if (flags.turnUp) {
    //         camera.lookUp(moveRate);
    //     }
    //     if (flags.turnDown) {
    //         camera.lookDown(moveRate);
    //     }
    //     if (flags.turnRight) {
    //         camera.lookRight(moveRate);
    //     }
    //     if (flags.turnLeft) {
    //         camera.lookLeft(moveRate);
    //     }
    //     if (flags.moveFront) {
    //
    //         if(cameraMoveMode == 1 && camera.direction == dstDirection){
    //             console.log("move mode : 1, now on dst");
    //             nowEdge = null;
    //             cameraMoveMode = 0;
    //         }else if(cameraMoveMode == 1
    //                  && camera.heading == getHeading(srcDirection, dstDirection)){
    //             console.log("move mode : 1, goingon");
    //             camera.moveForward(moveRate);
    //         }
    //         else{
    //             console.log("move mode : 0, find edge");
    //             function isConnectedFirstNode(value){
    //                 if (value.connects[0] == edges[2500].connects[0])
    //                         return true;
    //             }
    //
    //             var connectedEdge = edges.filter(isConnectedFirstNode);
    //             var curHeading = Cesium.Math.toDegrees(camera.heading);
    //             var near = 10000;
    //             for(i = 0; i < connectedEdge.length; i++){
    //
    //                     var tmpDst = new Cesium.Cartesian3(connectedEdge[i].stateMembers[1].coordinates[0],
    //                                       connectedEdge[i].stateMembers[1].coordinates[1],
    //                                       connectedEdge[i].stateMembers[1].coordinates[2]);
    //                     var tmpHeading = getHeading(srcDirection, tmpDst);
    //                     console.log("tmpHeading : "+tmpHeading+", carmeraHeading : "+curHeading);
    //                     if(tmpHeading-5< curHeading
    //                        && curHeading < tmpHeading+5
    //                        && Math.abs(tmpHeading-curHeading)<near){
    //                         cameraMoveMode = 1;
    //                         dstDirection = tmpDst;
    //                         camera.moveForward(moveRate);
    //                         near = Math.abs(tmpHeading-curHeading);
    //                         console.log("find edge : "+cameraMoveMode);
    //                     }
    //             }
    //         }
    //     }
    //     if (flags.moveBack) {
    //         camera.moveBackward(moveRate);
    //     }
    // });
    //
    //
    // camera.setView({
    //     destination : srcDirection,
    //     orientation: {
    //         heading : Cesium.Math.toRadians(0),
    //         pitch : Cesium.Math.toRadians(0),
    //         roll : 0.0
    //     }
    // });
    //
    // var headingSpan = document.getElementById('heading');
    //
    // viewer.scene.preRender.addEventListener(function(scene, time) {
    //     headingSpan.innerHTML = Cesium.Math.toDegrees(camera.heading).toFixed(1);
    // });

    for(i = 0 ; i < edges.length; i++){
    var line = viewer.entities.add({
    name : 'line '+edges[i].connects,
    polyline : {
        positions : Cesium.Cartesian3([edges[i].stateMembers[0].coordinates[0],
                                                                edges[i].stateMembers[0].coordinates[1],
                                                                edges[i].stateMembers[0].coordinates[2],
                                                                edges[i].stateMembers[1].coordinates[0],
                                                                edges[i].stateMembers[1].coordinates[1],
                                                                edges[i].stateMembers[1].coordinates[2]]),
        followSurface : false,
        width : 1,
        material : Cesium.Color.WHITE
    }
});
}
});
