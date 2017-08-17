define([], function() {
  'use strict';

  /**
   * PrimitiveOption is an object used to give the property of a polygon
   * that constitutes a building when creating a building in {@link DisplayHelper}.
   * The member variable of this object is used to define *Cesium.Material*
   * @exports PrimitiveOption
   * @constructor
   *
   * @param {string} type The value to be assigned to the fabric type of Cesium.Material. `Image` or `Color` is recommended.
   * @param {boolean} translucent The value to be assigned to the translucent of Cesium.Material. Only allow false or true.
   * @param {string} texture This is the value that should be entered when type is Image.
   *                         This is the path of the image you want to output to the polygon.
   *                         If the type is Color, entering `null` is also valid.
   * @param {Cesium.Color} color This is the value that should be entered when type is Color.
   *                             This value should be defined as `Cesium.Color` and means the value to be painted on the polygon.
   */
  function PrimitiveOption(type, translucent, texture, color) {

    this.type = type;
    this.translucent = translucent;
    this.texture = texture;
    this.color = color;

  }




  /**
   * @memberof PrimitiveOption
   * @return {Cesium.Meterial}
   */
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
