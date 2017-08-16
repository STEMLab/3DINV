define([],
  function() {
    'use strict';

    function myMap() {
      this.elements = {};
      this.length = 0;
      this.index = [];
    }

    myMap.prototype.put = function(key, value) {
      this.length++;
      this.elements[key] = value;

      if (this.index.indexOf(key) == -1) this.index.push(key);
    }

    myMap.prototype.get = function(key) {
      return this.elements[key];
    }

    myMap.prototype.getKeyByIndex = function(index) {
      return this.index[index];
    }

    myMap.prototype.getValueByIndex = function(index) {
      return this.elements[this.getKeyByIndex(index)];
    }
    return myMap;

  });
