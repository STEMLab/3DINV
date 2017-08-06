function setCellSpaceMemberLen(jsonresponse) {
	cellSpaceMemberLen = jsonresponse.value.primalSpaceFeatures.primalSpaceFeatures.cellSpaceMember.length;
}

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

	return csmObject;
}

function setCellSapceMembers(jsonresponse) {
	for (var i = 0; i < cellSpaceMemberLen; i++) {

		// Cell space member
		var csm = jsonresponse.value.primalSpaceFeatures.primalSpaceFeatures.cellSpaceMember[i];

		// Extracting the description of the cell space member
		var description = "";
		if (csm.abstractFeature.value.description != null) {
			description = csm.abstractFeature.value.description.value;
		}


		// Extracting the href of the cell space member
		var href = "";
		if (csm.abstractFeature.value.duality.href != null) {
			href = csm.abstractFeature.value.duality.href;
		}

		// Creating an instance of the cell space member
		var csmObject = new cellSpaceMember(description, href, []);


		var surfaceMemberLen;

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

	return cellSpaceMembers;
}

function setAngle(_angle) {
	angle = _angle;

	orientation = new Cesium.Matrix4(Math.cos(angle), -Math.sin(angle), 0, 0,
		Math.sin(angle), Math.cos(angle), 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1); // Rotation matrix

}

function setCenterOfBuilding() {
	center_X = (min_X + max_X) / 2;
	center_Y = (min_Y + max_Y) / 2;
}

function setGeometryInstanceAndSaveTextForSketchUp() {
	var str = String();
	str += "model = Sketchup.active_model;";

	// Loop through cell space members and creating geometry instances
	for (var i = 0; i < cellSpaceMembers.length; i++) {
		for (var j = 0; j < cellSpaceMembers[i].surfaceMember.length; j++) {
			instances.push(new Cesium.GeometryInstance({
				geometry: new Cesium.PolygonGeometry({
					polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.unpackArray(cellSpaceMembers[i].surfaceMember[j].coordinates)),
					perPositionHeight: true
				}),
				attributes: {
					color: Cesium.ColorGeometryInstanceAttribute.fromColor(roomColor[i % 4])
				}
			}));

			outlineInstances.push(new Cesium.GeometryInstance({
				geometry: new Cesium.PolygonOutlineGeometry({
					polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.unpackArray(cellSpaceMembers[i].surfaceMember[j].coordinates)),
					perPositionHeight: true,
				}),
				attributes: {
					color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLACK)
				}
			}));

			var arr = Cesium.Cartesian3.unpackArray(cellSpaceMembers[i].surfaceMember[j].coordinates);
			for (var k = 0; k < arr.length; k++) {
				str += "pt" + k + "=[" + arr[k].x + "," + arr[k].y + "," + arr[k].z + "]; ";
			}
			str += "model.entities.add_face(";
			for (var k = 0; k < arr.length; k++) {
				str += "pt" + k;
				if (k != arr.length - 1) {
					str += ",";
				}
			}
			str += "); "
		}

		if (i % 500 == 0) {
			saveFile("text_file_" + i, str);
			str = new String();
		}
	}

	saveFile("text_fil_last", str);
}
