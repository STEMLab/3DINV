/**
 * This module provides functions using for navigating building that drew by {@link module: DisplayHelper}.</br>
 * You can navigate the building simply giving these functions to button as onClick action or some the other way.
 * @module IndoorNavigation
 */
define([
  "./Objects/MoveState",
  "./Objects/RoomInfo",
  "./Objects/Coordinate"
], function(
  MoveState,
  RoomInfo,
  Coordinate
) {
  'use strict';

  /**
   * Create new IndoorNavigation.
   * @alias module:IndoorNavigation
   * @param {Cesium.Viewer} viewer
   * @param {GMLDataContainer} gmlDataContainer This value should be same with using in {@link module:DisplayHelper}.
   */
  function IndoorNavigation(viewer, gmlDataContainer) {

    this.gmlDataContainer = gmlDataContainer;

    this.scene = viewer.scene;
    this.camera = viewer.camera;

    /**
     * The angle, in radian, to rotate.
     * @default 0.1
     */
    this.turnRate = 0.1;

    /**
     * The amount of change in T when the camera moves once.</br>
     * A detailed description of T is given in {@link MoveState}.
     * @default 0.5
     */
    this.moveRate = 0.5;

    /**
     * This factor used in {@link module:IndoorNavigation.transformCamera} or some functions which required camera moving.</br>
     * When camera move to some coordinate, camera's z coordinate will move as much as zfactor added from its target coordinate.</br>
     * This value is intended to provide users with adequate navigating by demonstrating the entire area of the space.</br>
     * If the zfactor is not given, the camera will move directly onto the floor and this is not the appropriate UI for the user.
     * @default 2
     */
    this.zfactor = 2;

    /**
     * The amount to zoom in or out.
     * @default 0.2
     */
    this.zoomRate = 0.2;

    /**
     * It defined from {@link MoveState}.</br>
     * This value uses to control movement of the camera.
     */
    this.nowMoveState = new MoveState();

    /**
     * @default 1.568
     */
    this.threshold = 1.568;

    /**
     * key : href, value : {@link RoomInfo}
     */
    this.roomData = new Map();

    this.sectionData = [];
    this.floorData = [];

    /**
     * Href data of entrance of building.
     * @default null
     */
    this.entranceHref = null;

    this.setRoomData();

  }



  /**
   * Set {@link module:IndoorNavigation.turnRate} value.
   * @param {Number} turnRate This angle, in radian, to rotate.
   */
  IndoorNavigation.prototype.setTurnRate = function(turnRate) {
    this.turnRate = turnRate;
  }



  /**
   * Set {@link module:IndoorNavigation.moveRate} value.
   * @param {Number} moveRate This angle, in radian, to rotate.
   */
  IndoorNavigation.prototype.setMoveRate = function(moveRate) {
    if (1 % moveRate == 0) {
      this.moveRate = moveRate;
    } else {
      console.log("error! Invalid moveRate. 1 mod moveRate should be 0.");
    }
  }



  /**
   * Set {@link module:IndoorNavigation.zoomRate} value.
   * @param {Number} zoomRate This angle, in radian, to rotate.
   */
  IndoorNavigation.prototype.setTurnRate = function(zoomRate) {
    this.zoomRate = zoomRate;
  }



  /**
   * Set {@link module:IndoorNavigation.threshold} value.
   * @param {Number} threshold
   */
  IndoorNavigation.prototype.setThreshold = function(threshold) {
    this.threshold = threshold;
  }

  /**
   * Set {@link module:IndoorNavigation.entranceHref} value.
   * @param {Number} threshold
   */
  IndoorNavigation.prototype.setEntranceHref = function(entranceHref) {
    this.entranceHref = entranceHref;
  }



  /**
   * If you want to use tree view containg room data, you can use this function for calling setting function of tree view in html.</br>
   * Recommand tree view plugin is {@link https://github.com/vakata/jstree|jstree}.</br>
   * Make sure that name of function which setting tree view are `setTreeView(data)` like below.
   * ```
   * <script>
   *  function setTreeView(data) {
   *    $(function() {
   *      $('#jstree').jstree(data);
   *    });
   *  }
   * </script>
   * ```
   */
  IndoorNavigation.prototype.setTreeViewNavigation = function() {
    var data = this.makeRoomDataToJson();
    setTreeView(data); // this function must in html
  }



  /**
   * Set {@link module:IndoorNavigation.roomData} value.
   */
  IndoorNavigation.prototype.setRoomData = function() {

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
   * Make Json object for tree view.</br>
   * Json object which made in this function will follow the form requested by {@link https://github.com/vakata/jstree|jstree}.
   * @return {Object}
   */
  IndoorNavigation.prototype.makeRoomDataToJson = function() {
    var roomArray = new Array();

    for (var i = 0; i < this.sectionData.length; i++) {
      var sectionInfo = new Object();
      sectionInfo.id = this.sectionData[i];
      sectionInfo.parent = "#";
      sectionInfo.text = sectionInfo.id;
      sectionInfo.icon = "./jtree_icon/iconmonstr-building-15-16.png";
      roomArray.push(sectionInfo);
    }

    for (var i = 0; i < this.floorData.length; i++) {
      for (var j = 0; j < this.floorData[i].length; j++) {
        var floorInfo = new Object();
        floorInfo.id = this.sectionData[i] + this.floorData[i][j];
        floorInfo.parent = this.sectionData[i];
        floorInfo.text = "Floor : " + this.floorData[i][j];
        floorInfo.icon = "./jtree_icon/iconmonstr-layer-22-16.png"
        roomArray.push(floorInfo);
      }
    }

    for (var key of this.roomData.keys()) {
      var roomInfo = new Object();
      roomInfo.id = key;
      roomInfo.parent = this.roomData.get(key).section + this.roomData.get(key).floor;
      roomInfo.text = key;
      roomInfo.icon = "./jtree_icon/iconmonstr-check-mark-10-12.png";
      roomArray.push(roomInfo);
    }

    var dataInfo = new Object();
    dataInfo.data = roomArray;

    var themeInfo = new Object();
    themeInfo.name = 'proton';
    themeInfo.responsive = true;

    var pluginInfo = ["sort"];
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
   * If click one value of tree view, camera move to a space where that value pointed.</br>
   * To set onclick this function to tree view, you should call function in `main.js` like below.</br>
   * ```
   * $('#jstree').on("changed.jstree", function(e, data) {
   *  indoorNavigation.onClickTreeView(data.selected);
   * });
   * ```
   * @param {Array} roomHref
   */
  IndoorNavigation.prototype.onClickTreeView = function(roomHref) {
    if (this.nowMoveState.srcHref == null && this.nowMoveState.dstHref == null) {
      this.disableDefaultEventHandlers();
    }

    var pickedRoom = this.roomData.get(roomHref[0]);
    // var pickedRoom = this.roomInfo.get(roomHref[0]);

    if (pickedRoom == undefined) {
      return;
    }

    console.log(pickedRoom);

    this.nowMoveState.srcHref = roomHref[0];
    this.nowMoveState.dstHref = null;
    this.nowMoveState.T = 0;

    this.camera.flyTo({
      destination: new Cesium.Cartesian3(
        pickedRoom.coordinate.x,
        pickedRoom.coordinate.y,
        pickedRoom.coordinate.z + this.zfactor
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
   * This function make camera turn to left as much as {@link module:IndoorNavigation.turnRate}.
   */
  IndoorNavigation.prototype.actionTurnLeft = function() {
    this.camera.lookLeft(this.turnRate);
  }



  /**
   * This function make camera turn to right as much as {@link module:IndoorNavigation.turnRate}.
   */
  IndoorNavigation.prototype.actionTurnRight = function() {
    this.camera.lookRight(this.turnRate);
  }


  /**
   * This function make the camera turn to due east and place it horizontally on the ground.
   */
  IndoorNavigation.prototype.actionTurnStraight = function() {
    this.camera.setView({
      orientation: {
        heading: Cesium.Math.toRadians(90.0),
        pitch: Cesium.Math.toRadians(0),
        roll: 0.0
      }
    });
  }



  /**
   *  This function make camera zoom in as much as {@link module:IndoorNavigation.zoomRate}.
   */
  IndoorNavigation.prototype.actionZoomIn = function() {
    this.camera.zoomIn(this.zoomRate);
  }



  /**
   * This function make camera zoom out as much as {@link module:IndoorNavigation.zoomRate}.
   */
  IndoorNavigation.prototype.actionZoomOut = function() {
    this.camera.zoomOut(this.zoomRate);
  }



  /**
   * This function make camera move front, if {@link module:IndoorNavigation.nowMoveState} and the camera is on the right condition.</br>
   * The right conditions include:</br>
   *  1. nowMoveState should have proper source and destination. This will be checked by `checkAndAssignDst`.
   *  2. The heading of the camera should direct source and destination of nowMoveState. This will be checked by `getDirection`
   * </br></br>
   * <img src="./img/img_actionMoveFront.png" width="600" style="margin-left: 50px;" >
   */
  IndoorNavigation.prototype.actionMoveFront = function() {

    /** check first condition*/
    this.checkAndAssignDst();

    var now = new Coordinate(this.camera.position.x, this.camera.position.y, this.camera.position.z);

    if (this.nowMoveState.dstHref != null) {

      /** check second condition */
      var direction = this.getDirection(
        this.roomData.get(this.nowMoveState.srcHref).coordinate,
        this.roomData.get(this.nowMoveState.dstHref).coordinate,
        this.camera.direction);

      if (direction == 0 && this.nowMoveState.T != 0) { //camera see src direction
        this.moveToSrc(
          this.roomData.get(this.nowMoveState.srcHref).coordinate,
          this.roomData.get(this.nowMoveState.dstHref).coordinate,
          this.nowMoveState.T);
        this.nowMoveState.T -= this.moveRate;
      } else if (direction == 1 && this.nowMoveState.T != 1) { //camera see dst direction
        this.moveToDst(
          this.roomData.get(this.nowMoveState.srcHref).coordinate,
          this.roomData.get(this.nowMoveState.dstHref).coordinate,
          this.nowMoveState.T);
        this.nowMoveState.T += this.moveRate;
      } else if (direction == -1) {} else {
        console.log("error! ", direction, this.nowMoveState);
      }
    }
    console.log("actionMoveFront", direction, this.nowMoveState);
  }



  /**
   * This function make camera move back, if {@link module:IndoorNavigation.nowMoveState} and the camera is on the right condition.</br>
   * The conditions for moving is same as `actionMoveFront`, different is in `actionMoveFront` when both of condition appropriate satisfied the camera move to front
   * but in this function the will move to back.
   */
  IndoorNavigation.prototype.actionMoveBack = function() {

    /** check first condition*/
    this.checkAndAssignDst();

    var now = new Coordinate(this.camera.position.x, this.camera.position.y, this.camera.position.z);

    if (this.nowMoveState.dstHref != null) {

      /** check second condition */
      var direction = this.getDirection(
        this.roomData.get(this.nowMoveState.srcHref).coordinate,
        this.roomData.get(this.nowMoveState.dstHref).coordinate,
        this.camera.direction);
      console.log(direction);

      if (direction == 0 && this.nowMoveState.T != 1) {
        this.moveToDst(
          this.roomData.get(this.nowMoveState.srcHref).coordinate,
          this.roomData.get(this.nowMoveState.dstHref).coordinate,
          this.nowMoveState.T);
        this.nowMoveState.T += moveRate;
      } else if (direction == 1 && this.nowMoveState.T != 0) {
        this.moveToSrc(
          this.roomData.get(this.nowMoveState.srcHref).coordinate,
          this.roomData.get(this.nowMoveState.dstHref).coordinate,
          this.nowMoveState.T);
        nowMoveState.T -= moveRate;
      } else if (direction == -1) {
        /** do nothing */
      } else {
        console.log("error! ", direction, this.nowMoveState);
      }
      console.log("actionMoveBack", direction, this.nowMoveState);
    }
  }




  /**
   * Check the condition 1 : nowMoveState should have proper source and destination.</br>
   * This function check that the camera is whether on traveling one edge or not.</br>
   * If the camera is not in the middle of the edge, which means the camera is on some node, assign the node that camera located at the source of nowMoveState and search new destination using `getNewDst`.
   */
  IndoorNavigation.prototype.checkAndAssignDst = function() {

    if (this.nowMoveState.T == 0) { /** camera is on src node, find new dst */
      // console.log("now on src");

      var newDst = this.getNewDst();
      if (newDst != null) this.nowMoveState.dstHref = newDst.href;
      else this.nowMoveState.dstHref = null;
    } else if (this.nowMoveState.T == 1) { /** camera is on dst node, find new dst */
      // console.log("now on dst");
      this.nowMoveState.srcHref = this.nowMoveState.dstHref;

      var newDst = this.getNewDst();
      if (newDst != null) this.nowMoveState.dstHref = newDst.href;
      else this.nowMoveState.dstHref = null;
      this.nowMoveState.T = 0;

    }
  }



  /**
   * Find new destination for nowMoveState.</br>
   * The new destination will satisfy two conditions:</br>
   * 1. The new destination is connected with source of nowMoveState.
   * 2. The location of new destination is most similar to the location, where the camera stare, out of the nodes connected with source of nowMoveState.
   * @return {Coordinate}
   */
  IndoorNavigation.prototype.getNewDst = function() {

    /** Find arry of coordinate which satisfy first condition */
    var dstCandidate = this.getDstCandidateArray();

    /** Find coordinate which satisfy second condition out of `dstCandidate`*/
    var newDstCoordinate = this.getMostSimilarNode(dstCandidate);

    return newDstCoordinate;
  }



  /**
   * Returns array of {@link Coordinate} connected with source of nowMoveState.
   * @return {Array}
   */
  IndoorNavigation.prototype.getDstCandidateArray = function() {

    var filteredTransitionMember = new Array();
    filteredTransitionMember = this.getEdgesConnectedToNowSrc();

    var dstCandidate = new Array();
    for (var i = 0; i < filteredTransitionMember.length; i++) {
      if (filteredTransitionMember[i].connects[0] == this.nowMoveState.srcHref) {
        var tmpCoor = new Coordinate(
          filteredTransitionMember[i].stateMembers[1].coordinates[0],
          filteredTransitionMember[i].stateMembers[1].coordinates[1],
          filteredTransitionMember[i].stateMembers[1].coordinates[2],
          filteredTransitionMember[i].connects[1]);
        dstCandidate.push(tmpCoor);
      } else {
        var tmpCoor = new Coordinate(
          filteredTransitionMember[i].stateMembers[0].coordinates[0],
          filteredTransitionMember[i].stateMembers[0].coordinates[1],
          filteredTransitionMember[i].stateMembers[0].coordinates[2],
          filteredTransitionMember[i].connects[0]);
        dstCandidate.push(tmpCoor);
      }
    }
    // console.log(dstCandidate);
    return dstCandidate;
  }



  /**
   * Returns all edges connected with source of nowMoveState.
   * @return {Array} Array of {@link TransitionMember}
   */
  IndoorNavigation.prototype.getEdgesConnectedToNowSrc = function() {

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
   * This function works as follows.
   * 1. Calculate the angle between the position of the camera and direction where camera stare of the camera.</br>
   * 2. Calculate the angles between the position of destination candidate and direction where camera stare of the camera.
   * 3. Select one of the values found in 2 that most closely matches the angle found in 1. And return its Coordinate.</br>
   *
   * <table style="width:200px;">
   *  <tr>
   *    <td style="vertical-align: bottom; padding:0px 15px"><img src="./img/img_getMostSimilarNode1.png" height="250px"></td>
   *    <td style="vertical-align: bottom; padding:0px 15px"><img src="./img/img_getMostSimilarNode2.png" height="250px"></td>
   *  </tr>
   *  <tr>
   *    <td style="vertical-align: top; padding:0px 15px"><p style="font-size: 12px;">Fig.1 src node and nodes associated with it.</p></td>
   *    <td style="vertical-align: top; padding:0px 15px"><p style="font-size: 12px;">Fig.2 angle between position of camera and direction of camera</p></td>
   *  </tr>
   *  <tr>
   *    <td style="vertical-align: bottom; padding:0px 15px"><img src="./img/img_getMostSimilarNode3.png" height="250px"></td>
   *    <td style="vertical-align: bottom; padding:0px 15px"><img src="./img/img_getMostSimilarNode4.png" height="200px"></td>
   *  </tr>
   *  <tr>
   *    <td style="vertical-align: top; padding:0px 15px"><p style="font-size: 12px;">Fig.3 angles between the position of destination candidate and direction of the camera.</p></td>
   *    <td style="vertical-align: top; padding:0px 15px"><p style="font-size: 12px;">Fig.4 Select one that most closely matches θ_{0}</p></td>
   *  </tr>
   * </table>
   * @param {Array} dstCandidate Array of {@link Coordinate}.</br>Coordinates connected with source of nowMoveState.
   * @return {Coordinate}
   */
  IndoorNavigation.prototype.getMostSimilarNode = function(dstCandidate) {
    var dstCandidateAngle = new Array();

    /** Calculate the angle between the position of the camera and direction where camera stare of the camera. */
    var nowAngle = Cesium.Cartesian3.angleBetween(this.camera.position, this.camera.direction);

    /** Calculate the angles between the position of destination candidate and direction where camera stare of the camera. */
    for (var i = 0; i < dstCandidate.length; i++) {
      var tmpAngle = Cesium.Cartesian3.angleBetween(
        new Cesium.Cartesian3(dstCandidate[i].x, dstCandidate[i].y, dstCandidate[i].z),
        this.camera.direction);
      tmpAngle = Math.abs(tmpAngle - nowAngle);

      dstCandidateAngle.push(tmpAngle);
    }

    /** Select one of the values found in 2 that most closely matches the angle found in 1. And return its Coordinate. */
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

    // console.log(dstCandidateAngle, dstCandidate[indexOfMin]);

    return dstCandidate[indexOfMin];
  }



  /**
   * Determines whether to move from now to src or dst.</br>
   * This function finds the angle between src, dst, and dir, and uses that angle to select the direction.</br>
   * When the angle between src and dir is referred to as srcAngle
   * and the angle between dst and dir is referred to dstAngle,
   * the direction is defined in the three cases below:
   * 1. direction = src : `srcAngle < dstAngle` and `srcAngle < threshold`
   * 2. direction = dst : `srcAngle > dstAngle` and `dstAngle < threshold`
   * 3. no direction : Failure to satisfy 1 and 2</br>
   *
   * <table style="width:200px;">
   *  <tr>
   *    <td style="vertical-align: bottom; padding:0px 15px"><img src="./img/img_getDirection4.png" height="250px"></td>
   *    <td style="vertical-align: bottom; padding:0px 15px"><img src="./img/img_getDirection2.png" height="250px"></td>
   *  </tr>
   *  <tr>
   *    <td style="vertical-align: top; padding:0px 15px"><p style="font-size: 12px;">Fig.4 the situation</p></td>
   *    <td style="vertical-align: top; padding:0px 15px"><p style="font-size: 12px;">Fig.5 direction = src</p></td>
   *  </tr>
   *  <tr>
   *    <td style="vertical-align: bottom; padding:0px 15px"><img src="./img/img_getDirection1.png" height="250px"></td>
   *    <td style="vertical-align: bottom; padding:0px 15px"><img src="./img/img_getDirection3.png" height="250px"></td>
   *  </tr>
   *  <tr>
   *    <td style="vertical-align: top; padding:0px 15px"><p style="font-size: 12px;">Fig.6 direction = dst</p></td>
   *    <td style="vertical-align: top; padding:0px 15px"><p style="font-size: 12px;">Fig.7 no direction</p></td>
   *  </tr>
   * </table>
   * @param {Coordinate} src coordinate of source
   * @param {Coordinate} dst coordinate of destination
   * @param {Cesium.Cartesian3} dir coordinate of camera's direction
   * @return {number} direction, 0 : source, 1 : destination, -1 : under threshold / not move / no direction
   */
  IndoorNavigation.prototype.getDirection = function(src, dst, dir) {

    var srcAngle = Cesium.Cartesian3.angleBetween(new Cesium.Cartesian3(src.x, src.y, src.z), dir);
    var dstAngle = Cesium.Cartesian3.angleBetween(new Cesium.Cartesian3(dst.x, dst.y, dst.z), dir);

    // console.log("srcAngle:", srcAngle, "dstAngle:", dstAngle);

    var direction;

    var diff = srcAngle - dstAngle;

    if (diff < 0 && srcAngle < this.threshold) direction = 0;
    else if (diff > 0 && dstAngle > this.threshold) direction = 1;
    else direction = -1;

    return direction;
  }



  /**
   * Move the camera as much as moveRate to src. </br>
   * A detailed description of the method of movement is described in {@link MoveState.T}.
   * @param {Coordinate} src coordinate of source
   * @param {Coordinate} dst coordinate of destination
   * @param {number} nowT
   */
  IndoorNavigation.prototype.moveToSrc = function(src, dst, nowT) {
    if (nowT == 0) {
      console.log("not move, now on src");
    } else {
      console.log("move to src");
      var newT = nowT - this.moveRate;
      var moved = this.getMovedCoordinate(newT, src, dst);
      this.transformCamera(moved);
    }
  }



  /**
   * Move the camera as much as moveRate to dst. </br>
   * A detailed description of the method of movement is described in {@link MoveState.T}.
   * @param {Coordinate} src coordinate of source
   * @param {Coordinate} dst coordinate of destination
   * @param {number} nowT
   */
  IndoorNavigation.prototype.moveToDst = function(src, dst, nowT) {
    if (nowT == 1) {
      console.log("not move, now on dst");
    } else {
      console.log("move to dst");
      var newT = nowT + this.moveRate;
      var moved = this.getMovedCoordinate(newT, src, dst);
      this.transformCamera(moved);

    }
  }



  /**
   * Calculate the coordinates that will be moved.
   * A detailed description of the calculation method is given in {@link MoveState.T}.
   * @param {number} newT
   * @param {Coordinate} src coordinate of source
   * @param {Coordinate} dst coordinate of destination
   * @return {Coordinate}
   */
  IndoorNavigation.prototype.getMovedCoordinate = function(newT, src, dst) {
    var moved = new Coordinate();
    moved.x = newT * (dst.x - src.x) + src.x;
    moved.y = newT * (dst.y - src.y) + src.y;
    moved.z = newT * (dst.z - src.z) + src.z;

    return moved;
  }



  /**
   * Transform position of camera using flyTo function of Cesium
   * @param {Coordinate} newPosition
   */
  IndoorNavigation.prototype.transformCamera = function(newPosition) {
    console.log(newPosition);

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
   * Calculate T for coordinates.
   * A detailed description of T is given in {@link MoveState.T}.
   * @param {Coordinate} src coordinate of source
   * @param {Coordinate} dst coordinate of destination
   * @param {Coordinate} now coordinate of camera
   * @return {number} T
   */
  IndoorNavigation.prototype.getT = function(src, dst, now) {
    return (now.x - src.x) / (dst.x - src.x);
  }



  /**
   * Disable default eventHandlers of Cesium.
   */
  IndoorNavigation.prototype.disableDefaultEventHandlers = function() {
    this.scene.screenSpaceCameraController.enableRotate = false;
    this.scene.screenSpaceCameraController.enableTranslate = false;
    this.scene.screenSpaceCameraController.enableZoom = false;
    this.scene.screenSpaceCameraController.enableTilt = false;
    this.scene.screenSpaceCameraController.enableLook = false;
  }



  /**
   * This is a function that should be executed when clicking the edge(path) visualized with Polyline.</br>
   * This reads the `id` from the clicked object and parses the `linename` consisting of the href values ​​at both ends of the edge
   * and passes it to {@link module:IndoorNavigation.onClickPath}.
   * @param {Cesium.Cesium3DTileFeature} feature Information about the items selected in the viewer.
   * @example
   * var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
   * handler.setInputAction(function(movement) {
   *  var feature = viewer.scene.pick(movement.position);
   *  if (Cesium.defined(feature)) {
   *    indoorNavigation.onClickPolylinePath(feature);
   *  }
   * }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
   */
  IndoorNavigation.prototype.onClickPolylinePath = function(feature) {

    if (feature['id'] == undefined) {
      if (this.nowMoveState.srcHref == null) {
        this.firstClickOnBuilding();
      }
    } else if (feature['id']['polyline'] != undefined) {

      /** Abstract edge data from path */
      var lineName = feature['id']['name'];
      this.onClickPath(lineName);
    }
  }


  /**
   * This is a function that should be executed when clicking the edge(path) visualized with Polygon.</br>
   * This reads the `id` from the clicked object and parses the `linename` consisting of the href values ​​at both ends of the edge
   * and passes it to {@link module:IndoorNavigation.onClickPath}.
   * @param {Cesium.Cesium3DTileFeature} feature Information about the items selected in the viewer.
   * @example
   * var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
   * handler.setInputAction(function(movement) {
   *  var feature = viewer.scene.pick(movement.position);
   *  if (Cesium.defined(feature)) {
   *    indoorNavigation.onClickPolygonPath(feature);
   *  }
   * }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
   */
  IndoorNavigation.prototype.onClickPolygonPath = function(feature) {
    console.log(feature);

    if (feature['id'] == undefined) {
      if (this.nowMoveState.srcHref == null) {
        this.firstClickOnBuilding();
      }
    } else {
      var lineName = feature['id'];
      this.onClickPath(lineName);
    }
  }


  /**
   * This function works in the following order.</br>
   * 1. Parse src and dst href data from lineName
   * 2. Check whether there is a part where nowMoveState overlaps with href data parsed in 1.</br>
   *    A. If there is no overlap, set {@link module:IndoorNavigation.nowMoveState} to path data.</br>
   *    B. If the camera is on src of edge, assign {@link module:IndoorNavigation.nowMoveState}.dstHref to dst of edge.</br>
   *    C. If the camera is on dst of edge, assign {@link module:IndoorNavigation.nowMoveState}.srcHref to src of edge.
   * 3. Get direction to move and move the camera. This working like {@link module:IndoorNavigation.actionMoveFront}.
   * @param {String} lineName consisting of the href values ​​at both ends of clicked edge.
   */
  IndoorNavigation.prototype.onClickPath = function(lineName) {

    /** parse href data from lineName */
    var pathSrcHref = lineName.substring(lineName.indexOf("#"), lineName.indexOf(","));
    var pathDstHref = lineName.substring(lineName.indexOf(",") + 1);

    var pathSrcCoor = this.roomData.get(pathSrcHref).coordinate;
    var pathDstCoor = this.roomData.get(pathDstHref).coordinate;

    /** coordinate data where camera exist now. */
    var now = new Coordinate();
    if (this.nowMoveState.srcHref != null) {
      now = this.roomData.get(this.nowMoveState.srcHref).coordinate;
    }

    if (now.href != pathSrcCoor.href || now.href != pathDstCoor.href) {
      /** if value of clicked edge not matches from nowMoveState data, set nowMoveState to path data */
      this.setMoveStateForOnClickEdge(pathSrcCoor, pathDstCoor);
    } else if (now.href == pathSrcCoor.href) {
      this.nowMoveState.dstHref = pathDstCoor.href;
      this.nowMoveState.srcHref = now.href;
    } else if (now.href == pathDstCoor.href) {
      this.nowMoveState.srcHref = pathSrcCoor.href;
      this.nowMoveState.dstHref = now.href;
    }

    var direction = this.getDirection(
      this.roomData.get(this.nowMoveState.srcHref).coordinate,
      this.roomData.get(this.nowMoveState.dstHref).coordinate,
      this.camera.direction);

    if (direction == 0 && this.nowMoveState.T != 0) { /** camera see src direction */
      this.moveToSrc(
        this.roomData.get(this.nowMoveState.srcHref).coordinate,
        this.roomData.get(this.nowMoveState.dstHref).coordinate,
        this.nowMoveState.T);
      this.nowMoveState.T -= this.moveRate;
    } else if (direction == 1 && this.nowMoveState.T != 1) { /** camera see dst direction */
      this.moveToDst(
        this.roomData.get(this.nowMoveState.srcHref).coordinate,
        this.roomData.get(this.nowMoveState.dstHref).coordinate,
        this.nowMoveState.T);
      this.nowMoveState.T += this.moveRate;
    } else if (direction == -1) {
      /** over threshold, not move */
    } else {
      console.log("error! ", direction, this.nowMoveState);
    }
  }


  /**
   * Until you click on the building, you can freely explore the exterior of the building through the action of the mouse.</br>
   * This function is called when the building is first clicked</br>
   * This makes to move the camera to a space known as the building's entrance({@link module:IndoorNavigation.entranceHref}),
   * and disables the default events provide by cesium.</br>
   * After this function, you can visit the room through the functions that are defined in the {@link module:IndoorNavigation}.
   * {@link module:IndoorNavigation.setEntranceHref} must be called for this to work properly.
   */
  IndoorNavigation.prototype.firstClickOnBuilding = function() {
    if (this.entranceHref != null) {
      console.log(this.roomData.get(this.entranceHref));
      var roomHref = [];
      roomHref[0] = this.entranceHref;
      this.onClickTreeView(roomHref);
    }
  }


  /**
   * If edge is clicked, the coordinates of both ends of edge are read,
   * and the side closer to the current coordinate is assigned to {@link module:IndoorNavigation.nowMoveState.srcHref}
   * and the far side is assigned to {@link module:IndoorNavigation.nowMoveState.dstHref}.
   */
  IndoorNavigation.prototype.setMoveStateForOnClickEdge = function(src, dst) {

    var nowToSrcLen = Cesium.Cartesian3.distance(new Cesium.Cartesian3(src.x, src.y, src.z), this.camera.position);
    var nowToDstLen = Cesium.Cartesian3.distance(new Cesium.Cartesian3(dst.x, dst.y, dst.z), this.camera.position);

    if (nowToSrcLen > nowToDstLen) {
      this.transformCamera(dst);
      this.nowMoveState.srcHref = dst.href;
      this.nowMoveState.dstHref = src.href;
      this.nowMoveState.T = 0;
    } else {
      this.transformCamera(src);
      this.nowMoveState.srcHref = src.href;
      this.nowMoveState.dstHref = dst.href;
      this.nowMoveState.T = 0;
    }
  };


  /**
   * @param {Cesium.Cartesian3} buildingCoor
   * @param {Number} xfactor
   * @param {Number} yfactor
   * @param {Number} zfactor
   * @param {Number} heading
   */
  IndoorNavigation.prototype.flyToBuilding = function(buildingCoor, heading, pitch, roll) {
    this.camera.flyTo({
      destination: new Cesium.Cartesian3(
        buildingCoor.x,
        buildingCoor.y,
        buildingCoor.z
      ),
      orientation: {
        heading: heading,
        pitch: pitch,
        roll: roll
      }
    });
  }



  return IndoorNavigation;
});
