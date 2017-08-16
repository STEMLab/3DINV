function setCellSpaceMemberLen(jsonresponse) {
	cellSpaceMemberLen = jsonresponse.value.primalSpaceFeatures.primalSpaceFeatures.cellSpaceMember.length;
}

// Abstract coordinates from value and save it in object.coordinates
function abstractCoordination(value, object) {
	// Extracting X
	var X = value[0];
	object.coordinates.push(X);


	// Test if X is maximum or minimum
	if (X > max_X) {
		max_X = X;
	} else if (X < min_X) {
		min_X = X;
	}

	// Extracting Y
	var Y = value[1];
	object.coordinates.push(Y);

	if (Y > max_Y) {
		max_Y = Y;
	} else if (Y < min_Y) {
		min_Y = Y;
	}

	// Extracting Z
	var Z = value[2];
	object.coordinates.push(Z);

	if (Z > max_Z) {
		max_Z = Z;
	} else if (Z < min_Z) {
		min_Z = Z;
	}

	return object;
}

// Return surface member values from cellspaceMember when geometry is 3D.
function getGeometry3DSurfaceMenber(csm, csmObject) {
	// get surface MemberLen
	surfaceMemberLen = csm.abstractFeature.value.geometry3D.abstractSolid.value.exterior.shell.surfaceMember.length;

	// Loop through the surface members and creating instances;
	for (var j = 0; j < surfaceMemberLen; j++) {

		// Surface member
		var sm = csm.abstractFeature.value.geometry3D.abstractSolid.value.exterior.shell.surfaceMember[j];

		// Creating an instance of the surface member
		var smObject = new surfaceMember([]);

		// Number of coordinates of the surface member
		var coordLen = sm.abstractSurface.value.exterior.abstractRing.value.posOrPointPropertyOrPointRep.length;

		// Loop through the coordinates of a surfaceMember
		for (var k = 0; k < coordLen; k++) {
			smObject = abstractCoordination(sm.abstractSurface.value.exterior.abstractRing.value.posOrPointPropertyOrPointRep[k].value.value, smObject);
		}

		//Adding the surface member to the corresponding cell space member
		csmObject.surfaceMember.push(smObject);
	}

	return csmObject;
}

function getGeometry3DSurfaceMenberFromCSBM(csbm, csbmObject) {
	// get surface MemberLen
	var smObject = new surfaceMember([]);

	if (csbm.abstractFeature.value.geometry3D.abstractSurface.value.exterior != null) {

		coordLen = csbm.abstractFeature.value.geometry3D.abstractSurface.value.exterior.abstractRing.value.posOrPointPropertyOrPointRep.length;

		for (var k = 0; k < coordLen; k++) {
			smObject = abstractCoordination(csbm.abstractFeature.value.geometry3D.abstractSurface.value.exterior.abstractRing.value.posOrPointPropertyOrPointRep[k].value.value, smObject);
		}


	}
	csbmObject.surfaceMember.push(smObject);
	return csbmObject;
}

// Return surface member values from cellspaceMember data when geometry is 2D.
function getGeometry2DSurfaceMenber(csm, csmObject) {
	// get surface MemberLen
	surfaceMemberLen = csm.abstractFeature.value.geometry2D.abstractSurface.value.exterior.abstractRing.length;

	// abstractRing
	var ar = csm.abstractFeature.value.geometry2D.abstractSurface.value.exterior.abstractRing;


	// Creating an instance of abstractRing
	var arObject = new surfaceMember([]);

	// Number of coordinates of the surface member
	var coordLen = ar.value.posOrPointPropertyOrPointRep.length;

	// Loop through the coordinates of a surfaceMember
	for (var i = 0; i < coordLen; i++) {
		arObject = abstractCoordination(ar.value.posOrPointPropertyOrPointRep[i].value.value, arObject);
	}

	csmObject.surfaceMember.push(arObject);
	//	console.log(csmObject);


	//	var arCeilingsObject = extendCeilingsFor2D(10, csm);
	//	var arWallsObject = extendWallsFor2D(10, csmObject);

	//	csmObject.surfaceMember.push(arCeilingsObject);
	//	csmObject.surfaceMember.push(arWallsObject);

	//	console.log(csmObject);

	return csmObject;
}

// Set CellSpaceMembers value from json data
function setCellSapceMembers(jsonresponse) {
	for (var i = 0; i < cellSpaceMemberLen; i++) {

		// Cell space member
		var csm = jsonresponse.value.primalSpaceFeatures.primalSpaceFeatures.cellSpaceMember[i];

		// Extracting the description of the cell space member
		var description = "";
		if (csm.abstractFeature.value.description != null) {
			description = csm.abstractFeature.value.description.value;
		}

		var id = "";
		if (csm.abstractFeature.value.id != null) {
			id = csm.abstractFeature.value.id;
		}

		// Extracting the href of the cell space member
		var href = "";
		if (csm.abstractFeature.value.duality.href != null) {
			href = csm.abstractFeature.value.duality.href;
		}

		// Creating an instance of the cell space member
		var csmObject = new cellSpaceMember(description, href, id, []);

		// Number of surface members
		if (csm.abstractFeature.value.geometry3D != null) {
			csmObject = getGeometry3DSurfaceMenber(csm, csmObject);
		} else if (csm.abstractFeature.value.geometry2D != null) {
			csmObject = getGeometry2DSurfaceMenber(csm, csmObject);
		}

		// Filling the array with the cell space member instancesBut the problem with outline has not been solved yet.
		cellSpaceMembers.push(csmObject);
	}
}

function setCellSapceBoundaryMembers(jsonresponse) {
	var cellSpaceBoundaryMemberLen = jsonresponse.value.primalSpaceFeatures.primalSpaceFeatures.cellSpaceBoundaryMember.length;

	for (var i = 0; i < cellSpaceBoundaryMemberLen; i++) {

		var csbm = jsonresponse.value.primalSpaceFeatures.primalSpaceFeatures.cellSpaceBoundaryMember[i];

		var description = "";
		if (csbm.abstractFeature.value.description != null) {
			description = csbm.abstractFeature.value.description.value;
		}

		var id = "";
		if (csbm.abstractFeature.value.id != null) {
			id = csbm.abstractFeature.value.id;
		}

		// Extracting the href of the cell space member
		var href = "";
		if (csbm.abstractFeature.value.duality != null) {
			href = csbm.abstractFeature.value.duality.href;
		}

		// Creating an instance of the cell space member
		var csbmObject = new cellSpaceMember(description, href, id, []);

		// Number of surface members
		if (csbm.abstractFeature.value.geometry3D != null) {
			csbmObject = getGeometry3DSurfaceMenberFromCSBM(csbm, csbmObject);
		} else if (csbm.abstractFeature.value.geometry2D != null) {
			csbmObject = getGeometry2DSurfaceMenber(csbm, csbmObject);
		}

		cellSpaceBoundaryMembers.push(csbmObject);
	}

}

function setUsageData(jsonrespones) {
	var cellSpaceBoundaryMemberLen = jsonresponse.value.primalSpaceFeatures.primalSpaceFeatures.cellSpaceBoundaryMember.length;

	for (var i = 0; i < cellSpaceBoundaryMemberLen; i++) {
		var csbm = jsonresponse.value.primalSpaceFeatures.primalSpaceFeatures.cellSpaceBoundaryMember[i];

		var id = csbm.abstractFeature.value.id;

		var description = csbm.abstractFeature.value.description.value;
		var usage = "";

		if (description.indexOf("Usage") != -1) {
			var start = description.indexOf("Usage") + 5;
			var end = description.indexOf(":", start + 1);
			usage = description.substring(start + 1, end);
		}

		usageData.put(id, usage);
	}

	console.log(usageData);
}

function rotateCellSpaceMember(position) {

	Cesium.Transforms.eastNorthUpToFixedFrame(position, ellipsoid, ENU);

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
}

function rotateCellSpaceBoundaryMembers(position) {

	Cesium.Transforms.eastNorthUpToFixedFrame(position, ellipsoid, ENU);

	// Applying translation and rotation to coordinates
	for (var i = 0; i < cellSpaceBoundaryMembers.length; i++) {

		var csmLen = cellSpaceBoundaryMembers[i].surfaceMember.length;

		for (var j = 0; j < csmLen; j++) {
			var smLen = cellSpaceBoundaryMembers[i].surfaceMember[j].coordinates.length;

			for (var k = 0; k < smLen; k += 3) {

				// Translating coordinates + converting the result to Cartesian3
				var offset = new Cesium.Cartesian3(cellSpaceBoundaryMembers[i].surfaceMember[j].coordinates[k] - center_X,
					cellSpaceBoundaryMembers[i].surfaceMember[j].coordinates[k + 1] - center_Y,
					cellSpaceBoundaryMembers[i].surfaceMember[j].coordinates[k + 2] - min_Z);

				// Applying rotation to the offset
				var finalPos = Cesium.Matrix4.multiplyByPoint(orientation, offset, new Cesium.Cartesian3());

				// Report offset to the actual position of LWM
				var new_coord = Cesium.Matrix4.multiplyByPoint(ENU, finalPos, finalPos);

				// Replacing the old coordinates by the new ones
				cellSpaceBoundaryMembers[i].surfaceMember[j].coordinates[k] = new_coord.x;
				cellSpaceBoundaryMembers[i].surfaceMember[j].coordinates[k + 1] = new_coord.y;
				cellSpaceBoundaryMembers[i].surfaceMember[j].coordinates[k + 2] = new_coord.z;
			}
		}
	}
}



function setAngle(_angle) {
	angle = _angle;

	orientation = new Cesium.Matrix4(Math.cos(angle), -Math.sin(angle), 0, 0,
		Math.sin(angle), Math.cos(angle), 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1); // Rotation matrix

}

function setPosition(_position) {
	position = _position;
}

function setCenterOfBuilding() {
	center_X = (min_X + max_X) / 2;
	center_Y = (min_Y + max_Y) / 2;
}


function setGeometryInstance() {
	// Loop through cell space members and creating geometry instances
	for (var i = 0; i < cellSpaceMembers.length; i++) {
		for (var j = 0; j < cellSpaceMembers[i].surfaceMember.length; j++) {

			//////////////////////////////////////////////////
			outlineInstances.push(new Cesium.GeometryInstance({
				geometry: new Cesium.PolygonOutlineGeometry({
					polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.unpackArray(cellSpaceMembers[i].surfaceMember[j].coordinates)),
					perPositionHeight: true,
				}),
				attributes: {
					color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLACK)
				}
			}));
			var temp = Cesium.Cartesian3.unpackArray(cellSpaceMembers[i].surfaceMember[j].coordinates);
      var pre = Math.floor(Cesium.Cartographic.fromCartesian(temp[0]).height);
      var escape = false;
      for (var k = 1; k < temp.length; k++) {
          var temp2 = Cesium.Cartographic.fromCartesian(temp[k]);
          if (pre !=  Math.floor(temp2.height)) {
            escape = true;
          }
      }
      if (escape) {
					roomInstances.push(new Cesium.GeometryInstance({
						geometry: new Cesium.PolygonGeometry({
							polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.unpackArray(cellSpaceMembers[i].surfaceMember[j].coordinates)),
							perPositionHeight: true
						}),
					}));
			};
			CeilingInstances.push(new Cesium.GeometryInstance({
				geometry: new Cesium.PolygonGeometry({
					polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.unpackArray(cellSpaceMembers[i].surfaceMember[j].coordinates)),
					perPositionHeight: true
				}),
			}));


		}
	}

	for (var i = 0; i < cellSpaceBoundaryMembers.length; i++) {
		for (var j = 0; j < cellSpaceBoundaryMembers[i].surfaceMember.length; j++) {
			doorInstances.push(new Cesium.GeometryInstance({
				geometry: new Cesium.PolygonGeometry({
					polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.unpackArray(cellSpaceBoundaryMembers[i].surfaceMember[j].coordinates)),
					perPositionHeight: true,
				})
			}));
		}
	}
}

function saveTextFileForSketchUp(faceCount) {
	var str = String();

	// Loop through cell space members and creating geometry instances
	for (var i = 0; i < cellSpaceMembers.length; i++) {
		for (var j = 0; j < cellSpaceMembers[i].surfaceMember.length; j++) {
			var arr = Cesium.Cartesian3.unpackArray(cellSpaceMembers[i].surfaceMember[j].coordinates);
			str += "pts = [];"
			for (var k = 0; k < arr.length; k++) {
				str += "pts[" + k + "]=[" + arr[k].x + "," + arr[k].y + "," + arr[k].z + "]; ";
			}
			str += "draw_face(entities, pts); "
		}

		if (i % faceCount == 0) {
			saveFile("text_file_" + i, str);
			str = new String();
		}
	}

	saveFile("text_fil_last", str);
}

function addInstancesToPrimitives() {

	var doorPrimitive = new Cesium.Primitive({
		geometryInstances: doorInstances,
		appearance: new Cesium.PerInstanceColorAppearance({
			faceForward: true,
			flat: true,
			translucent: true,
			closed: false
		})
	});

	doorPrimitive.appearance = new Cesium.MaterialAppearance();
	doorPrimitive.appearance.material = new Cesium.Material({
		fabric: {
			type: 'Color',
            uniforms: {
                color : new Cesium.Color(0.0, 0.0, 0.0, 0.996)
            }
		}
	});

	scene.primitives.add(doorPrimitive);


	var roomPrimitive = new Cesium.Primitive({
		geometryInstances: roomInstances,
		appearance: new Cesium.PerInstanceColorAppearance({
			faceForward: true,
			flat: true,
			translucent: false,
			closed: false
		})
	});

	roomPrimitive.appearance = new Cesium.MaterialAppearance();
	roomPrimitive.appearance.material = new Cesium.Material({
		fabric: {
			type: 'Image',
			uniforms: {
				image: 'marble.jpg'
			}
		}

	});

		scene.primitives.add(roomPrimitive);

	var ceilingPrimitive = new Cesium.Primitive({
		geometryInstances: CeilingInstances,
		appearance: new Cesium.PerInstanceColorAppearance({
			faceForward: true,
			flat: true,
			translucent: false,
			closed: false
		})
	});

	ceilingPrimitive.appearance = new Cesium.MaterialAppearance();
	ceilingPrimitive.appearance.material = new Cesium.Material({
		fabric: {
			type: 'Image',
			uniforms: {
				image: 'wood.jpg'
			}
		}

	});

		scene.primitives.add(ceilingPrimitive);

}




function addOutlineInstancesToPrimitives() {
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
}

function setNodesFromStateMember(jsonresponse) {

	// Extracting state members
	var sm = jsonresponse.value.multiLayeredGraph.spaceLayers["0"].spaceLayerMember["0"].spaceLayer.nodes["0"].stateMember;


	for (var i = 0; i < sm.length; i++) {

		// Creating a state member instance
		var stateMemberObject = new stateMember([]);

		// X,Y,Z coordinates of a state member
		var coordinates = sm[i].state.geometry.point.pos.value;

		stateMemberObject.coordinates.push(coordinates[0], coordinates[1], coordinates[2]);

		// Adding the state member to the nodes array
		nodes.push(stateMemberObject);
	}
}

function setEdgesFromTransitionMember(jsonresponse) {
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
}

function rotateNodes() {
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
}

function rotateEdges() {
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
}

function displayEdges() {
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
}

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

function importGLBFile(_position, _uri) {
	viewer.entities.add({
		position: _position,
		model: {
			uri: _uri
		}
	});
}

function extendCeilingsFor2D(height, csmObject) {
	var ar = csm.abstractFeature.value.geometry2D.abstractSurface.value.exterior.abstractRing;

	// Creating an instance of abstractRing
	var newSurfaceMenber = new surfaceMember([]);

	var coord = car.value.posOrPointPropertyOrPointRep[i].value.value

	// Number of coordinates of the surface member
	var coordLen = coord.length;

	// make roof
	for (var i = 0; i < coordLen; i++) {
		if (i + 1 % 3 == 0) {
			coord[i] += height;
		}
		newSurfaceMenber.coordinates.push(coord[i]);
	}

	console.log(newSurfaceMenber);

	return newSurfaceMenber;
}

function extendWallsFor2D(height, csm) {

	// abstractRing
	var ar = csm.abstractFeature.value.geometry2D.abstractSurface.value.exterior.abstractRing;


	// Creating an instance of abstractRing
	var arObject = new surfaceMember([]);

	// Number of coordinates of the surface member
	var coordLen = ar.value.posOrPointPropertyOrPointRep.length;

	// make roof
	for (var i = 0; i < coordLen; i++) {
		var leftDown;
		var rightDown;
		var rightUp;
		var leftUp;

		var newWall = new Array;
		console.log(ar.value.posOrPointPropertyOrPointRep[i].value.value);

		if (i != coordLen - 1) {
			rightDown = ar.value.posOrPointPropertyOrPointRep[i].value.value;
			leftDown = ar.value.posOrPointPropertyOrPointRep[i].value.value;
			rightUp = rightDown;
			rightUp[2] += height;
			leftUp = leftDown;
			leftUp[2] += height;
		} else {
			leftDown = ar.value.posOrPointPropertyOrPointRep[i].value.value;
			rightDown = ar.value.posOrPointPropertyOrPointRep[0].value.value;
			rightUp = rightDown;
			rightUp[2] += height;
			leftUp = leftDown;
			leftUp[2] += height;
		}

		newWall.push(leftDown[0], leftDown[1], leftDown[2]);
		newWall.push(rightDown[0], rightDown[1], rightDown[2]);
		newWall.push(rightUp[0], rightUp[1], rightUp[2]);
		newWall.push(leftUp[0], leftUp[1], leftUp[2]);
		newWall.push(leftDown[0], leftDown[1], leftDown[2]);

		console.log(newWall);

		arObject = abstractCoordination(newWall, arObject);
	}

	console.log(arObject);

	return arObject;
}
