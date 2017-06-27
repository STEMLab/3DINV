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

    console.log(nodes[0],edges[0]);

  


});
