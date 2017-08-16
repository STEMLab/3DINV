define([],function() {
  'use strict';

  /**
   * Coordination data format
   * @exports Coordination
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {string} href
   */
  function Coordination(x, y, z, href){
    this.x = x;
    this.y = y;
    this.z = z;
    this.href = href;
  }

  /**
   * @return {string}
   */
  Coordination.prototype.toString = function(){
    return x + ", " + y + ", " + z;
  }


  return Coordination;
});
