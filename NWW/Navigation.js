
var wwd;
var pathPositionsArray = new Array;

function navigate(_pathPositionsArray, _wwd){
	
	settingTreeView();   
	
    wwd = _wwd;
	pathPositionsArray = _pathPositionsArray;
	
	console.log(pathPositionsArray);
}

function moveNavigator(position){
	var navi = new Navigator.
	wwd.navigator.lookAtLocation.latitude = position.latitude;
	wwd.navigator.lookAtLocation.longitude = position.longitude;
	wwd.navigator.range = position.altitude;
	
	wwd.redraw();
}

function onClickLeftTurnBtn(){
    console.log("onClickLeftTurnBtn called");
}

function onClickRightTurnBtn(){
    console.log("onClickRightTurnBtn called");
}

function onClickBackToOrigianlViewBtn(){
    console.log("onClickBackToOrigianlViewBtn called");
	console.log(pathPositionsArray[2000][0]);
	
	moveNavigator(pathPositionsArray[500][0]);
	
//	var goToA = new WorldWind.GoToAnimator(wwd);
//	goToA.goTo(new WorldWind.Position.fromRadians(pathPositionsArray[2000][0].latitude,
//									pathPositionsArray[2000][0].longitude,	
//									pathPositionsArray[2000][0].altitude));
	
//	var newPosition = new WorldWind.Position(pathPositionsArray[2000][0].latitude,
//														 pathPositionsArray[2000][0].longitude,
//														 101);
//	console.log(newPosition);
	
//	wwd.goTo(newPosition);
	wwd.navigator.heading = 0;
	wwd.navigator.roll = 0;
	wwd.navigator.tilt  = 85;
	
	console.log(wwd.navigator.currentState());


}

function onClickZoomInBtn(){
    console.log("onClickZoomInBtn called");
}

function onClickZoomOutBtn(){
    console.log("onClickZoomInBtn called");
}


function onClickMoveFrontBtn(){
	console.log("onClickMoveFrontBtn called");
}

function onClickMoveBackwardBtn(){
	console.log("onClickMoveBackwardBtn called");
	
}
