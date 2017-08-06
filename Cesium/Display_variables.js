// Creating the cellSpaceMember Class
function cellSpaceMember(description, href, surfaceMember) {
	this.description = description; // Description contains information about section and floor ... etc
	this.href = href; // Duality
	this.surfaceMember = surfaceMember; // Array of surface members
}

// Creating the surfaceMember Class`
function surfaceMember(coordinates) {
	this.coordinates = coordinates; //Array of surfaceMember coordinates
}

function GML_3_2_1_LinearRingType() {
	this.posOrPointPropertyOrPointRep = new Array();
}

// Variables where the maximum coordinates will be stored
var max_X = 0;
var max_Y = 0;
var max_Z = 0;

// Variables where the minimum coordinates will be stored
var min_X = 0;
var min_Y = 0;
var min_Z = 0;

// Center of Lotte World Mall
var center_X;
var center_Y;

// Array of cellSpaceMember instances
var cellSpaceMembers = [];

// Number of cell space members
var cellSpaceMemberLen;


var ellipsoid = viewer.scene.globe.ellipsoid;
var ENU = new Cesium.Matrix4(); // The object onto which to store the transformation result
var angle = 0;
var orientation;


// Drawing polygones using primitives
var scene = viewer.scene;

// Array of instances
var instances = [];
var outlineInstances = [];
var roomColor = [Cesium.Color.fromBytes(227, 253, 253),
                 Cesium.Color.fromBytes(203, 241, 245),
                 Cesium.Color.fromBytes(166, 227, 233),
                 Cesium.Color.fromBytes(113, 201, 206)];
