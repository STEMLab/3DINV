function loadJSON(callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'network.csv', true);
    xobj.onreadystatechange = function() {
        // When response is ready
        if (xobj.readyState == 4 && xobj.status == 200) {

            // .open will NOT return a value but simply returns undefined in async mode so use a callback
            callback(xobj.responseText);

        }
    }
    xobj.send(null);
	

}

loadJSON(function(response) {

        // Tell World Wind to log only warnings and errors.
        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

        // Create the World Window in a canvas named "canvasOne".
//        var wwd = new WorldWind.WorldWindow("canvasOne");
		var wwd = new WorldWind.WorldWindow("canvasOne", new WorldWind.ZeroElevationModel());

        // Define layers to populate the World Window
        var layers = [
            {layer: new WorldWind.BMNGLayer(), enabled: true},
            {layer: new WorldWind.BMNGLandsatLayer(), enabled: false},
            {layer: new WorldWind.BingAerialWithLabelsLayer(null), enabled: true},
            {layer: new WorldWind.CompassLayer(), enabled: true},
            {layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true},
            {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true}
        ];

        // Create those layers.
        for (var l = 0; l < layers.length; l++) {
            layers[l].layer.enabled = layers[l].enabled;
            wwd.addLayer(layers[l].layer);
        }

        // Add the path to a layer and the layer to the World Window's layer list.
        var pathsLayer = new WorldWind.RenderableLayer();
        pathsLayer.displayName = "Paths";

        wwd.addLayer(pathsLayer);
	
		var pathPositionsArray = new Array;
	
        var result = response.split("/");
        for (var i = 0; i < result.length; i++) {
            var edge = result[i].split("\n");
            var pathPositions = [];
            for (var j = 1; j < edge.length; j++) {
                var coordinates = edge[j].split(",");
                pathPositions.push(new WorldWind.Position.fromRadians(parseFloat(coordinates[0]),parseFloat(coordinates[1]),parseFloat(coordinates[2])));
            }
			
            //draw path
            var path = new WorldWind.Path(pathPositions, null);
            path.altitudeMode = WorldWind.ABSOLUTE;
            path.followTerrain = true;
            path.extrude = false; // make it a curtain
            path.useSurfaceShapeFor2D = true; // use a surface shape in 2D mode

            // Create and assign the path's attributes.
            var pathAttributes = new WorldWind.ShapeAttributes(null);
            pathAttributes.outlineColor = WorldWind.Color.BLUE;
            pathAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);
            pathAttributes.drawVerticals = path.extrude; // draw verticals only when extruding
            path.attributes = pathAttributes;

            pathsLayer.addRenderable(path);

			
			pathPositionsArray.push(pathPositions);
        }
	
	
        // Redraw world to make it up to date with the content that's been added
        wwd.redraw();
	
		navigate(pathPositionsArray, wwd);
		

});
