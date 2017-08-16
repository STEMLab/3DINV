/**
  * A module containing Data from IndoorGML.
  * @module IndoorNavigation
  * @description This module contains the functions required to navigate in 3D buildings built in DisplayHelper. Unlike existing maps, the indoor space viewer is restricted due to the spatial factor of the wall. With this in mind, this module ensures that the user moves only on the network defined in the GML file to limit unusual behavior such as user penetration through the wall.
  */
define([
  "./Objects/CellSpaceMember",
  "./Objects/SurfaceMember",
  "./Objects/StateMember",
  "./Objects/TransitionMember"
], function(
  CellSpaceMember,
  SurfaceMember,
  StateMember,
  TransitionMember
) {
  'use strict';


  /**
   * Create new GMLDataContainer
   * @class
   * @param {Object} jsonresponse JSON object parsed from inputed json data file
   */
  function GMLDataContainer(jsonresponse) {

    this.jsonresponse = jsonresponse;
    this.nodes = [];
    this.edges = [];
    this.cellSpaceMembers = [];
    this.cellSpaceBoundaryMembers = [];

    // Variables where the maximum coordinates will be stored
    this.max_X = 0;
    this.max_Y = 0;
    this.max_Z = 0;

    // Variables where the minimum coordinates will be stored
    this.min_X = 0;
    this.min_Y = 0;
    this.min_Z = 0;

    // Center of Buliding
    this.center_X = 0;
    this.center_Y = 0;

    this.ENU = new Cesium.Matrix4(); // The object onto which to store the transformation result


    this.parsingJson(jsonresponse);
    this.setCenter();
  }



  /**
   * @description Parse the data required to produce the viewer in the JSON object.
   * @param {Object} jsonresponse JSON object parsed from inputed json data file
   */
  GMLDataContainer.prototype.parsingJson = function(jsonresponse) {

    this.parsingNodeData(jsonresponse);
    this.parsingEdgeData(jsonresponse);
    this.parsingCellSpaceMember(jsonresponse);
    this.parsingCellSpaceBoundaryMember(jsonresponse);

  };



  /**
   * @description abstract stateMember data from JSON object and save it as nodes
   * @param {Object} jsonresponse JSON object parsed from inputed json data file
   */
  GMLDataContainer.prototype.parsingNodeData = function(jsonresponse) {

    // Extracting state members
    var sm = jsonresponse.value.multiLayeredGraph.spaceLayers["0"].spaceLayerMember["0"].spaceLayer.nodes["0"].stateMember;
    var smLen = sm.length;

    for (var j = 0; j < smLen; j++) {

      var coordinates = sm[j].state.geometry.point.pos.value;
      var stateMemberObject = new StateMember(coordinates);

      // Adding the state member to the nodes array
      this.nodes.push(stateMemberObject);
    }
  };



  /**
   * @description abstract transitionMember data from JSON object and save it as edges
   * @param {Object} jsonresponse JSON object parsed from inputed json data file
   */
  GMLDataContainer.prototype.parsingEdgeData = function(jsonresponse) {

    // Extracting transition members
    var tm = jsonresponse.value.multiLayeredGraph.spaceLayers["0"].spaceLayerMember["0"].spaceLayer.edges["0"].transitionMember;

    // Loop through transition Members and extracting connection, description and state members of each transition member
    for (var i = 0; i < tm.length; i++) {

      // Array of connections of a transition member
      var connects = [];

      // Getting the href of each connection
      for (var j = 0; j < tm[i].transition.connects.length; j++) {
        connects.push(tm[i].transition.connects[j].href);
      }

      // Description of a transition member
      var description;
      if (tm[i].transition.description != null) {
        description = tm[i].transition.description.value;
      }


      // Array of state members
      var stateMembers = [];

      // Getting coordinates of each state member
      for (var k = 0; k < tm[i].transition.geometry.abstractCurve.value.posOrPointPropertyOrPointRep.length; k++) {
        // Creating a state member instance

        var coordinates = tm[i].transition.geometry.abstractCurve.value.posOrPointPropertyOrPointRep[k].value.value;
        var smObject = new StateMember(coordinates);


        // smObject.coordinates.push(coordinates[0], coordinates[1], coordinates[2]);
        stateMembers.push(smObject);
      }


      // Creating a transition member instance
      var transitionMemberObject = new TransitionMember(connects, description, stateMembers);


      // Adding the transition member to edges array
      this.edges.push(transitionMemberObject);
    }
  };



  /**
   * @description abstract cellSpaceMember data from JSON object and save it as cellSpaceMembers
   * @param {Object} jsonresponse JSON object parsed from inputed json data file
   */
  GMLDataContainer.prototype.parsingCellSpaceMember = function(jsonresponse) {

    var cellSpaceMemberLen = jsonresponse.value.primalSpaceFeatures.primalSpaceFeatures.cellSpaceMember.length;

    for (var i = 0; i < cellSpaceMemberLen; i++) {

      // Cell space member
      var csm = jsonresponse.value.primalSpaceFeatures.primalSpaceFeatures.cellSpaceMember[i];

      // Extracting the description of the cell space member
      var description = "";
      if (csm.abstractFeature.value.description != null) {
        description = csm.abstractFeature.value.description.value;
      }

      var id = "";
      if (csm.abstractFeature.value.id != null) {
        id = csm.abstractFeature.value.id;
      }

      // Extracting the href of the cell space member
      var href = "";
      if (csm.abstractFeature.value.duality.href != null) {
        href = csm.abstractFeature.value.duality.href;
      }


      // Creating an instance of the cell space member
      var csmObject = new CellSpaceMember(description, href, id, []);

      // Number of surface members
      if (csm.abstractFeature.value.geometry3D != null) {
        csmObject.surfaceMember = this.getCsmSurfaceMemberFromGeometry3D(csm);
      } else if (csm.abstractFeature.value.geometry2D != null) {
        csmObject.surfaceMember = this.getCsmSurfaceMemberFromGeometry2D(csm);
      }


      // Filling the array with the cell space member instancesBut the problem with outline has not been solved yet.
      this.cellSpaceMembers.push(csmObject);
    }
  };



  /**
   * @description Abstract cellSpaceBoundaryMember data from JSON object and save it as CellSpaceBoundaryMembers
   * @param {Object} jsonresponse JSON object parsed from inputed json data file
   */
  GMLDataContainer.prototype.parsingCellSpaceBoundaryMember = function(jsonresponse) {
    var cellSpaceBoundaryMemberLen = jsonresponse.value.primalSpaceFeatures.primalSpaceFeatures.cellSpaceBoundaryMember.length;

    for (var i = 0; i < cellSpaceBoundaryMemberLen; i++) {

      var csbm = jsonresponse.value.primalSpaceFeatures.primalSpaceFeatures.cellSpaceBoundaryMember[i];

      var description = "";
      if (csbm.abstractFeature.value.description != null) {
        description = csbm.abstractFeature.value.description.value;
      }

      var id = "";
      if (csbm.abstractFeature.value.id != null) {
        id = csbm.abstractFeature.value.id;
      }

      // Extracting the href of the cell space member
      var href = "";
      if (csbm.abstractFeature.value.duality != null) {
        href = csbm.abstractFeature.value.duality.href;
      }

      // Creating an instance of the cell space member
      var csbmObject = new CellSpaceMember(description, href, id, []);

      // Number of surface members
      if (csbm.abstractFeature.value.geometry3D != null) {
        csbmObject.surfaceMember = this.getCsbmSurfaceMemberFromGeometry3D(csbm);
      }

      this.cellSpaceBoundaryMembers.push(csbmObject);
    }
  };



  /**
   * @description Extract surfaceMember of cellSpaceMember from the JSON object when the surface of the given GML file is configured with geometry3D.
   * @param {Object} csm CellSpaceMember, cellSpaceMember part of jsonresponse.
   * @returns {SurfaceMember}
   */
  GMLDataContainer.prototype.getCsmSurfaceMemberFromGeometry3D = function(csm) {
    // get surface MemberLen
    var surfaceMemberLen = csm.abstractFeature.value.geometry3D.abstractSolid.value.exterior.shell.surfaceMember.length;

    var surfaceMembers = [];

    // Loop through the surface members and creating instances;
    for (var j = 0; j < surfaceMemberLen; j++) {

      // Surface member
      var sm = csm.abstractFeature.value.geometry3D.abstractSolid.value.exterior.shell.surfaceMember[j];

      // Creating an instance of the surface member`
      var smObject = new SurfaceMember([]);

      // Number of coordinates of the surface member
      var coordLen = sm.abstractSurface.value.exterior.abstractRing.value.posOrPointPropertyOrPointRep.length;

      var value = sm.abstractSurface.value.exterior.abstractRing.value.posOrPointPropertyOrPointRep;

      // Loop through the coordinates of a surfaceMember
      for (var k = 0; k < coordLen; k++) {
        smObject = this.abstractCoordination(value[k].value.value, smObject);
      }

      //Adding the surface member to the corresponding cell space member
      surfaceMembers.push(smObject);
    }
    return surfaceMembers;
  }



  /**
   * @description Extract surfaceMember of cellSpaceMember from the JSON object when the surface of the given GML file is configured with geometry2D.
   * @param {Object} csm CellSpaceMember, cellSpaceMember part of jsonresponse.
   * @returns {SurfaceMember}
   */
  GMLDataContainer.prototype.getCsmSurfaceMemberFromGeometry2D = function(csm) {
    // get surface MemberLen

    var surfaceMembers = [];

    // abstractRing
    var ar = csm.abstractFeature.value.geometry2D.abstractSurface.value.exterior.abstractRing;

    // Creating an instance of abstractRing
    var arObject = new SurfaceMember([]);

    // Number of coordinates of the surface member
    var coordLen = ar.value.posOrPointPropertyOrPointRep.length;

    // Loop through the coordinates of a surfaceMember
    for (var i = 0; i < coordLen; i++) {
      arObject = this.abstractCoordination(ar.value.posOrPointPropertyOrPointRep[i].value.value, arObject);
    }

    surfaceMembers.push(arObject);

    return surfaceMembers;
  }



  /**
   * @description Extract surfaceMember of cellSpaceBoundaryMember from the JSON object when the surface of the given GML file is configured with geometry3D.
   * @param {Object} csm cellSpaceBoundaryMember, cellSpaceBoundaryMember part of jsonresponse.
   * @returns {SurfaceMember}
   */
  GMLDataContainer.prototype.getCsbmSurfaceMemberFromGeometry3D = function(csbm) {

    var smObject = new SurfaceMember([]);

    var surfaceMembers = [];

    if (csbm.abstractFeature.value.geometry3D.abstractSurface.value.exterior != null) {

      var coordLen = csbm.abstractFeature.value.geometry3D.abstractSurface.value.exterior.abstractRing.value.posOrPointPropertyOrPointRep.length;
      for (var k = 0; k < coordLen; k++) {
        smObject = this.abstractCoordination(csbm.abstractFeature.value.geometry3D.abstractSurface.value.exterior.abstractRing.value.posOrPointPropertyOrPointRep[k].value.value, smObject);
      }
    }

    surfaceMembers.push(smObject);

    return surfaceMembers;
  }



  /**
   * @description Abstract coordinates from value and save it in object.
   * @param {Array} value array of coordinates.
   * @param {SurfaceMember} object The coordinates obtained from value are stored in object.coordinates.
   * @returns {SurfaceMember}
   */
  GMLDataContainer.prototype.abstractCoordination = function(value, object) {

    // Extracting X
    var X = value[0];
    object.coordinates.push(X);


    // Test if X is maximum or minimum
    if (X > this.max_X) {
      this.max_X = X;
    } else if (X < this.min_X) {
      this.min_X = X;
    }

    // Extracting Y
    var Y = value[1];
    object.coordinates.push(Y);

    if (Y > this.max_Y) {
      this.max_Y = Y;
    } else if (Y < this.min_Y) {
      this.min_Y = Y;
    }

    // Extracting Z
    var Z = value[2];
    object.coordinates.push(Z);

    if (Z > this.max_Z) {
      this.max_Z = Z;
    } else if (Z < this.min_Z) {
      this.min_Z = Z;
    }

    return object;
  }



  /**
   * @description Calculate the central coordinates of the building.
   */
  GMLDataContainer.prototype.setCenter = function() {
    this.center_X = (this.min_X + this.max_X) / 2;
    this.center_Y = (this.min_Y + this.max_Y) / 2;
  }



  /**
   * @description When the input material differs from the actual world, it tries to rotate the building to reduce the gap.
   * @param {} viewer
   * @param {} position
   * @param {} angle
   */
  GMLDataContainer.prototype.rotateBuilding = function(viewer, position, angle) {

    var ellipsoid = viewer.scene.globe.ellipsoid;

    var orientation = new Cesium.Matrix4(Math.cos(angle), -Math.sin(angle), 0, 0,
      Math.sin(angle), Math.cos(angle), 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1); // Rotation matrix


    this.rotateCellSpaceMember(orientation, position, ellipsoid);
    this.rotateCellSpaceBoundaryMembers(orientation, position, ellipsoid);
    this.rotateNodes(orientation);
    this.rotateEdges(orientation);

  }



  /**
   * @description rotate nodes
   * @param {} orientation
   * @param {} ENU
   */
  GMLDataContainer.prototype.rotateNodes = function(orientation) {

    var nodesLen = this.nodes.length;
    // Applying translation and rotation to the nodes
    for (var i = 0; i < nodesLen; i++) {

      // Translating coordinates + converting the result to Cartesian3
      var offset = new Cesium.Cartesian3(this.nodes[i].coordinates[0] - this.center_X,
        this.nodes[i].coordinates[1] - this.center_Y,
        this.nodes[i].coordinates[2] - this.min_Z);

      // Applying rotation to the offset
      var finalPos = Cesium.Matrix4.multiplyByPoint(orientation, offset, new Cesium.Cartesian3());

      // Report offset to the actual position of LWM
      var new_coord = Cesium.Matrix4.multiplyByPoint(this.ENU, finalPos, finalPos);

      // Replacing the old coordinates by the new ones
      this.nodes[i].coordinates[0] = new_coord.x;
      this.nodes[i].coordinates[1] = new_coord.y;
      this.nodes[i].coordinates[2] = new_coord.z;
    }
  }



  /**
   * @description rotate edges
   * @param {} orientation
   * @param {} ENU
   */
  GMLDataContainer.prototype.rotateEdges = function(orientation) {

    // Applying translation and rotation to the edges
    for (var i = 0; i < this.edges.length; i++) {

      for (var j = 0; j < this.edges[i].stateMembers.length; j++) {

        var offset = new Cesium.Cartesian3(this.edges[i].stateMembers[j].coordinates[0] - this.center_X,
          this.edges[i].stateMembers[j].coordinates[1] - this.center_Y,
          this.edges[i].stateMembers[j].coordinates[2] - this.min_Z);

        var finalPos = Cesium.Matrix4.multiplyByPoint(orientation, offset, new Cesium.Cartesian3());

        var new_coord = Cesium.Matrix4.multiplyByPoint(this.ENU, finalPos, finalPos);

        this.edges[i].stateMembers[j].coordinates[0] = new_coord.x;
        this.edges[i].stateMembers[j].coordinates[1] = new_coord.y;
        this.edges[i].stateMembers[j].coordinates[2] = new_coord.z;
      }
    }
  }



  /**
   * @description rotate cellSpaceMembers
   * @param {} orientation
   * @param {} ENU
   * @param {} position
   * @param {} ellipsoid
   */
  GMLDataContainer.prototype.rotateCellSpaceMember = function(orientation, position, ellipsoid) {

    Cesium.Transforms.eastNorthUpToFixedFrame(position, ellipsoid, this.ENU);

    // Applying translation and rotation to coordinates
    for (var i = 0; i < this.cellSpaceMembers.length; i++) {

      var csmLen = this.cellSpaceMembers[i].surfaceMember.length;

      for (var j = 0; j < csmLen; j++) {
        var smLen = this.cellSpaceMembers[i].surfaceMember[j].coordinates.length;

        for (var k = 0; k < smLen; k += 3) {

          // Translating coordinates + converting the result to Cartesian3
          var offset = new Cesium.Cartesian3(this.cellSpaceMembers[i].surfaceMember[j].coordinates[k] - this.center_X,
            this.cellSpaceMembers[i].surfaceMember[j].coordinates[k + 1] - this.center_Y,
            this.cellSpaceMembers[i].surfaceMember[j].coordinates[k + 2] - this.min_Z);

          // Applying rotation to the offset
          var finalPos = Cesium.Matrix4.multiplyByPoint(orientation, offset, new Cesium.Cartesian3());

          // Report offset to the actual position of LWM
          var new_coord = Cesium.Matrix4.multiplyByPoint(this.ENU, finalPos, finalPos);

          // Replacing the old coordinates by the new ones
          this.cellSpaceMembers[i].surfaceMember[j].coordinates[k] = new_coord.x;
          this.cellSpaceMembers[i].surfaceMember[j].coordinates[k + 1] = new_coord.y;
          this.cellSpaceMembers[i].surfaceMember[j].coordinates[k + 2] = new_coord.z;
        }
      }
    }
  }



  /**
   * @description rotate cellSpaceBoundaryMembers
   * @param {} orientation
   * @param {} ENU
   * @param {} position
   * @param {} ellipsoid
   */
  GMLDataContainer.prototype.rotateCellSpaceBoundaryMembers = function(orientation, position, ellipsoid) {

    Cesium.Transforms.eastNorthUpToFixedFrame(position, ellipsoid, this.ENU);

    // Applying translation and rotation to coordinates
    for (var i = 0; i < this.cellSpaceBoundaryMembers.length; i++) {

      var csmLen = this.cellSpaceBoundaryMembers[i].surfaceMember.length;

      for (var j = 0; j < csmLen; j++) {
        var smLen = this.cellSpaceBoundaryMembers[i].surfaceMember[j].coordinates.length;

        for (var k = 0; k < smLen; k += 3) {

          // Translating coordinates + converting the result to Cartesian3
          var offset = new Cesium.Cartesian3(this.cellSpaceBoundaryMembers[i].surfaceMember[j].coordinates[k] - this.center_X,
            this.cellSpaceBoundaryMembers[i].surfaceMember[j].coordinates[k + 1] - this.center_Y,
            this.cellSpaceBoundaryMembers[i].surfaceMember[j].coordinates[k + 2] - this.min_Z);

          // Applying rotation to the offset
          var finalPos = Cesium.Matrix4.multiplyByPoint(orientation, offset, new Cesium.Cartesian3());

          // Report offset to the actual position of LWM
          var new_coord = Cesium.Matrix4.multiplyByPoint(this.ENU, finalPos, finalPos);

          // Replacing the old coordinates by the new ones
          this.cellSpaceBoundaryMembers[i].surfaceMember[j].coordinates[k] = new_coord.x;
          this.cellSpaceBoundaryMembers[i].surfaceMember[j].coordinates[k + 1] = new_coord.y;
          this.cellSpaceBoundaryMembers[i].surfaceMember[j].coordinates[k + 2] = new_coord.z;
        }
      }
    }
  }


  return GMLDataContainer;

});
