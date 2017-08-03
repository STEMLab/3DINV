loadCSV(function(response) {

        // Create a layer to hold the polygons.
        var polygonsLayer = new WorldWind.RenderableLayer();
        polygonsLayer.displayName = "Polygons";
        wwd.addLayer(polygonsLayer);

        // Extract each polygon
        var poly = response.split("/");
        for (var i = 0; i < poly.length; i++) {
            // Extract coordinates of the polygon
            var coordinates = poly[i].split("\n");
            var boundaries = [];
            for (var j = 1; j < coordinates.length; j++) {
                // Extract each coordinate separately
                var xyz = coordinates[j].split(",");
                // Convert coordinates from radians to degrees
                boundaries.push(new WorldWind.Position.fromRadians(parseFloat(xyz[0]),parseFloat(xyz[1]),parseFloat(xyz[2])));
            }
            // Create polygon from previous coordinates
            polygon = new WorldWind.Polygon(boundaries, null);
            polygon.altitudeMode = WorldWind.ABSOLUTE;
            polygon.extrude = false;

            // Create and assign the polygon's attributes.
            polygonAttributes = new WorldWind.ShapeAttributes(null);
            polygonAttributes.drawOutline = true;
            polygonAttributes.outlineColor = WorldWind.Color.BLUE;
            polygonAttributes.interiorColor = WorldWind.Color.WHITE;
            polygonAttributes.drawVerticals = polygon.extrude;
            polygonAttributes.applyLighting = true;
            polygon.attributes = polygonAttributes;

            // Add the polygon to the layer and the layer to the World Window's layer list.
            polygonsLayer.addRenderable(polygon);

      }
      // Redraw world to make it up to date with the content that's been added
      wwd.redraw();
},'coordinates.csv');
