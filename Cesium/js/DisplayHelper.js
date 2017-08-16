define([
  "./GMLDataContainer",
  "./Objects/PrimitiveOption"
], function(
  GMLDataContainer,
  PrimitiveOption
) {
  'use strict';


  /**
   * @description The class for the UI implementation of the Viewer in Cesium.
   * @param {GMLDataContainer} GMLDataContainer
   */
  function DisplayHelper(GMLDataContainer) {

    this.gmlDataContainer = GMLDataContainer;


    // Array of instances
    this.roomInstances = [];
    this.doorInstances = [];
    this.otherInstances = [];
    this.ceilingInstances = [];
    this.outlineInstances = [];

    this.setGeometryInstances();
  }



  /**
   * @description
   */
  DisplayHelper.prototype.setGeometryInstances = function() {

    var cellSpaceMembersLen = this.gmlDataContainer.cellSpaceMembers.length;

    for (var i = 0; i < cellSpaceMembersLen; i++) {

      var surfaceMemberLen = this.gmlDataContainer.cellSpaceMembers[i].surfaceMember.length;

      for (var j = 0; j < surfaceMemberLen; j++) {

        var geometryInstance = new Cesium.GeometryInstance({
          geometry: new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.unpackArray(this.gmlDataContainer.cellSpaceMembers[i].surfaceMember[j].coordinates)),
            perPositionHeight: true
          }),
        });


        var temp = Cesium.Cartesian3.unpackArray(this.gmlDataContainer.cellSpaceMembers[i].surfaceMember[j].coordinates);
        var pre = Math.floor(Cesium.Cartographic.fromCartesian(temp[0]).height);
        var escape = false;
        for (var k = 1; k < temp.length; k++) {
            var temp2 = Cesium.Cartographic.fromCartesian(temp[k]);
            if (pre !=  Math.floor(temp2.height)) {
              escape = true;
            }
        }

        if (this.gmlDataContainer.cellSpaceMembers[i].usage == "Door") {
          this.doorInstances.push(geometryInstance);

          this.outlineInstances.push(new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonOutlineGeometry({
              polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.unpackArray(this.gmlDataContainer.cellSpaceMembers[i].surfaceMember[j].coordinates)),
              perPositionHeight: true,
            }),
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLACK)
            }
          }));
        } else if (this.gmlDataContainer.cellSpaceMembers[i].usage == "Room" && escape) {
          this.roomInstances.push(geometryInstance);
        } else if (escape){
          this.otherInstances.push(geometryInstance);
        } else{
          this.ceilingInstances.push(geometryInstance);
        }
      }
    }
  }



  /**
   * @description
   * @param {PrimitiveOption} doorOption
   * @param {PrimitiveOption} roomOption
   * @param {PrimitiveOption} ceilingOption
   * @param {PrimitiveOption} otherOption
   */
  DisplayHelper.prototype.displayBuilding = function(viewer, doorOption, roomOption, ceilingOption, otherOption) {

    this.addDoorInstancesToPrimitives(viewer, doorOption);
    this.addRoomInstancesToPrimitives(viewer, roomOption);
    this.addOtherInstancesToPrimitives(viewer, otherOption);
    this.addCeilingInstancesToPrimitives(viewer, ceilingOption);
    this.addOutlineInstancesToPrimitives(viewer);

  }



  /**
   * @description
   * @param {PrimitiveOption} doorOption
   */
  DisplayHelper.prototype.addDoorInstancesToPrimitives = function(viewer, doorOption) {
    var doorPrimitive = new Cesium.Primitive({
      geometryInstances: this.doorInstances,
      appearance: new Cesium.PerInstanceColorAppearance({
        faceForward: true,
        flat: true,
        translucent: doorOption.translucent,
        closed: false
      })
    });

    doorPrimitive.appearance = new Cesium.MaterialAppearance();
    doorPrimitive.appearance.material = doorOption.getMaterial();
    viewer.scene.primitives.add(doorPrimitive);

  }



  /**
   * @description
   * @param {PrimitiveOption} roomOption
   */
  DisplayHelper.prototype.addRoomInstancesToPrimitives = function(viewer, roomOption) {

    var roomPrimitive = new Cesium.Primitive({
      geometryInstances: this.roomInstances,
      appearance: new Cesium.PerInstanceColorAppearance({
        faceForward: true,
        flat: true,
        translucent: roomOption.translucent,
        closed: false
      })
    });

    roomPrimitive.appearance = new Cesium.MaterialAppearance();
    roomPrimitive.appearance.material = roomOption.getMaterial();
    viewer.scene.primitives.add(roomPrimitive);

  }



  /**
   * @description
   * @param {PrimitiveOption} ceilingOption
   */
  DisplayHelper.prototype.addCeilingInstancesToPrimitives = function(viewer, ceilingOption) {

    var ceilingPrimitive = new Cesium.Primitive({
      geometryInstances: this.ceilingInstances,
      appearance: new Cesium.PerInstanceColorAppearance({
        faceForward: true,
        flat: true,
        translucent: ceilingOption.translucent,
        closed: false
      })
    });

    ceilingPrimitive.appearance = new Cesium.MaterialAppearance();
    ceilingPrimitive.appearance.material = ceilingOption.getMaterial();
    viewer.scene.primitives.add(ceilingPrimitive);

  }



  /**
   * @description
   * @param {PrimitiveOption} otherOption
   */
  DisplayHelper.prototype.addOtherInstancesToPrimitives = function(viewer, otherOption) {

    var otherPrimitive = new Cesium.Primitive({
      geometryInstances: this.otherInstances,
      appearance: new Cesium.PerInstanceColorAppearance({
        faceForward: true,
        flat: true,
        translucent: otherOption.translucent,
        closed: false
      })
    });

    otherPrimitive.appearance = new Cesium.MaterialAppearance();
    otherPrimitive.appearance.material = otherOption.getMaterial();
    viewer.scene.primitives.add(otherPrimitive);

  }



  /**
   * @description
   */
  DisplayHelper.prototype.addOutlineInstancesToPrimitives = function(viewer) {
    viewer.scene.primitives.add(new Cesium.Primitive({
      geometryInstances: this.outlineInstances,
      appearance: new Cesium.PerInstanceColorAppearance({
        flat: true,
        renderState: {
          depthTest: {
            enabled: true,
            func: Cesium.DepthFunction.LESS
          },
          lineWidth: Math.min(3.0, viewer.scene.maximumAliasedLineWidth)
        }
      })
    }));
  }



  /**
   * @description
   */
  DisplayHelper.prototype.displayPath = function(viewer) {

    console.log(this.gmlDataContainer.edges);
    // Displaying the edges
    for (var i = 0; i < this.gmlDataContainer.edges.length; i++) {

      var line = viewer.entities.add({
        name: 'line ' + this.gmlDataContainer.edges[i].connects,
        polyline: {
          positions: [
            new Cesium.Cartesian3(
              this.gmlDataContainer.edges[i].stateMembers[0].coordinates[0],
              this.gmlDataContainer.edges[i].stateMembers[0].coordinates[1],
              this.gmlDataContainer.edges[i].stateMembers[0].coordinates[2]+0.2),
            new Cesium.Cartesian3(
              this.gmlDataContainer.edges[i].stateMembers[1].coordinates[0],
              this.gmlDataContainer.edges[i].stateMembers[1].coordinates[1],
              this.gmlDataContainer.edges[i].stateMembers[1].coordinates[2]+0.2)
          ],
          followSurface: new Cesium.ConstantProperty(true),
          width : 50,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8.0),
          material : Cesium.Color.WHITE.withAlpha(0.8),
          outline : true, // height or extrudedHeight must be set for outlines to display
          outlineColor : Cesium.Color.WHITE
        }
      });
    }
  }



  return DisplayHelper;

});
