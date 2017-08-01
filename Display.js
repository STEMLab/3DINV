// This script is for displaying Lotte World Mall in 3D using Cesium
// The navigation tools are not included
// you can find them in the Navigation.js file


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

// Call to function with anonymous callback
loadJSON(function(response) {

    // Parsing the json response.
    jsonresponse = JSON.parse(response);
    console.log(jsonresponse);

    // Creating the cellSpaceMember Class
    function cellSpaceMember(description,href,surfaceMember){
      this.description = description; // Description contains information about section and floor ... etc
      this.href = href; // Duality
      this.surfaceMember = surfaceMember; // Array of surface members
    }

    // Creating the surfaceMember Class`
    function surfaceMember(coordinates){
      this.coordinates = coordinates; //Array of surfaceMember coordinates
    }

    // Array of cellSpaceMember instances
    var cellSpaceMembers = [];

    // Number of cell space members
    var cellSpaceMemberLen = jsonresponse.value.primalSpaceFeatures.primalSpaceFeatures.cellSpaceMember.length;

    // Variables where the maximum coordinates will be stored
    var max_X = 0;
    var max_Y = 0;
    var max_Z = 0;

    // Variables where the minimum coordinates will be stored
    var min_X = 0;
    var min_Y = 0;
    var min_Z = 0;

    // Loop through cellSpaceMembers and creating instances
    for (var i = 0; i < cellSpaceMemberLen; i++) {

      // Cell space member
      var csm = jsonresponse.value.primalSpaceFeatures.primalSpaceFeatures.cellSpaceMember[i];

      // Extracting the description of the cell space member
      var description = csm.abstractFeature.value.description.value;

      // Extracting the href of the cell space member
      var href = csm.abstractFeature.value.duality.href;

      // Creating an instance of the cell space member
      var csmObject = new cellSpaceMember(description,href,[]);

      // Number of surface members
      var surfaceMemberLen = csm.abstractFeature.value.geometry3D.abstractSolid.value.exterior.shell.surfaceMember.length;

      // Loop through the surface members and creating instances;
      for (var j = 0; j < surfaceMemberLen ; j++) {

          // Surface member
          var sm = csm.abstractFeature.value.geometry3D.abstractSolid.value.exterior.shell.surfaceMember[j];

          // Creating an instance of the surface member
          var smObject = new surfaceMember([]);

          // Number of coordinates of the surface member
          var coordLen = sm.abstractSurface.value.exterior.abstractRing.value.posOrPointPropertyOrPointRep.length;

          // Loop through the coordinates of a surfaceMember
          for (var k = 0; k < coordLen; k++) {

              // Extracting X
              var X = sm.abstractSurface.value.exterior.abstractRing.value.posOrPointPropertyOrPointRep[k].value.value[0];
              smObject.coordinates.push(X);

              // Test if X is maximum or minimum
              if (X > max_X) {
                  max_X = X;
              }
              else if (X < min_X) {
                  min_X = X;
              }

              // Extracting Y
              var Y = sm.abstractSurface.value.exterior.abstractRing.value.posOrPointPropertyOrPointRep[k].value.value[1];
              smObject.coordinates.push(Y);

              if (Y > max_Y) {
                  max_Y = Y;
              }
              else if (Y < min_Y) {
                  min_Y = Y;
              }

              // Extracting Z
              var Z = sm.abstractSurface.value.exterior.abstractRing.value.posOrPointPropertyOrPointRep[k].value.value[2];
              smObject.coordinates.push(Z);

              if (Z > max_Z) {
                  max_Z = Z;
              }
              else if (Z < min_Z) {
                  min_Z = Z;
              }

          }

          //Adding the surface member to the corresponding cell space member
          csmObject.surfaceMember.push(smObject);
      }

      // Filling the array with the cell space member instancesBut the problem with outline has not been solved yet.
      cellSpaceMembers.push(csmObject);

    }

    // Center of Lotte World Mall
    var center_X = (min_X + max_X) / 2;
    var center_Y = (min_Y + max_Y) / 2;


    var ellipsoid = viewer.scene.globe.ellipsoid;
    var position = Cesium.Cartesian3.fromDegrees(127.1034,37.51283,0); // Center of LWM
    var ENU = new Cesium.Matrix4(); // The object onto which to store the transformation result
    Cesium.Transforms.eastNorthUpToFixedFrame(position,ellipsoid,ENU);
    var angle = 0.43; // Rotation angle
    var orientation  = new Cesium.Matrix4(Math.cos(angle),-Math.sin(angle),0,0,
                                          Math.sin(angle), Math.cos(angle),0,0,
                                          0,0,1,0,
                                          0,0,0,1); // Rotation matrix

    // Applying translation and rotation to coordinates
    for (var i = 0; i < cellSpaceMembers.length; i++) {

      var csmLen = cellSpaceMembers[i].surfaceMember.length;

        for (var j = 0; j < csmLen; j++) {

          var smLen = cellSpaceMembers[i].surfaceMember[j].coordinates.length;

            for (var k = 0; k < smLen; k += 3) {

                // Translating coordinates + converting the result to Cartesian3
                var offset = new Cesium.Cartesian3(cellSpaceMembers[i].surfaceMember[j].coordinates[k] - center_X,
                                                   cellSpaceMembers[i].surfaceMember[j].coordinates[k + 1] - center_Y,
                                                   cellSpaceMembers[i].surfaceMember[j].coordinates[k + 2] - min_Z);

                // Applying rotation to the offset
                var finalPos = Cesium.Matrix4.multiplyByPoint(orientation, offset, new Cesium.Cartesian3());

                // Report offset to the actual position of LWM
                var new_coord = Cesium.Matrix4.multiplyByPoint(ENU, finalPos, finalPos);

                // Replacing the old coordinates by the new ones
                cellSpaceMembers[i].surfaceMember[j].coordinates[k] = new_coord.x;
                cellSpaceMembers[i].surfaceMember[j].coordinates[k + 1] = new_coord.y;
                cellSpaceMembers[i].surfaceMember[j].coordinates[k + 2] = new_coord.z;

            }
        }
    }
    
    
    // Drawing polygones using primitives
    var scene = viewer.scene;

    // Array of instances
    var instances = [];
    var outlineInstances = [];
    var roomColor = [Cesium.Color.fromBytes(227, 253, 253), 
                     Cesium.Color.fromBytes(203, 241, 245), 
                     Cesium.Color.fromBytes(166, 227, 233), 
                     Cesium.Color.fromBytes(113, 201, 206)];
    
    // Loop through cell space members and creating geometry instances
    for (var i = 0; i < cellSpaceMembers.length; i++) {
        for (var j = 0; j < cellSpaceMembers[i].surfaceMember.length; j++) {
              instances.push(new Cesium.GeometryInstance({
                  geometry : new Cesium.PolygonGeometry({
                      polygonHierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.unpackArray(cellSpaceMembers[i].surfaceMember[j].coordinates)),
                      perPositionHeight : true
                  }),
                  attributes : {
                      color : Cesium.ColorGeometryInstanceAttribute.fromColor(roomColor[i%4])
                  }
              }));
            
            outlineInstances.push(new Cesium.GeometryInstance({
                geometry : new Cesium.PolygonOutlineGeometry({
                    polygonHierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.unpackArray(cellSpaceMembers[i].surfaceMember[j].coordinates)),
                    perPositionHeight : true,
                }),
                attributes : {
                    color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLACK)
                }
            }));
        }
    }
    
    // Adding instances to primitives
    scene.primitives.add(new Cesium.Primitive({
        geometryInstances : instances,
        appearance : new Cesium.PerInstanceColorAppearance({
            faceForward : true,
            flat : true,
            translucent : false,
			closed : false
        }),
    }));
    
    scene.primitives.add(new Cesium.Primitive({
        geometryInstances : outlineInstances,
        appearance : new Cesium.PerInstanceColorAppearance({
            flat : true,
            renderState : {
                depthTest : {
                    enabled : true,
                    func : Cesium.DepthFunction.LESS
                },
				lineWidth : Math.min(3.0, viewer.scene.maximumAliasedLineWidth)
            }
		})
    }));


    // Working on the graph elements
    // State Member Class
    function stateMember(coordinates){
      this.coordinates = coordinates; // Array of coordinates
    }

    // Array of nodes
    var nodes = [];

    // Extracting state members
    var sm = jsonresponse.value.multiLayeredGraph.spaceLayers["0"].spaceLayerMember["0"].spaceLayer.nodes["0"].stateMember;

    // Loop through state members and extracting each state member coordinates
    for (var i = 0; i < sm.length; i++) {

        // Creating a state member instance
        var stateMemberObject = new stateMember([]);

        // X,Y,Z coordinates of a state member
        var coordinates = sm[i].state.geometry.point.pos.value;

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
    for (var i = 0; i < nodes.length; i++) {

      // Translating coordinates + converting the result to Cartesian3
      var offset = new Cesium.Cartesian3(nodes[i].coordinates[0] - center_X,
                                         nodes[i].coordinates[1] - center_Y,
                                         nodes[i].coordinates[2] - min_Z);

      // Applying rotation to the offset
      var finalPos = Cesium.Matrix4.multiplyByPoint(orientation, offset, new Cesium.Cartesian3());

      // Report offset to the actual position of LWM
      var new_coord = Cesium.Matrix4.multiplyByPoint(ENU, finalPos, finalPos);

      // Replacing the old coordinates by the new ones
      nodes[i].coordinates[0] = new_coord.x;
      nodes[i].coordinates[1] = new_coord.y;
      nodes[i].coordinates[2] = new_coord.z;

    }
    // Applying translation and rotation to the edges
    for (var i = 0; i < edges.length; i++) {

      for (var j = 0; j < edges[i].stateMembers.length; j++) {

          var offset = new Cesium.Cartesian3(edges[i].stateMembers[j].coordinates[0] - center_X,
                                             edges[i].stateMembers[j].coordinates[1] - center_Y,
                                             edges[i].stateMembers[j].coordinates[2] - min_Z);

          var finalPos = Cesium.Matrix4.multiplyByPoint(orientation, offset, new Cesium.Cartesian3());

          var new_coord = Cesium.Matrix4.multiplyByPoint(ENU, finalPos, finalPos);

          edges[i].stateMembers[j].coordinates[0] = new_coord.x;
          edges[i].stateMembers[j].coordinates[1] = new_coord.y;
          edges[i].stateMembers[j].coordinates[2] = new_coord.z;

      }


    }

    // Displaying the edges
    for(i = 0 ; i < edges.length; i++){

      var line = viewer.entities.add({
        name : 'line ' + edges[i].connects,
        polyline : {
          positions : [
            new Cesium.Cartesian3(
              edges[i].stateMembers[0].coordinates[0],
              edges[i].stateMembers[0].coordinates[1],
              edges[i].stateMembers[0].coordinates[2]),
            new Cesium.Cartesian3(
              edges[i].stateMembers[1].coordinates[0],
              edges[i].stateMembers[1].coordinates[1],
              edges[i].stateMembers[1].coordinates[2])
            ],
          followSurface : new Cesium.ConstantProperty(false),
          width : new Cesium.ConstantProperty(20),
          distanceDisplayCondition : new Cesium.DistanceDisplayCondition(0, 8.0),
          material : Cesium.Color.BLACK
        }
      });
    }
	
    
    navigate(nodes, edges);
});


