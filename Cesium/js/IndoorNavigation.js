/**
 * This module contains the functions required to navigate in 3D buildings built in DisplayHelper.
 * Unlike existing maps, the indoor space viewer is restricted due to the spatial factor of the wall.
 * With this in mind, this module ensures that the user moves only on the network defined in the IndoorGML file to limit unusual behavior such as user penetration through the wall.
 * @module IndoorNavigation
 */
define([
  "./Objects/MoveState",
  "./Objects/RoomInfo",
  "./Objects/Coordination"
], function(
  MoveState,
  RoomInfo,
  Coordination
) {
  'use strict';

  /**
   * Create new IndoorNavigation
   * @constructor module:IndoorNavigation
   * @param {Cesium.Viewer} viewer
   * @param {GMLDataContainer} gmlDataContainer This value should be same with using in DisplayHelper module.
   */
  function IndoorNavigation(viewer, gmlDataContainer) {

    this.gmlDataContainer = gmlDataContainer;

    this.scene = viewer.scene;
    this.camera = viewer.camera;

    /** The angle, in radian, to rotate.
     * @default 0.1
     */
    this.turnRate = 0.1;

    /** The amount of change in T when the camera moves once.
     * A detailed description of T is given in MoveState. */
    this.moveRate = 0.5;


    this.zfactor = 2;

    this.currentEdge = -1; // test data

    this.nowMoveState = new MoveState();
    this.roomData = new Map();

    this.sectionData = [];
    this.floorData = [];

    this.makeRoomData();


  }



  /**
   * Set trunRate value.
   * @param {Number} turnRate This angle, in radian, to rotate.
   */
  IndoorNavigation.prototype.setTurnRate = function(turnRate) {
    this.turnRate = turnRate;
  }


  /**
   * Set moveRate value.
   * @param {Number} moveRate This angle, in radian, to rotate.
   */
  IndoorNavigation.prototype.setTurnRate = function(moveRate) {
    this.turnRate = turnRate;
  }



  /**
   */
  IndoorNavigation.prototype.setTreeViewNavigation = function() {
    // var json = this.makeRoomInfoToJson();
    var json = this.makeRoomDataToJson();
    setTreeView(json); // this function must in html
  }



  /**
   */
  IndoorNavigation.prototype.makeRoomData = function() {

    var nowSection = "";
    var nowFloor = "";

    var sectionIndex = -1;
    var edgesLen = this.gmlDataContainer.edges.length;

    for (var i = 0; i < edgesLen; i++) {
      if (this.gmlDataContainer.edges[i].section != nowSection) {

        nowFloor = this.gmlDataContainer.edges[i].floor;
        nowSection = this.gmlDataContainer.edges[i].section;

        this.sectionData.push(nowSection);

        var newSection = new Array();
        newSection.push(nowFloor);

        this.floorData.push(newSection);
        sectionIndex++;
      } else if (this.gmlDataContainer.edges[i].floor != nowFloor &&
        this.gmlDataContainer.edges[i].section == nowSection) {

        nowFloor = this.gmlDataContainer.edges[i].floor;

        this.floorData[sectionIndex].push(nowFloor);
      }

      for (var j = 0; j < 2; j++) {
        var tmpRoomInfo = new RoomInfo(
          null,
          nowSection,
          nowFloor,
          this.gmlDataContainer.edges[i].stateMembers[j].coordinates[0],
          this.gmlDataContainer.edges[i].stateMembers[j].coordinates[1],
          this.gmlDataContainer.edges[i].stateMembers[j].coordinates[2],
          this.gmlDataContainer.edges[i].connects[j]);

        this.roomData.set(this.gmlDataContainer.edges[i].connects[j], tmpRoomInfo);
      }
    }
  }



  /**
   * @return {Object}
   */
  IndoorNavigation.prototype.makeRoomDataToJson = function() {
    var roomArray = new Array();

    for (var i = 0; i < this.sectionData.length; i++) {
      var sectionInfo = new Object();
      sectionInfo.id = this.sectionData[i];
      sectionInfo.parent = "#";
      sectionInfo.text = sectionInfo.id;
      roomArray.push(sectionInfo);
    }

    for (var i = 0; i < this.floorData.length; i++) {
      for (var j = 0; j < this.floorData[i].length; j++) {
        var floorInfo = new Object();
        floorInfo.id = this.sectionData[i] + this.floorData[i][j];
        floorInfo.parent = this.sectionData[i];
        floorInfo.text = "Floor : " + this.floorData[i][j];
        roomArray.push(floorInfo);
      }
    }

    for (var key of this.roomData.keys()){
      var roomInfo = new Object();
      roomInfo.id = key;
      roomInfo.parent = this.roomData.get(key).section+this.roomData.get(key).floor;
      roomInfo.text = key;
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
      var a1 = this.get_node(a);
      var b1 = this.get_node(b);
      if (a1.icon == b1.icon) return (a1.text > b1.text) ? 1 : -1;
      else return (a1.icon > b1.icon) ? 1 : -1;
    }


    var jsonInfo = new Object();
    jsonInfo.core = dataInfo;
    jsonInfo.themes = themeInfo;
    jsonInfo.plugins = pluginInfo;
    jsonInfo.sort = sortInfo;

    console.log(jsonInfo);
    return jsonInfo;
  }



  /**
   * @param {Array} roomHref
   */
  IndoorNavigation.prototype.onClickTreeView = function(roomHref) {
    var pickedRoom = this.roomData.get(roomHref[0]);
    // var pickedRoom = this.roomInfo.get(roomHref[0]);

    if (pickedRoom == null) {
      // open lower tree
    }

    console.log(pickedRoom);

    this.nowMoveState.srcHref = roomHref[0];
    this.nowMoveState.dstHref = null;
    this.nowMoveState.T = 0;

    this.camera.flyTo({
      destination: new Cesium.Cartesian3(
        pickedRoom.coordination.x,
        pickedRoom.coordination.y,
        pickedRoom.coordination.z + this.zfactor
      ),
      orientation: {
        heading: Cesium.Math.toRadians(90.0),
        pitch: Cesium.Math.toRadians(0),
        roll: 0.0
      }
    });

    console.log(this.nowMoveState);
  }



  /**
   */
  IndoorNavigation.prototype.onClickLeftTurnBtn = function() {
    this.camera.lookLeft(this.turnRate);
  }



  /**
   */
  IndoorNavigation.prototype.onClickRightTurnBtn = function() {
    this.camera.lookRight(this.turnRate);
  }


  /**
   */
  IndoorNavigation.prototype.onClickBackToOrigianlViewBtn = function() {
    this.camera.setView({
      orientation: {
        heading: Cesium.Math.toRadians(90.0),
        pitch: Cesium.Math.toRadians(0),
        roll: 0.0
      }
    });
  }



  /**
   */
  IndoorNavigation.prototype.onClickZoomInBtn = function() {
    this.camera.zoomIn(0.2);
  }



  /**
   */
  IndoorNavigation.prototype.onClickZoomOutBtn = function() {
    this.camera.zoomOut(0.2);
  }



  /**
   */
  IndoorNavigation.prototype.checkAndAssignDst = function() {

    if (this.nowMoveState.T == 0) { // camera is on src node, find new dst
      console.log("now on src");

      var tmp = this.getNewDst();
      if (tmp != null) this.nowMoveState.dstHref = tmp.href;
      else this.nowMoveState.dstHref = null;
    } else if (this.nowMoveState.T == 1) { // camera is on dst node, find new dst
      console.log("now on dst");
      this.nowMoveState.srcHref = this.nowMoveState.dstHref;

      var tmp = this.getNewDst();
      if (tmp != null) this.nowMoveState.dstHref = tmp.href;
      else this.nowMoveState.dstHref = null;
      this.nowMoveState.T = 0;

    }
  }



  /**
   */
  IndoorNavigation.prototype.onClickMoveFrontBtn = function() {

    this.checkAndAssignDst();

    var now = new Coordination(this.camera.position.x, this.camera.position.y, this.camera.position.z);

    console.log(this.nowMoveState.dstHref);
    if (this.nowMoveState.dstHref != null) {
      var direction = this.getDirection(
        this.roomData.get(this.nowMoveState.srcHref).coordination,
        this.roomData.get(this.nowMoveState.dstHref).coordination,
        now,
        Cesium.Math.toDegrees(this.camera.heading));

      if (direction == 0 && this.nowMoveState.T != 0) { //camera see src direction
        this.moveToSrc(
          this.roomData.get(this.nowMoveState.srcHref).coordination,
          this.roomData.get(this.nowMoveState.dstHref).coordination,
          this.nowMoveState.T);
        this.nowMoveState.T -= this.moveRate;
      } else if (direction == 1 && this.nowMoveState.T != 1) { //camera see dst direction
        this.moveToDst(
          this.roomData.get(this.nowMoveState.srcHref).coordination,
          this.roomData.get(this.nowMoveState.dstHref).coordination,
          this.nowMoveState.T);
        this.nowMoveState.T += this.moveRate;
      } else if (direction == -1) {} else {
        console.log("error! ");
      }
    }
  }



  /**
   */
  IndoorNavigation.prototype.onClickMoveBackwardBtn = function() {

    this.checkAndAssignDst();

    var now = new Coordination(this.camera.position.x, this.camera.position.y, this.camera.position.z);

    if (this.nowMoveState.dstHref != null) {
      var direction = this.getDirection(
        this.roomData.get(this.nowMoveState.srcHref).coordination,
        this.roomData.get(this.nowMoveState.dstHref).coordination,
        now,
        Cesium.Math.toDegrees(this.camera.heading));
      console.log(direction)

      if (direction == 0 && this.nowMoveState.T != 1) {
        this.moveToDst(
          this.roomData.get(this.nowMoveState.srcHref).coordination,
          this.roomData.get(this.nowMoveState.dstHref).coordination,
          this.nowMoveState.T);
        this.nowMoveState.T += moveRate;
      } else if (direction == 1 && this.nowMoveState.T != 0) {
        this.moveToSrc(
          this.roomData.get(this.nowMoveState.srcHref).coordination,
          this.roomData.get(this.nowMoveState.dstHref).coordination,
          this.nowMoveState.T);
        nowMoveState.T -= moveRate;
      } else if (direction == -1) {

      } else {
        console.log("error! ", direction);
      }
    }
  }



  /**
   * @description transform position of camera using flyTo function
   * @param {Coordination} newPosition
   */
  IndoorNavigation.prototype.transformCamera = function(newPosition) {

    var heading = this.camera.heading;
    var pitch = this.camera.pitch;
    var roll = this.camera.roll;

    this.camera.flyTo({
      destination: new Cesium.Cartesian3(
        newPosition.x,
        newPosition.y,
        newPosition.z + this.zfactor
      ),
      orientation: {
        heading: heading,
        pitch: pitch,
        roll: roll
      }
    });

  }



  /**
   * @description Determines whether to move from now to src or dst.
   * @param {Coordination} src coordinate of source
   * @param {Coordination} dst coordinate of destination
   * @param {Coordination} now coordinate of camera
   * @param {number} heading camera heading
   * @return {number} direction, 0 : source, 1 : destination, -1 : under threshold/not move
   */
  IndoorNavigation.prototype.getDirection = function(src, dst, now, heading) {

    var srcAngle = Cesium.Cartesian3.angleBetween(new Cesium.Cartesian3(src.x, src.y, src.z), this.camera.direction);
    var dstAngle = Cesium.Cartesian3.angleBetween(new Cesium.Cartesian3(dst.x, dst.y, dst.z), this.camera.direction);

    //	console.log("srcAngle:", srcAngle, "dstAngle:", dstAngle);

    var threshold = 1.568;

    var direction; // dst : 1, src : 0

    var diff = srcAngle - dstAngle;

    if (diff < 0 && srcAngle < threshold) direction = 0;
    else if (diff > 0 && dstAngle > threshold) direction = 1;
    else direction = -1;

    //    if     (direction == 0)  console.log("go ", nowMoveState.srcHref);
    //    else if(direction == 1)  console.log("go ", nowMoveState.dstHref);
    //	else                     console.log("under threshold");

    return direction;
  }



  /**
   * @description The following T means the parameter in the parameter equation in space.
   * @param {Coordination} src coordinate of source
   * @param {Coordination} dst coordinate of destination
   * @param {Coordination} now coordinate of camera
   * @return {number} T
   */
  IndoorNavigation.prototype.getT = function(src, dst, now) {
    return (now.x - src.x) / (dst.x - src.x);
  }



  /**
   * @param {number} newT
   * @param {Coordination} src coordinate of source
   * @param {Coordination} dst coordinate of destination
   * @return {Coordination}
   */
  IndoorNavigation.prototype.getMovedCoordination = function(newT, src, dst) {
    var moved = new Coordination();
    moved.x = newT * (dst.x - src.x) + src.x;
    moved.y = newT * (dst.y - src.y) + src.y;
    moved.z = newT * (dst.z - src.z) + src.z;

    return moved;
  }



  /**
   * @param {Coordination} src coordinate of source
   * @param {Coordination} dst coordinate of destination
   * @param {number} nowT
   */
  IndoorNavigation.prototype.moveToSrc = function(src, dst, nowT) {
    if (nowT == 0) {
      console.log("not move, now on src");
    } // do nothing, camera no src
    else {
      console.log("move to src");
      var newT = nowT - this.moveRate;
      var moved = this.getMovedCoordination(newT, src, dst);
      this.transformCamera(moved);
    }
  }



  /**
   * @param {Coordination} src coordinate of source
   * @param {Coordination} dst coordinate of destination
   * @param {number} nowT
   */
  IndoorNavigation.prototype.moveToDst = function(src, dst, nowT) {
    if (nowT == 1) {
      console.log("not move, now on dst");
    } // do nothing, camera no dst
    else {
      console.log("move to dst");
      var newT = nowT + this.moveRate;
      var moved = this.getMovedCoordination(newT, src, dst);
      this.transformCamera(moved);
    }
  }



  /**
   * @param {Array} dstCandidate
   * @return {Coordination}
   */
  IndoorNavigation.prototype.getMostSimilarNode = function(dstCandidate) {
    var dstCandidateAngle = new Array();

    var nowAngle = Cesium.Cartesian3.angleBetween(this.camera.position, this.camera.direction);

    for (var i = 0; i < dstCandidate.length; i++) {
      var tmpAngle = Cesium.Cartesian3.angleBetween(new Cesium.Cartesian3(dstCandidate[i].x,
          dstCandidate[i].y,
          dstCandidate[i].z),
        this.camera.direction);

      dstCandidateAngle.push(tmpAngle);
    }


    var min = -9999;
    if (dstCandidateAngle.length != 0) {
      min = dstCandidateAngle.reduce(function(previous, current) {
        return previous > current ? current : previous;
      });
    }

    var indexOfMin = dstCandidateAngle.indexOf(min);

    if (indexOfMin == -1) {
      return null;
    }
    console.log(dstCandidateAngle, dstCandidate[indexOfMin]);

    return dstCandidate[indexOfMin];
  }


  /**
   * Returns all edges connected with nowMoveState.src
   * @return {Array} Array of all edges associated with nowMoveState.src
   */
  IndoorNavigation.prototype.getConnectedToNowSrc = function() {

    var connectedEdges = [];
    var edgesLen = this.gmlDataContainer.edges.length;

    for (var i = 0; i < edgesLen; i++) {
      if (this.gmlDataContainer.edges[i].connects[0] == this.nowMoveState.srcHref) {
        connectedEdges.push(this.gmlDataContainer.edges[i]);
      } else if (this.gmlDataContainer.edges[i].connects[1] == this.nowMoveState.srcHref) {
        connectedEdges.push(this.gmlDataContainer.edges[i]);
      }
    }

    return connectedEdges;
  }



  /**
   * Returns coordinates connected with nowMoveState.src
   * @return {Array} Array of all Coordination associated with nowMoveState.src
   */
  IndoorNavigation.prototype.getDstCandidateArray = function() {

    var filteredTransitionMember = new Array();
    filteredTransitionMember = this.getConnectedToNowSrc();

    var dstCandidate = new Array();
    for (var i = 0; i < filteredTransitionMember.length; i++) {
      if (filteredTransitionMember[i].connects[0] == this.nowMoveState.srcHref) {
        var tmpCoor = new Coordination(
          filteredTransitionMember[i].stateMembers[1].coordinates[0],
          filteredTransitionMember[i].stateMembers[1].coordinates[1],
          filteredTransitionMember[i].stateMembers[1].coordinates[2],
          filteredTransitionMember[i].connects[1]);
        dstCandidate.push(tmpCoor);
      } else {
        var tmpCoor = new Coordination(
          filteredTransitionMember[i].stateMembers[0].coordinates[0],
          filteredTransitionMember[i].stateMembers[0].coordinates[1],
          filteredTransitionMember[i].stateMembers[0].coordinates[2],
          filteredTransitionMember[i].connects[0]);
        dstCandidate.push(tmpCoor);
      }
    }

    console.log(dstCandidate);
    return dstCandidate;
  }



  /**
   */
  IndoorNavigation.prototype.getNewDst = function() {

    var dstCandidate = this.getDstCandidateArray();
    var newDstCoordination = this.getMostSimilarNode(dstCandidate);

    return newDstCoordination;
  }



  /**
   * Disable default eventHandlers of Cesium
   */
  IndoorNavigation.prototype.disableDefaultEventHandlers = function() {
    this.scene.screenSpaceCameraController.enableRotate = false;
    this.scene.screenSpaceCameraController.enableTranslate = false;
    this.scene.screenSpaceCameraController.enableZoom = false;
    this.scene.screenSpaceCameraController.enableTilt = false;
    this.scene.screenSpaceCameraController.enableLook = false;
  }



  /**
   */
  IndoorNavigation.prototype.onClickEdge = function(feature) {
    if (Cesium.defined(feature['id']['polyline'])) {

      var lineName = feature['id']['name'];

      var polylineSrc = new Coordination(feature['id']['polyline']['positions'].getValue(0)[0].x,
        feature['id']['polyline']['positions'].getValue(0)[0].y,
        feature['id']['polyline']['positions'].getValue(0)[0].z,
        lineName.substring(lineName.indexOf("#"), lineName.indexOf(",")));

      var polylineDst = new Coordination(feature['id']['polyline']['positions'].getValue(0)[1].x,
        feature['id']['polyline']['positions'].getValue(0)[1].y,
        feature['id']['polyline']['positions'].getValue(0)[1].z,
        lineName.substring(lineName.indexOf(",") + 1));

      var now = this.roomData.get(this.nowMoveState.srcHref).coordination;

      if (now.href != polylineSrc.href && now.href != polylineDst.href) {
        this.setMoveStateForOnClickEdge(polylineSrc, polylineDst);
      } else if(now.href == polylineSrc.href){
        this.nowMoveState.dstHref = polylineDst.href;
      } else if(now.href == polylineDst.href){
        this.nowMoveState.srcHref = polylineSrc.href;
      }

      var direction = this.getDirection(
        this.roomData.get(this.nowMoveState.srcHref).coordination,
        this.roomData.get(this.nowMoveState.dstHref).coordination,
        new Coordination(this.camera.position.x, this.camera.position.y, this.camera.position.z),
        Cesium.Math.toDegrees(this.camera.heading));

      console.log(direction, this.nowMoveState);

      if (direction == 0 && this.nowMoveState.T != 0) { //camera see src direction
        this.moveToSrc(
          this.roomData.get(this.nowMoveState.srcHref).coordination,
          this.roomData.get(this.nowMoveState.dstHref).coordination,
          this.nowMoveState.T);
        this.nowMoveState.T -= this.moveRate;
      } else if (direction == 1 && this.nowMoveState.T != 1) { //camera see dst direction
        this.moveToDst(
          this.roomData.get(this.nowMoveState.srcHref).coordination,
          this.roomData.get(this.nowMoveState.dstHref).coordination,
          this.nowMoveState.T);
        this.nowMoveState.T += this.moveRate;
      } else if (direction == -1) {} else {
        console.log("error! ");
      }

      console.log("polylineSrc", polylineSrc);
      console.log("polylineDst", polylineDst);
      console.log("now", now);
    } else {
      console.log("undefined");
    }
  }


  /**
   */
  IndoorNavigation.prototype.setMoveStateForOnClickEdge = function(polylineSrc, polylineDst) {

    var nowToSrcLen = Cesium.Cartesian3.distance(new Cesium.Cartesian3(polylineSrc.x, polylineSrc.y, polylineSrc.z), this.camera.position);
    var nowToDstLen = Cesium.Cartesian3.distance(new Cesium.Cartesian3(polylineDst.x, polylineDst.y, polylineDst.z), this.camera.position);

    if (nowToSrcLen > nowToDstLen) {
      this.transformCamera(polylineDst);
      this.nowMoveState.srcHref = polylineDst.href;
      this.nowMoveState.dstHref = polylineSrc.href;
      this.nowMoveState.T = 0;
    } else {
      this.transformCamera(polylineSrc);
      this.nowMoveState.srcHref = polylineSrc.href;
      this.nowMoveState.dstHref = polylineDst.href;
      this.nowMoveState.T = 0;
    }

    console.log("setMoveStateForOnClickEdge", this.nowMoveState);
  };



  return IndoorNavigation;
});
