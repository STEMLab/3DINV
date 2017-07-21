// global variable
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
var moveRate = 0.2;
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
    this.index.push(key);
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





// functions for moving camera
function transformCamera(newPosition){
    console.log(newPosition);
    
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
    
    camera.position = new Cesium.Cartesian3(newPosition.x, newPosition.y, newPosition.z);
    

}

function getDirection(src, dst, now, heading){
    var transSrc = new coordination;
    var transDst = new coordination;
    
    transSrc.x = src.x - now.x;
    transSrc.y = src.y - now.y;
    transDst.x = dst.x - now.x;
    transDst.y = dst.y - now.y;
    
    var srcAngle = Math.atan(transSrc.y / transSrc.x) * (180 / Math.PI);
    var dstAngle = Math.atan(transDst.y / transDst.x) * (180 / Math.PI);
    
    var boundaryStart = srcAngle+90;
    var boundaryEnd = dstAngle+90;
    
    var direction; // dst : 1, src : 0
    
    if(boundaryStart < boundaryEnd){
        if(boundaryStart <= heading && heading < boundaryEnd) direction = 0;
        else direction = 1;
    }
    else{
        if(boundaryStart <= heading || heading < boundaryEnd) direction = 0;
        else direction = 1;
    }
    
    if(direction == 0)  console.log("go src");
    else console.log("go dst");
    
    return direction;
}

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
    console.log("moveToSrc");
    if( nowT == 0 ){} // do nothing, camera no src 
    else{
        var newT = nowT - moveRate;
        var moved = getMovedCoordination(newT, src, dst);
        transformCamera(moved);
    }
}

function moveToDst(src, dst, nowT){
    if( nowT == 1 ){} // do nothing, camera no dst
    else{
        var newT = nowT + moveRate;
        var moved = getMovedCoordination(newT, src, dst);
        transformCamera(moved);
    }
}





// reutn map var
// key : description, value : avg z coordination for each key.
function getFloorsData(edges){
    var floors = new Array();
    var num = 0;
    
    floors[num] = new Array();
    floors[num].push(edges[0]);
    
    var nowDescription = edges[0].description;
    
    for(i = 0 ; i < edges.length; i++){
        if (edges[i].description != nowDescription){
            num++;
            floors[num] = new Array();
            nowDescription = edges[i].description;
        }
        floors[num].push(edges[i]);
    }
    
    
    var zCoordinationForEachFloor = new Map();
    for(i = 0; i < num; i++){
        var sum = 0;
        for(j = 0 ; j < floors[i].length; j++){
            sum += floors[i][j].stateMembers[0].coordinates[2];
            sum += floors[i][j].stateMembers[1].coordinates[2];
        }
        zCoordinationForEachFloor.put(floors[i][0].description, sum/(floors[i].length*2));
    }
    
    return zCoordinationForEachFloor;
}





// onclick functions for btn
function onClickLeftTurnBtn(){
//    console.log("onClickLeftTurnBtn called");
    camera.lookLeft(turnRate);
}

function onClickRightTurnBtn(){
//    console.log("onClickRightTurnBtn called");
    camera.lookRight(turnRate);
}

function onClickUpTurnBtn(){
//    console.log("onClickUpTurnBtn called");
    camera.lookUp(turnRate);
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



var nowRoom = null;
var nowSrc = new coordination();
var nowDst = new coordination();
var nowT = 0;


function getMostSimilarNode(nowSrc, dstCandidate){
    return dstCandidate[0];
}

function getNewDst(nowSrc){
    
    // fillter condition, dst or src is nowSrc
    function isConnectedToNowSrc(value){
        var returnVal = false;
        
        if(value.connects[0] == nowSrc.href ){
            returnVal = true;
        }
        else if(value.connects[1] == nowSrc.herf ) {
            returnVal = true;
        }
        return returnVal;
    }
    
    var filteredTransitionMember = new Array();
    filteredTransitionMember = edges.filter(isConnectedToNowSrc);
    console.log(filteredTransitionMember);
    
    var dstCandidate = new Array();
    for(var i = 0 ; i < filteredTransitionMember.length; i++){
        if(filteredTransitionMember[i].connects[0] == nowSrc.href ){
            var tmpCoor = new coordination(filteredTransitionMember[i].stateMembers[0].coordinates[0],
                                               filteredTransitionMember[i].stateMembers[0].coordinates[1],
                                               filteredTransitionMember[i].stateMembers[0].coordinates[2]);
            tmpCoor.href = filteredTransitionMember[i].connects[1];
            dstCandidate.push(tmpCoor);
        }
        else{
            var tmpCoor = new coordination(filteredTransitionMember[i].stateMembers[1].coordinates[0],
                                               filteredTransitionMember[i].stateMembers[1].coordinates[1],
                                               filteredTransitionMember[i].stateMembers[1].coordinates[2]);
            tmpCoor.href = filteredTransitionMember[i].connects[0];
            dstCandidate.push(tmpCoor);
        }
    }
    console.log(dstCandidate);

    var newDst = getMostSimilarNode(nowSrc, dstCandidate);
    return newDst;
}

function onClickMoveFrontBtn(){
    
    if ( nowT == 0 ){// camera is on src node, find new dst
        console.log("nowT == 0");
        nowDst = getNewDst(nowSrc);
    }
    else if ( nowT == 1){ // camera is on dst node, find new dst
        console.log("nowT == 1");
        nowSrc = nowDst;
        nowDst = getNewDst(nowDst);
    }

    if( true ){  //camera see src direction
            moveToSrc(nowSrc, nowDst, nowT);
            nowT -= moveRate;
        }
        else{ //camera see dst direction
            moveToDst(nowSrc, nowDst, nowT);
            nowT += moveRate;
        }
    
}

function onClickMoveBackwardBtn(){
    
    if ( nowT == 0 ){ // camera is on src node, find new dst
        nowDst = getNewDst(nowSrc);
    }
    else if ( nowT == 1){ // camera is on dst node, find new dst
        nowSrc = nowDst;
        nowDst = getNewDst(nowDst);
    }
    else{ // camera is on edges, move backward
        if( true ){ //camera see src direction
            moveToDst(nowSrc, nowDst, nowT);
            nowT += moveRate;
        }
        else{ //camera see dst direction
            moveToSrc(nowSrc, nowDst, nowT);
            nowT -= moveRate;
        }
    }
}







// make dom data for tree view
var sectionData = new Map(); // key description, value map room
function makeSectionData(edges){
    var nowDescription = "";
    
    for(i = 0 ; i < edges.length; i++){
        if (edges[i].description != nowDescription){
            nowDescription = edges[i].description;
    
            // key room href, value coordination of room 
            sectionData.put(nowDescription, new Map());
        }
        
        for(j = 0; j < 2; j++){
            if(sectionData.get(nowDescription) != null){
                sectionData.get(nowDescription).put(edges[i].connects[j],
                                                new coordination(edges[i].stateMembers[j].coordinates[0],
                                                                edges[i].stateMembers[j].coordinates[1],
                                                                edges[i].stateMembers[j].coordinates[2]));
            }
        }
    }
}





// functions for tree view
function makeTreeView(sectionData){
    var tree = document.getElementById('treeview_for_floor');
    
    var firstNode = document.getElementById('firstRoot'); 
    firstNode.innerHTML = sectionData.getKeyByIndex(0);
        
}

function findCoordinationById(section, roomHref){
    console.log(section, roomHref);
    
    coor = new coordination();
    coor = (sectionData.get(section)).get(roomHref);
    
    return coor;
}

function onClickTreeView(spanValue){
    var tree = document.getElementById('treeview_for_floor');
//    var node = tree.element.find('li.active');
    
//    var pickedRoom = findCoordinationById(node.id);
    var pickedRoom = findCoordinationById(spanValue.innerHTML, '#R3737'); // test data
    
    camera.flyTo({
        destination : new Cesium.Cartesian3(
            pickedRoom.x,
            pickedRoom.y,
            pickedRoom.z+zfactor
        ),
        orientation: {
            heading : Cesium.Math.toRadians(90.0),
            pitch : Cesium.Math.toRadians(0),
            roll : 0.0
        }
    });
    
    nowRoom = '#R3737';
    nowSrc = pickedRoom;
    nowSrc.href = '#R3737';
    nowT = 0;
}





function navigate(nodes, _edges){

    edges = _edges;
//    console.log(_edges);
    
    makeSectionData(edges);
    makeTreeView(sectionData);
    
    
    viewer.flyTo(viewer.entities);
    
    // disable the default event handlers
    scene.screenSpaceCameraController.enableRotate = false;
//    scene.screenSpaceCameraController.enableTranslate = false;
    scene.screenSpaceCameraController.enableZoom = false;
    scene.screenSpaceCameraController.enableTilt = false;
    scene.screenSpaceCameraController.enableLook = false;
    
    // set onclick path
    var handler = new Cesium.ScreenSpaceEventHandler(canvas);

    handler.setInputAction(function(movement) {
        var feature = viewer.scene.pick(movement.position);
        if (Cesium.defined(feature)) {
            if (Cesium.defined(feature['id']['polyline'])) {
                var src = new coordination;
                src.x = feature['id']['polyline']['positions'].getValue(0)[0].x;
                src.y = feature['id']['polyline']['positions'].getValue(0)[0].y;
                src.z = feature['id']['polyline']['positions'].getValue(0)[0].z;
                var dst = new coordination;
                dst.x = feature['id']['polyline']['positions'].getValue(0)[1].x;
                dst.y = feature['id']['polyline']['positions'].getValue(0)[1].y;
                dst.z = feature['id']['polyline']['positions'].getValue(0)[1].z;
                var now = new coordination;
                now.x = camera.position.x;
                now.y = camera.position.y;
                now.z = camera.position.x;

                var direction = getDirection(src, dst, now, Cesium.Math.toDegrees(camera.heading));
                var nowT = getT(src, dst, now);

                if(direction == 0){
                    moveToSrc(camera, src, dst, nowT);
                } else if(direction == 1){
                    moveToDst(camera, src, dst, nowT);
                } else{
                    console.log("error! wrong direction "+direction);
                }
            }
        }else{
            console.log("undefined");
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);   
}

