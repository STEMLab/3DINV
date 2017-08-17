
define([],
  function() {
    'use strict';

    /**
     * Objects storing CellSpaceMember in IndoorGML
     * @exports CellSpaceMember
     * @constructor
     * @param {string} description description of CellSpaceMember
     * @param {string} href href of CellSpaceMember
     * @param {string} id id of CellSpaceMember
     * @param {Array} surfaceMember Array of {@link SurfaceMember}
     */
    function CellSpaceMember(description, href, id, surfaceMember) {
    	this.description = description; // Description contains information about section and floor ... etc
    	this.href = href; // Duality
    	this.id = id;
    	this.surfaceMember = surfaceMember; // Array of surface members

      if(description.indexOf("Usage=") != -1){
        var usageStart = description.indexOf("Usage=") + 6;
        this.usage = description.substring(usageStart, description.indexOf(":", usageStart));
      }
      else {
        this.usage = "";
      }

      if(description.indexOf("Section=") != -1){
        var sectionStart = description.indexOf("Section=") + 8;
        this.section = description.substring(sectionStart, description.indexOf(":", sectionStart));
      }
      else {
        this.section = "";
      }

      if(description.indexOf("Floor=") != -1){
        var floorStart = description.indexOf("Floor=") + 6;
        this.floor = description.substring(floorStart);
      }
      else {
        this.floor = "";
      }
    }

    return CellSpaceMember;
});
