define([],
  function() {
    'use strict';

    /**
     * Objects storing CellSpaceMember in IndoorGML.
     * Creating the surfaceMember Class.
     * @exports SurfaceMember
     * @constructor
     * @param {Coordination} coordinates
     */
    function SurfaceMember(coordinates) {
      this.coordinates = coordinates; //Array of surfaceMember coordinates
    }

    return SurfaceMember;
});
