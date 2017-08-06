var scene = viewer.scene;
var canvas = viewer.canvas;
canvas.setAttribute('tabindex', '0'); // needed to put focus on the canvas
canvas.onclick = function() {
       canvas.focus();
};

var ellipsoid = scene.globe.ellipsoid;
var camera = viewer.camera;
var controller = scene.screenSpaceCameraController;

var turnRate = 0.1;
var moveRate = 0.5;
var zfactor = 2;

var currentEdge = -1; // test data


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
var roomData = new Map(); // key href, value roomInfo
var descriptionData = new Array(); // value description