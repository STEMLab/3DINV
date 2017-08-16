define([
  "./Coordination"
],function(
  Coordination
) {
  'use strict';

  /**
   * @description
   */
  function RoomInfo(usage, section, floor, x, y, z, href){
  	this.usage = usage;
    this.section = section;
    this.floor = floor;
    this.coordination = new Coordination(x, y, z, href);
  }

  return RoomInfo;
});
