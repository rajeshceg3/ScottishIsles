# Terrain credits

This experimental branch contains adapted Mapzen Terrain Tiles, accessed November 11, 2026 from https://registry.opendata.aws/terrain-tiles/ . Tile URLs and crop metadata are in `data/`. Format and source documentation:

- https://github.com/tilezen/joerd/blob/master/docs/use-service.md
- https://github.com/tilezen/joerd/blob/master/docs/formats.md
- https://github.com/tilezen/joerd/blob/master/docs/data-sources.md
- https://github.com/tilezen/joerd/blob/master/docs/attribution.md

The source is a composite. The contributing source is not identified for each pixel. The full provider credit list is therefore retained below. These crops are simplified, resampled to 241 by 241 points, quantized to quarter metres, and interpolated for a rendered mesh. Relief is exaggerated 1.8 times. Sea values are clamped below 300 metres. Geographic crop spans use a local latitude approximation. The crops include some neighbouring land, especially Canna and Sanday. Props, colour, weather and surface texture are artistic additions, not observations. No source provider endorses this adaptation. This scene is not suitable for navigation, surveying or measuring elevations.

## Composite provider credits

- ArcticDEM terrain data DEM(s) were created from DigitalGlobe, Inc., imagery and funded under National Science Foundation awards 1043681, 1559691, and 1542736.
- Australia terrain data © Commonwealth of Australia (Geoscience Australia) 2017.
- Austria terrain data © offene Daten Österreichs - Digitales Geländemodell (DGM) Österreich.
- Canada terrain data contains information licensed under the Open Government Licence - Canada.
- Europe terrain data produced using Copernicus data and information funded by the European Union - EU-DEM layers.
- Global ETOPO1 terrain data U.S. National Oceanic and Atmospheric Administration.
- Mexico terrain data source: INEGI, Continental relief, 2016.
- New Zealand terrain data Copyright 2011 Crown copyright (c) Land Information New Zealand and the New Zealand Government (All rights reserved).
- Norway terrain data © Kartverket.
- United Kingdom terrain data © Environment Agency copyright and/or database right 2015. All rights reserved.
- United States 3DEP (formerly NED) and global GMTED2010 and SRTM terrain data courtesy of the U.S. Geological Survey.

Source-specific licensing details are recorded in the Mapzen attribution page above. UK Environment Agency data is under the Open Government Licence v3. Copernicus source policy: https://land.copernicus.eu/en/data-policy . Generated using European Union's Copernicus Land Monitoring Service information; contains modified composite terrain information; composite source vintage is not specified by these tiles. Modifications are listed above.

## Geographic orientation

- Rum: https://en.wikipedia.org/wiki/R%C3%B9m
- Eigg: https://en.wikipedia.org/wiki/Eigg
- Muck: https://en.wikipedia.org/wiki/Muck%2C_Scotland
- Sanday: https://mapcarta.com/17622884
- Canna and regional context: https://en.wikivoyage.org/wiki/Small_Isles

These links guided crop placement only. No source photographs or prose are redistributed.

## Surface materials

Surface colour and normal detail use adapted CC0 assets from Poly Haven, not photographs of these islands:

- Aerial Grass Rock, Rob Tuytel: https://polyhaven.com/a/aerial_grass_rock
- Rocky Terrain, Amal Kumar: https://polyhaven.com/a/rocky_terrain
- Asset license: https://polyhaven.com/license

The maps were resized to 512 pixels, converted to WebP, tinted, blended by terrain slope and faded with viewing distance. Source URLs and original checksums are in `textures/sources.json`. The app serves these files locally and does not call the Poly Haven API. These material photographs are not represented as photographs taken on the Scottish Isles.
