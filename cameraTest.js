// global variable
var scene = viewer.scene;
var canvas = viewer.canvas;
canvas.setAttribute('tabindex', '0'); // needed to put focus on the canvas

var ellipsoid = scene.globe.ellipsoid;
var camera = viewer.camera;
var controller = scene.screenSpaceCameraController;

var moveRate = 0.2;

var nodes = new Array(3);
var edges = new Array(2);
var pathes = new Array();
//var headingSpan = document.getElementById('heading');
//var positionSpan = document.getElementById('position');
//
//viewer.scene.preRender.addEventListener(function(scene, time) {
//    headingSpan.innerHTML = Cesium.Math.toDegrees(camera.heading).toFixed(1);
//    positionSpan.innerHTML = camera.position;
//});


//make test case
function coordination(){
    var x = 0;
    var y = 0;
    var z = 4400000;
    
    function toString(){
        return x+", "+y+", "+z;
    }
}

function transitionMem(){
    var src = new coordination;
    var dst = new coordination;
}


for(i = 0; i < 3 ; i ++) nodes[i] = new coordination();
nodes[0].x = -108.0; nodes[0].y = 42.0; nodes.y = 4400000;
nodes[1].x = -107.0; nodes[1].y = 42.0; nodes.y = 4400000;
nodes[2].x = -107.0; nodes[2].y = 43.0; nodes.y = 4400000;

for(i = 0 ; i < 2; i++) edges = new transitionMem();
edges[0] = {
    src : nodes[0],
    dst : nodes[1]
};
edges[1] = {
    src : nodes[1],
    dst : nodes[2]
};


// draw room
for(i = 0 ; i < 3; i++){
    viewer.entities.add({
        polygon : {
            hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights([
                nodes[i].x-0.5, nodes[i].y+0.5, nodes[i].z,
                nodes[i].x-0.5, nodes[i].y-0.5, nodes[i].z,
                nodes[i].x+0.5, nodes[i].y-0.5, nodes[i].z,
                nodes[i].x+0.5, nodes[i].y+0.5, nodes[i].z
            ]),
            extrudedHeight: 50000,
            material : Cesium.Color.fromRandom().withAlpha(0.5),
            outline : true,
            outlineColor : Cesium.Color.BLACK.wihtAl,
        }
    });
}

// draw path
for(i = 0 ; i < 2; i++){
    var path = viewer.entities.add({
        polyline : {
            positions : Cesium.Cartesian3.fromDegreesArrayHeights([
                edges[i].src.x, edges[i].src.y, edges[i].src.z,
                edges[i].dst.x, edges[i].dst.y, edges[i].dst.z
            ]),
            width : new Cesium.ConstantProperty(50),
            material : Cesium.Color.WHITE
        }
    });

//    viewer.entities.add({
//        polygon : {
//            hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights([
//                edges[i].src.x-0.01, edges[i].src.y, edges[i].src.z,
//                edges[i].src.x+0.01, edges[i].src.y, edges[i].src.z,
//                edges[i].dst.x-0.01, edges[i].dst.y, edges[i].dst.z,
//                edges[i].dst.x+0.01, edges[i].dst.y, edges[i].dst.z
//            ]),
//            extrudedHeight: 5,
//            material : Cesium.Color.WHITE,
//            outline : false,
//            
//        }
    //    });
    
//    pathes.push(path);
}
//console.log(pathes);


// set button action
var turnRate = 0.1;
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


function getIncludedAngle(src, dst){
    var src_Lat_radian = src.x *(Math.PI/180);
    var src_Lon_radian = src.y *(Math.PI/180);
    var dst_Lat_radian = dst.x *(Math.PI/180);
    var dst_Lon_radian = dst.y *(Math.PI/180);

    var radian_distance = 0;
    radian_distance = Math.acos(Math.sin(src_Lat_radian) * Math.sin(dst_Lat_radian) + Math.cos(src_Lat_radian) * Math.cos(dst_Lat_radian) * Math.cos(src_Lon_radian - dst_Lon_radian));

    var radian_bearing = Math.acos((Math.sin(dst_Lat_radian) - Math.sin(src_Lat_radian) * Math.cos(radian_distance)) / (Math.cos(src_Lat_radian) * Math.sin(radian_distance)));        // acos의 인수로 주어지는 x는 360분법의 각도가 아닌 radian(호도)값이다.

    var true_bearing = 0;
    if (Math.sin(dst_Lon_radian - src_Lon_radian) < 0){
        true_bearing = radian_bearing * (180 / Math.PI);
        true_bearing = 360 - true_bearing;
    }
    else{
        true_bearing = radian_bearing * (180 / Math.PI);
    }
    
    return true_bearing;
}
function getLength(src, dst){
    return Math.sqrt((src.x-dst.x)*(src.x-dst.x) + (src.y-dst.y)*(src.y-dst.y));
}
function getIncludedAngleUsingCosing(B, C){
    var A = new coordination;
    A.x = 0;
    A.y = 0;
    
    var a = getLength(B,C);
    var b = getLength(A,C);
    var c = getLength(A,B);
    
    var cosA = (b*b + c*c - a*a)/(2*b*c);
    var returnVal = Cesium.Math.toDegrees(Math.acos(cosA));
        
    return returnVal;
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

function moveToSrc(camera, src, dst, nowT){
    if( nowT == 0 ){} // do nothing, camera no src 
    else{
        var newT = nowT - moveRate;
        var moved = new coordination;
        moved.x = newT * (dst.x - src.x) + src.x;
        moved.y = newT * (dst.y - src.y) + src.y;
//        moved.z = newT * (dst.z - src.z) + src.z;
        moved.z = camera.position.z;
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
//        moved.z = newT * (dst.z - src.z) + src.z;
        moved.z = camera.position.z;
        console.log(moved);
        camera.position = new Cesium.Cartesian3(moved.x, moved.y, moved.z);
    }
}


// set path click action
// disable the default event handlers
//scene.screenSpaceCameraController.enableRotate = false;
//scene.screenSpaceCameraController.enableTranslate = false;
//scene.screenSpaceCameraController.enableZoom = false;
//scene.screenSpaceCameraController.enableTilt = false;
//scene.screenSpaceCameraController.enableLook = false;



var handler = new Cesium.ScreenSpaceEventHandler(canvas);

handler.setInputAction(function(movement) {
    var feature = viewer.scene.pick(movement.position);
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
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

// move camera to start node
camera.flyTo({
    destination : Cesium.Cartesian3.fromDegrees(edges[1].src.x, edges[1].src.y, edges[1].src.z),
    orientation: {
        heading : Cesium.Math.toRadians(90.0),
        pitch : Cesium.Math.toRadians(0),
        roll : 0.0
    }
});




