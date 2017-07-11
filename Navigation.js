// define map
function Map() {
    this.elements = {};
    this.length = 0;
}
Map.prototype.put = function(key,value) {
    this.length++;
    this.elements[key] = value;
}
Map.prototype.get = function(key) {
    return this.elements[key];
}

// define structure
function coordination(){
    var x = 0;
    var y = 0;
    var z = 0;
    
    function toString(){
        return x+", "+y+", "+z;
    }
}

// functions for running navigate
function transformCamera(camera, newPosition){
    console.log("move to "+newPosition);
    camera.position = newPosition;
}
function getFloorsData(edges){
    var floors = new Array();
    var num = 0;
    
    floors[num] = new Array();
    floors[num].push(edges[0]);
    
    var nowDescription = edges[0].description;
//    console.log("now "+nowDescription);
    
    for(i = 0 ; i < edges.length; i++){
        if (edges[i].description != nowDescription){
            num++;
            floors[num] = new Array();
            nowDescription = edges[i].description;
//            console.log("now "+nowDescription);
        }
        floors[num].push(edges[i]);
    }
    
//    console.log(floors);
    
    var zCoordinationForEachFloor = new Map();
    for(i = 0; i < num; i++){
        var sum = 0;
        for(j = 0 ; j < floors[i].length; j++){
            sum += floors[i][j].stateMembers[0].coordinates[2];
            sum += floors[i][j].stateMembers[1].coordinates[2];
        }
//        console.log(sum +" "+ floors[i].length);
        zCoordinationForEachFloor.put(floors[i][0].description, sum/(floors[i].length*2));
    }
    
    return zCoordinationForEachFloor; // key : description, value : avg z coordination for each key.
}

var moveRate = 0.2;
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
function moveToSrc(camera, src, dst, nowT){
    if( nowT == 0 ){} // do nothing, camera no src 
    else{
        var newT = nowT - moveRate;
        var moved = new coordination;
        moved.x = newT * (dst.x - src.x) + src.x;
        moved.y = newT * (dst.y - src.y) + src.y;
        moved.z = newT * (dst.z - src.z) + src.z;
//        moved.z = camera.position.z;
        console.log(moved);
        camera.position = new Cesium.Cartesian3(moved.x, moved.y, moved.z);
    }
}
function moveToDst(camera, src, dst, nowT){
    if( nowT == 1 ){} // do nothing, camera no dst
    else{
        var newT = nowT + moveRate;
        var moved = new coordination;
        moved.x = newT * (dst.x - src.x) + src.x;
        moved.y = newT * (dst.y - src.y) + src.y;
        moved.z = newT * (dst.z - src.z) + src.z;
//        moved.z = camera.position.z;
        console.log(moved);
        camera.position = new Cesium.Cartesian3(moved.x, moved.y, moved.z);
    }
}

// onclick function for btn
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


function navigate(nodes, edges){
    console.log(edges);    
        
    var zCoordinationForEachFloor = new Map();
    zCoordinationForEachFloor = getFloorsData(edges);
	console.log(zCoordinationForEachFloor);
    
    console.log(edges[1].stateMembers[1].coordinates[0], edges[1].stateMembers[1].coordinates[1], zCoordinationForEachFloor.get(edges[1].description));

    var nowNode = 1000;
    // move camera to start node
    camera.flyTo({
        destination : new Cesium.Cartesian3(edges[nowNode].stateMembers[1].coordinates[0], edges[nowNode].stateMembers[1].coordinates[1], edges[nowNode].stateMembers[1].coordinates[2]),
        orientation: {
            heading : Cesium.Math.toRadians(90.0),
            pitch : Cesium.Math.toRadians(0),
            roll : 0.0
        }
    });
    
    // set onclick path
    var handler = new Cesium.ScreenSpaceEventHandler(canvas);

    handler.setInputAction(function(movement) {
        var feature = viewer.scene.pick(movement.position);
		console.log(feature);
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