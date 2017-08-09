/*
*
* This script is for displaying Lotte World Mall in 3D using Cesium
* functions and variables that using in this example are exesit in Display_variables.js, Display_functions.js.
* If you have some file to diplay change 'sample_data_lwm_3d.json' to that file.
*
*/

function loadJSON(callback) {

	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
	xobj.open('GET', 'sample_data_lwm_3d.json', true);
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
	setCellSapceBoundaryMembers(jsonresponse);
	
	setCenterOfBuilding();
	
  
	setPosition(new Cesium.Cartesian3.fromDegrees(127.1034,37.51283,0));
	setAngle(0.43);

	rotateCellSpaceMember(position);
	rotateCellSpaceBoundaryMembers(position);

	setGeometryInstance();
	

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

