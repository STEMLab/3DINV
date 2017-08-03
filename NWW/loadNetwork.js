loadCSV(function loadNetwork(response) {

        // Add the path to a layer and the layer to the World Window's layer list.
        var pathsLayer = new WorldWind.RenderableLayer();
        pathsLayer.displayName = "Paths";
        wwd.addLayer(pathsLayer);

        // Extract edges
        var result = response.split("/");
        for (var i = 0; i < result.length; i++) {
            var edge = result[i].split("\n");
            var pathPositions = [];
            for (var j = 1; j < edge.length; j++) {
                // Extract edge coordinates
                var coordinates = edge[j].split(",");
                // Convert coordinates from radians to degrees
                pathPositions.push(new WorldWind.Position.fromRadians(parseFloat(coordinates[0]),parseFloat(coordinates[1]),parseFloat(coordinates[2])));
            }
            // Draw path
            var path = new WorldWind.Path(pathPositions, null);
            path.altitudeMode = WorldWind.ABSOLUTE;
            path.followTerrain = true;
            path.extrude = false; // do not make it a curtain
            path.useSurfaceShapeFor2D = true; // use a surface shape in 2D mode

            // Create and assign the path's attributes.
            var pathAttributes = new WorldWind.ShapeAttributes(null);
            pathAttributes.outlineColor = WorldWind.Color.BLACK;
            pathAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);
            pathAttributes.drawVerticals = path.extrude; // draw verticals only when extruding
            path.attributes = pathAttributes;

            pathsLayer.addRenderable(path);

        }
        // Redraw world to make it up to date with the content that's been added
        wwd.redraw();

},'network.csv');
