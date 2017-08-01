function coordToCSV(cellSpaceMembers) {
//This function is used to convert LWM coordinates to cartographic Coordinates then export them into csv file in order to use them in Nasa Wold Wind

        var coordinates = [];
        //Looping through cell space members then surface members and converting the coordinates and lastly storing them in array object
        for (var i = 0; i < cellSpaceMembers.length; i++) {
          for (var j = 0; j < cellSpaceMembers[i].surfaceMember.length; j++) {
            for (var k = 0; k < cellSpaceMembers[i].surfaceMember[j].coordinates.length; k += 3) {
                var result = Cesium.Cartographic.fromCartesian(new Cesium.Cartesian3(cellSpaceMembers[i].surfaceMember[j].coordinates[k],cellSpaceMembers[i].surfaceMember[j].coordinates[k + 1],cellSpaceMembers[i].surfaceMember[j].coordinates[k + 2]));
                if (k != cellSpaceMembers[i].surfaceMember[j].coordinates.length - 3) {
                  var temp = [result.latitude,result.longitude,result.height];
                  coordinates.push(temp);
                }
                else {
                  var temp = [result.latitude,result.longitude,result.height + "/"];
                  coordinates.push(temp);
                }
            }
          }
        }
        //Creating csv file from the previous row
        var csv = ' ';
        coordinates.forEach(function(row) {
                csv += row.join(',');
                csv += "\n";
              });
        var blob = new Blob([csv],{type:"text/plain;charset=utf-8"});
        saveAs(blob,"coordinates.csv");

}
