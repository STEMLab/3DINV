define([],
  function() {
    'use strict';

    // Transition member Class
    function TransitionMember(connects, description, coordinates) {
      this.connects = connects; // Array of href
      this.description = description; // information about section and floor...
      this.stateMembers = coordinates; // Array of state members, each state member has X,Y,Z coordinates

      if(description != null){
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
      }


    return TransitionMember;
});
