function networkToCSV(edges) {
//This function is used to convert the network(edges+nodes) coordinates to cartographic coordinates then exporting them into csv file in order to use them in NWW

        var data = [];
        //Looping through the edges then state members and converting the coordinates from cartesian to cartographic
        for (var i = 0; i < edges.length; i++) {
          for (var j = 0; j < edges[i].stateMembers.length; j++) {
              var coordinate = Cesium.Cartographic.fromCartesian(new Cesium.Cartesian3(edges[i].stateMembers[j].coordinates[0],edges[i].stateMembers[j].coordinates[1],edges[i].stateMembers[j].coordinates[2]));
              if (j != edges[i].stateMembers.length - 1) {
                var temp = [coordinate.latitude,coordinate.longitude,coordinate.height];
                data.push(temp);
              }
              else {
                var temp = [coordinate.latitude,coordinate.longitude,coordinate.height + "/"];
                data.push(temp);
              }
          }
        }
        //Creating csv file from the previous row
        var csv = ' ';
        data.forEach(function(row) {
                csv += row.join(',');
                csv += "\n";
              });
        var blob = new Blob([csv],{type:"text/plain;charset=utf-8"});
        saveAs(blob,"network.csv");

}
