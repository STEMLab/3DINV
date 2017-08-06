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
	
	setPosition(new Cesium.Cartesian3.fromDegrees(129.082678, 35.234794, 0));

	setAngle(0.63);// Rotation angle
	rotateCellSpaceMember(position);

	setGeometryInstance();
	
//	saveTextFileForSketchUp(700);

	// Adding instances to primitives
	addInstancesToPrimitives();
	addOutlineInstancesToPrimitives();
	


	// Working on the graph elements
	setNodesFromStateMember(jsonresponse);
	setEdgesFromTransitionMember(jsonresponse);
	
	rotateNodes();
	rotateEdges();


	displayEdges();


	// call navigation setting function
	setNavigatorUI();
});

