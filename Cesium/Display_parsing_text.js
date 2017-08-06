// This script is for displaying Lotte World Mall in 3D using Cesium
// The navigation tools are not included
// you can find them in the Navigation.js file
function loadJSON(callback) {

	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
	xobj.open('GET', 'addstair.json', true);
	xobj.onreadystatechange = function () {
		// When response is ready
		if (xobj.readyState == 4 && xobj.status == 200) {

			// .open will NOT return a value but simply returns undefined in async mode so use a callback
			callback(xobj.responseText);

		}
	}
	xobj.send(null);
}

// Call to function with anonymous callback
loadJSON(function (response) {

	// Parsing the json response.
	jsonresponse = JSON.parse(response);
	console.log(jsonresponse);
	
	setCellSpaceMemberLen(jsonresponse);

	// Loop through cellSpaceMembers and creating instances
	setCellSapceMembers(jsonresponse);
	setCenterOfBuilding();
	
//	var position = Cesium.Cartesian3.fromDegrees(127.1034, 37.51283, 0); // Center of LWM
//	
//	setAngle(0.43);// Rotation angle
//	rotateCellSpaceMember(position);

	setGeometryInstanceAndSaveTextForSketchUp();

	// Adding instances to primitives
	scene.primitives.add(new Cesium.Primitive({
		geometryInstances: instances,
		appearance: new Cesium.PerInstanceColorAppearance({
			faceForward: true,
			flat: true,
			translucent: false,
			closed: false
		}),
	}));

	scene.primitives.add(new Cesium.Primitive({
		geometryInstances: outlineInstances,
		appearance: new Cesium.PerInstanceColorAppearance({
			flat: true,
			renderState: {
				depthTest: {
					enabled: true,
					func: Cesium.DepthFunction.LESS
				},
				lineWidth: Math.min(3.0, viewer.scene.maximumAliasedLineWidth)
			}
		})
	}));


	// Working on the graph elements
	// State Member Class
	function stateMember(coordinates) {
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

		stateMemberObject.coordinates.push(coordinates[0], coordinates[1], coordinates[2]);

		// Adding the state member to the nodes array
		nodes.push(stateMemberObject);
	}


	// Transition member Class
	function transitionMember(connects, description, coordinates) {
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
		var description;
		if (tm[i].transition.description != null) {
			description = tm[i].transition.description.value;
		}
		//        var description = tm[i].transition.description.value;


		// Array of state members
		var stateMembers = [];

		// Getting coordinates of each state member
		for (var k = 0; k < tm[i].transition.geometry.abstractCurve.value.posOrPointPropertyOrPointRep.length; k++) {
			// Creating a state member instance
			var smObject = new stateMember([]);
			var coordinates = tm[i].transition.geometry.abstractCurve.value.posOrPointPropertyOrPointRep[k].value.value;
			smObject.coordinates.push(coordinates[0], coordinates[1], coordinates[2]);
			stateMembers.push(smObject);
		}

		// Creating a transition member instance
		var transitionMemberObject = new transitionMember(connects, description, stateMembers);

		// Adding the transition member to edges array
		edges.push(transitionMemberObject);

	}

		var orientation = new Cesium.Matrix4(Math.cos(angle), -Math.sin(angle), 0, 0,
		Math.sin(angle), Math.cos(angle), 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1); // Rotation matrix

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
	for (i = 0; i < edges.length; i++) {

		var line = viewer.entities.add({
			name: 'line ' + edges[i].connects,
			polyline: {
				positions: [
            new Cesium.Cartesian3(
						edges[i].stateMembers[0].coordinates[0],
						edges[i].stateMembers[0].coordinates[1],
						edges[i].stateMembers[0].coordinates[2]),
            new Cesium.Cartesian3(
						edges[i].stateMembers[1].coordinates[0],
						edges[i].stateMembers[1].coordinates[1],
						edges[i].stateMembers[1].coordinates[2])
            ],
				followSurface: new Cesium.ConstantProperty(false),
				width: new Cesium.ConstantProperty(20),
				distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8.0),
				material: Cesium.Color.BLACK
			}
		});
	}




	navigate(nodes, edges);
});


function destroyClickedElement(event) {
	document.body.removeChild(event.target);
}

function saveFile(fileName, str) {
	var textToSave = str;
	var textToSaveAsBlob = new Blob([textToSave], {
		type: "text/plain"
	});
	var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
	var fileNameToSaveAs = fileName;

	var downloadLink = document.createElement("a");
	downloadLink.download = fileNameToSaveAs;
	downloadLink.innerHTML = "Download File";
	downloadLink.href = textToSaveAsURL;
	downloadLink.onclick = destroyClickedElement;
	downloadLink.style.display = "none";
	document.body.appendChild(downloadLink);

	downloadLink.click();
}
