define([], function() {
  'use strict';


  /**
   * @description
   * @param {string} type
   * @param {boolean} translucent
   * @param {string} texture
   * @param {Cesium.Color} color
   */
  function PrimitiveOption(type, translucent, texture, color) {

    this.type = type;
    this.translucent = translucent;
    this.texture = texture;
    this.color = color;

  }

  PrimitiveOption.prototype.getMaterial = function() {

    if( this.type == "Image" && this.translucent == false){
      return new Cesium.Material({
        translucent: false,
        fabric: {
          type: 'Image',
          uniforms: {
            image: this.texture
          }
        }
      });
    }
    else if( this.type == "Image" && this.translucent == true){
      console.log("Image, true");
      return new Cesium.Material({
        translucent: true,
        fabric: {
          type: 'Image',
          uniforms: {
            image: this.texture
          }
        }
      });
    }
    else if( this.type == "Color" && this.translucent == false ){
      return new Cesium.Material({
        translucent: false,
        fabric: {
          type: 'Color',
          uniforms: {
            color: this.color
          }
        }
      });
    }
    else if( this.type == "Color" && this.translucent == true ){
      return new Cesium.Material({
        translucent: true,
        fabric: {
          type: 'Color',
          uniforms: {
            color: this.color
          }
        }
      });
    }
    else{
      console.log("error : invalid PrimitiveOption", this);
      console.log("return defalut Option");

      return new Cesium.Material({
        translucent: false,
        fabric: {
          type: 'Color',
          uniforms: {
            color: new Cesium.Color(0.5, 0.5, 0.5, 0.996)
          }
        }
      });
    }
  }

  return PrimitiveOption;

});
