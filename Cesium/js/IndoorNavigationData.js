/**
 * This module provides functions using for navigating building that drew by {@link module: DisplayHelper}.</br>
 * You can navigate the building simply giving these functions to button as onClick action or some the other way.
 * @module IndoorNavigationData
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
   * Create new IndoorNavigationData.
   * @alias module:IndoorNavigationData
   * @param {Cesium.Viewer} viewer
   * @param {GMLDataContainer} gmlDataContainer This value should be same with using in {@link module:DisplayHelper}.
   */
  function IndoorNavigationData(gmlDataContainer) {

    this.gmlDataContainer = gmlDataContainer;

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
     * This factor used in {@link module:IndoorNavigationData.transformCamera} or some functions which required camera moving.</br>
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
   * Set {@link module:IndoorNavigationData.turnRate} value.
   * @param {Number} turnRate This angle, in radian, to rotate.
   */
  IndoorNavigationData.prototype.setTurnRate = function(turnRate) {
    this.turnRate = turnRate;
  }



  /**
   * Set {@link module:IndoorNavigationData.moveRate} value.
   * @param {Number} moveRate This angle, in radian, to rotate.
   */
  IndoorNavigationData.prototype.setMoveRate = function(moveRate) {
    if (1 % moveRate == 0) {
      this.moveRate = moveRate;
    } else {
      console.log("error! Invalid moveRate. 1 mod moveRate should be 0.");
    }
  }



  /**
   * Set {@link module:IndoorNavigationData.zoomRate} value.
   * @param {Number} zoomRate This angle, in radian, to rotate.
   */
  IndoorNavigationData.prototype.setTurnRate = function(zoomRate) {
    this.zoomRate = zoomRate;
  }



  /**
   * Set {@link module:IndoorNavigationData.threshold} value.
   * @param {Number} threshold
   */
  IndoorNavigationData.prototype.setThreshold = function(threshold) {
    this.threshold = threshold;
  }

  /**
   * Set {@link module:IndoorNavigationData.entranceHref} value.
   * @param {Number} threshold
   */
  IndoorNavigationData.prototype.setEntranceHref = function(entranceHref) {
    this.entranceHref = entranceHref;
  }


  /**
   * Set {@link module:IndoorNavigationData.roomData} value.
   */
  IndoorNavigationData.prototype.setRoomData = function() {

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




  return IndoorNavigationData;
});
