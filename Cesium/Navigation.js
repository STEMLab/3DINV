// global variable -------------------------------------------------------------------------

var scene = viewer.scene;
var canvas = viewer.canvas;
canvas.setAttribute('tabindex', '0'); // needed to put focus on the canvas
canvas.onclick = function() {
       canvas.focus();
};

var ellipsoid = scene.globe.ellipsoid;
var camera = viewer.camera;
var controller = scene.screenSpaceCameraController;

var turnRate = 0.2;
var moveRate = 0.5;
var zfactor = 2;

var currentEdge = -1; // test data
var edges = new Array();



// define map
function Map() {
    this.elements = {};
    this.length = 0;
    this.index = [];
}

Map.prototype.put = function(key,value) {
    this.length++;
    this.elements[key] = value;
	
	if(this.index.indexOf(key) == -1) this.index.push(key);
}

Map.prototype.get = function(key) {
    return this.elements[key];
}

Map.prototype.getKeyByIndex = function(index){
    return this.index[index];
}



// define coordination structure 
function coordination(){
    var x = 0;
    var y = 0;
    var z = 0;
    var href = null;
    
    function toString(){
        return x+", "+y+", "+z;
    }
}

function coordination(_x, _y, _z){
    this.x = _x;
    this.y = _y;
    this.z = _z;
    this.href = null;
    
    function toString(){
        return x+", "+y+", "+z;
    }
}

function coordination(_x, _y, _z, _href){
    this.x = _x;
    this.y = _y;
    this.z = _z;
    this.href = _href;
    
    function toString(){
        return x+", "+y+", "+z;
    }
}

function RoomInfo(_description, _x, _y, _z, _href){
    this.coordination = new coordination(_x, _y, _z, _href);
	this.description = _description;
}




// functions and variables for moving camera -------------------------------------------------------------
function moveState(){
	this.srcHref = null;
	this.dstHref = null;
	this.T = 0; 
}

var nowMoveState = new moveState();

// transform losition of camera using flyTo function
function transformCamera(newPosition){

    var heading = camera.heading;
    var pitch = camera.pitch;
    var roll = camera.roll;
    
    camera.flyTo({
        destination : new Cesium.Cartesian3(
                newPosition.x,
                newPosition.y,
                newPosition.z+zfactor
        ),
        orientation: {
                heading : heading,
                pitch : pitch,
                roll : roll
        }
    });
    
}

// Determines whether to move from now to src or dst.
function getDirection(src, dst, now, heading){
	// src : coordinate of source
	// src : coordinate of destination
	// now : coordinate of camera
	// heading : camera heading
		
	var srcAngle = Cesium.Cartesian3.angleBetween(new Cesium.Cartesian3(src.x, src.y, src.z), camera.direction);
	var dstAngle = Cesium.Cartesian3.angleBetween(new Cesium.Cartesian3(dst.x, dst.y, dst.z), camera.direction);
	
//	console.log("srcAngle:", srcAngle, "dstAngle:", dstAngle);
	
	var threshold = 1.568;
	
	var direction; // dst : 1, src : 0
	
	var diff = srcAngle-dstAngle;
	
	if( diff < 0 && srcAngle < threshold )  direction = 0;
	else if( diff > 0 && dstAngle > threshold ) direction = 1;
	else direction = -1;
	
//    if     (direction == 0)  console.log("go ", nowMoveState.srcHref);
//    else if(direction == 1)  console.log("go ", nowMoveState.dstHref);
//	else                     console.log("under threshold");
    
    return direction;
}


// The following T means the parameter in the parameter equation in space.
function getT(src, dst, now){
    return (now.x - src.x) / (dst.x - src.x);
}

function getMovedCoordination(newT, src, dst){
    var moved = new coordination;
    moved.x = newT * (dst.x - src.x) + src.x;
    moved.y = newT * (dst.y - src.y) + src.y;
    moved.z = newT * (dst.z - src.z) + src.z;
    
    return moved;
}

function moveToSrc(src, dst, nowT){
    if( nowT == 0 ){ console.log("not move, now on src");} // do nothing, camera no src 
    else{
        var newT = nowT - moveRate;
        var moved = getMovedCoordination(newT, src, dst);
        transformCamera(moved);
    }
}

function moveToDst(src, dst, nowT){
    if( nowT == 1 ){ console.log("not move, now on dst");} // do nothing, camera no dst
    else{
        var newT = nowT + moveRate;
        var moved = getMovedCoordination(newT, src, dst);
        transformCamera(moved);
    }
}

function getMostSimilarNode(dstCandidate){
    // if click back btn heading is origin heading + 180
    var dstCandidateAngle = new Array();
		
	var nowAngle = Cesium.Cartesian3.angleBetween(camera.position, camera.direction);
	console.log("nowAngle :", nowAngle);	
    
    for(var i = 0 ; i < dstCandidate.length; i++){
		var tmpAngle = Cesium.Cartesian3.angleBetween(new Cesium.Cartesian3(dstCandidate[i].x,
																			dstCandidate[i].y, 
																			dstCandidate[i].z), 
													  camera.direction);
		console.log("nowAngle :", nowAngle, "tmpAngle :", tmpAngle, "differ :", Math.abs(tmpAngle-nowAngle));
		dstCandidateAngle.push(tmpAngle);
    }
	
	
	
	var min = -9999;
	if(dstCandidateAngle.length != 0){
		min = dstCandidateAngle.reduce(function (previous, current){
        	return previous > current ? current : previous;
    	});
	}

    	
    var indexOfMin = dstCandidateAngle.indexOf(min);
	
	if(indexOfMin == -1){
		return null;
	}
    console.log(dstCandidateAngle, dstCandidate[indexOfMin]);
    return dstCandidate[indexOfMin];
}

function getDstCandidateArray(){
	
	// fillter condition, dst or src is nowSrc
    function isConnectedToNowSrc(value){
        var returnVal = false;
        
        if(value.connects[0] == nowMoveState.srcHref ){
            returnVal = true;
        }
        else if(value.connects[1] == nowMoveState.srcHref ) {
            returnVal = true;
        }
        return returnVal;
    }
    
    var filteredTransitionMember = new Array();
    filteredTransitionMember = edges.filter(isConnectedToNowSrc);
    
    var dstCandidate = new Array();
    for(var i = 0 ; i < filteredTransitionMember.length; i++){
        if(filteredTransitionMember[i].connects[0] == nowMoveState.srcHref ){
            var tmpCoor = new coordination(filteredTransitionMember[i].stateMembers[1].coordinates[0],
                                           filteredTransitionMember[i].stateMembers[1].coordinates[1],
                                           filteredTransitionMember[i].stateMembers[1].coordinates[2],
										   filteredTransitionMember[i].connects[1]);
            dstCandidate.push(tmpCoor);
        }
        else{
            var tmpCoor = new coordination(filteredTransitionMember[i].stateMembers[0].coordinates[0],
                                           filteredTransitionMember[i].stateMembers[0].coordinates[1],
                                           filteredTransitionMember[i].stateMembers[0].coordinates[2],
										   filteredTransitionMember[i].connects[0]);
            dstCandidate.push(tmpCoor);
        }
    }
	
	console.log(dstCandidate);
	return dstCandidate;
}

function getNewDst(){
    
	var dstCandidate = getDstCandidateArray();
	var newDstCoordination = getMostSimilarNode(dstCandidate);
	
	return newDstCoordination;
}




// draw tree view --------------------------------------------------------------------------

var roomData = new Map(); // key href, value roomInfo
var descriptionData = new Array(); // value description

function makeRoomData(edges){
    var nowDescription = "";
    
    for(i = 0 ; i < edges.length; i++){
        if (edges[i].description != nowDescription){
            nowDescription = edges[i].description;
    		descriptionData.push(nowDescription);
        }
        
        for(j = 0; j < 2; j++){
			var tmpRoomInfo = new RoomInfo(nowDescription, 
										   edges[i].stateMembers[j].coordinates[0], 
										   edges[i].stateMembers[j].coordinates[1],
										   edges[i].stateMembers[j].coordinates[2],
										   edges[i].connects[j]);
			
            if(roomData.get(edges[i].connects[j]) == null){
                roomData.put(edges[i].connects[j], tmpRoomInfo);
            }
        }
    }
	
//	console.log(descriptionData);
//	console.log(roomData);
}

// make json data of section data
function makeRoomDataToJson(){
	var roomArray = new Array();
	
	for(var i = 0; i < descriptionData.length ; i++){
		var floorInfo = new Object();
		floorInfo.id = descriptionData[i];
		floorInfo.parent = "#";
		floorInfo.text = floorInfo.id;
		roomArray.push(floorInfo);
	}
	
	for(var i = 0; i < roomData.length ; i++){
		var roomInfo = new Object();
		roomInfo.id = roomData.getKeyByIndex(i);
		roomInfo.parent = roomData.get(roomInfo.id).description;
		roomInfo.text = roomInfo.id;
		roomInfo.icon = "glyphicon glyphicon-leaf";
		roomArray.push(roomInfo);
	}
					
	var dataInfo = new Object();
	dataInfo.data = roomArray;
	
	var themeInfo = new Object();
	themeInfo.name = "proton";
	themeInfo.responsive = true;
	
	var pluginInfo = ["wholerow", "sort"];
	var sortInfo = function(a, b) {
		a1 = this.get_node(a);
		b1 = this.get_node(b);
		if (a1.icon == b1.icon) return (a1.text > b1.text) ? 1 : -1;
		else return (a1.icon > b1.icon) ? 1 : -1; 
	}

	
	var jsonInfo = new Object();
	jsonInfo.core = dataInfo;
	jsonInfo.themes = themeInfo;
	jsonInfo.plugins = pluginInfo;
	jsonInfo.sort = sortInfo;
		
	return jsonInfo;
}



// onclick functions -----------------------------------------------------------------------

function onClickTreeView(roomHref){
    var pickedRoom = roomData.get(roomHref[0]);
	
	if(pickedRoom == null){
		// open lower tree
	}
	
	console.log(pickedRoom);
	
	nowMoveState.srcHref = roomHref[0];
	nowMoveState.dstHref = null;
	nowMoveState.T = 0;
    
    camera.flyTo({
        destination : new Cesium.Cartesian3(
            pickedRoom.coordination.x,
            pickedRoom.coordination.y,
            pickedRoom.coordination.z+zfactor
        ),
        orientation: {
            heading : Cesium.Math.toRadians(90.0),
            pitch : Cesium.Math.toRadians(0),
            roll : 0.0
        }
    });
	
}

function onClickLeftTurnBtn(){
//    console.log("onClickLeftTurnBtn called");
    camera.lookLeft(turnRate);
}

function onClickRightTurnBtn(){
//    console.log("onClickRightTurnBtn called");
    camera.lookRight(turnRate);
}

function onClickBackToOrigianlViewBtn(){
//    console.log("onClickBackToOrigianlViewBtn called");
    camera.setView({
        orientation: {
            heading : Cesium.Math.toRadians(90.0),
            pitch : Cesium.Math.toRadians(0),
            roll : 0.0
        }
    });
}

function onClickZoomInBtn(){
    camera.zoomIn(0.2);
}

function onClickZoomOutBtn(){
    camera.zoomOut(0.2);
}


function checkAndAssignDst(){
	
	if ( nowMoveState.T == 0 ){// camera is on src node, find new dst
        console.log("now on src");
		
		var tmp = getNewDst();
		if(tmp != null) nowMoveState.dstHref = tmp.href;
		else nowMoveState.dstHref = null;
    }
	
	else if ( nowMoveState.T == 1){ // camera is on dst node, find new dst
        console.log("now on dst");
		nowMoveState.srcHref = nowMoveState.dstHref;
		
		var tmp = getNewDst();
		if(tmp != null) nowMoveState.dstHref = tmp.href;
		else nowMoveState.dstHref = null;
		nowMoveState.T = 0;
		
    }
}

function onClickMoveFrontBtn(){
	
	checkAndAssignDst();
    
    var now = new coordination(camera.position.x, camera.position.y, camera.position.z);
	
	if(nowMoveState.dstHref != null){
		var direction = getDirection(roomData.get(nowMoveState.srcHref).coordination,
									 roomData.get(nowMoveState.dstHref).coordination,
									 now,
									 Cesium.Math.toDegrees(camera.heading));
		
		if( direction == 0 && nowMoveState.T != 0 ){  //camera see src direction
            moveToSrc(roomData.get(nowMoveState.srcHref).coordination,
					  roomData.get(nowMoveState.dstHref).coordination,
					  nowMoveState.T);
            nowMoveState.T -= moveRate;
		}
		else if( direction == 1 && nowMoveState.T != 1 ){ //camera see dst direction
			moveToDst(roomData.get(nowMoveState.srcHref).coordination,
					  roomData.get(nowMoveState.dstHref).coordination,
					  nowMoveState.T);
			nowMoveState.T += moveRate;
		}
		else if( direction == -1){ }
		else {
			console.log("error! ");
		}
	}
	
	console.log("nowMoveState:", nowMoveState);
}

function onClickMoveBackwardBtn(){
	
	checkAndAssignDst();
    	
	var now = new coordination(camera.position.x, camera.position.y, camera.position.z);
	
	if(nowMoveState.dstHref != null){
		var direction = getDirection(roomData.get(nowMoveState.srcHref).coordination,
									 roomData.get(nowMoveState.dstHref).coordination,
									 now,
									 Cesium.Math.toDegrees(camera.heading));
		console.log(direction)
		
		if( direction == 0 && nowMoveState.T != 1 ){ 
			moveToDst(roomData.get(nowMoveState.srcHref).coordination,
					  roomData.get(nowMoveState.dstHref).coordination,
					  nowMoveState.T);
			nowMoveState.T += moveRate;
		}
		else if( direction == 1 && nowMoveState.T != 0 ){ 
            moveToSrc(roomData.get(nowMoveState.srcHref).coordination,
					  roomData.get(nowMoveState.dstHref).coordination,
					  nowMoveState.T);
            nowMoveState.T -= moveRate;
		}
		else if( direction == -1 ){
			
		}
		else{
			console.log("error! ", direction);
		}
	} 
	
	console.log("nowMoveState:", nowMoveState);
}



function navigate(nodes, _edges){
    
    edges = _edges;
	
	makeRoomData(edges);
	
	settingTreeView();

    viewer.flyTo(viewer.entities);
	
	console.log("maximum :",scene.maximumAliasedLineWidth);
    
    // disable the default event handlers
    scene.screenSpaceCameraController.enableRotate = false;
    scene.screenSpaceCameraController.enableTranslate = false;
    scene.screenSpaceCameraController.enableZoom = false;
    scene.screenSpaceCameraController.enableTilt = false;
    scene.screenSpaceCameraController.enableLook = false;
}


