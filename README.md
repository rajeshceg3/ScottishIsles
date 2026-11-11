# Small Isles

Work-in-progress Three.js landscape: Rum, Eigg, Muck, Canna and Sanday. The terrain fields are schematic interpretations, not surveyed heightmaps. The nearfield study now seats props and cameras on the actual rendered triangles. Held scenes render on input rather than burning continuous idle frames; each island stays below 150,000 rendered triangles in the browser gate. Shore wash uses the same terrain height field, not an unrelated circular ring. Rain and sea movement are held on entry and can be enabled explicitly. There is no audio in this foundation.

Grounding for the five distinct profiles:
- NatureScot, *The Special Qualities of the Small Isles National Scenic Area*: https://www.nature.scot/sites/default/files/national-scenic-area/9154/nsa-special-qualities.pdf
- Scottish Geology Trust, *Chapter 3: The Small Isles*: https://geoguide.scottishgeologytrust.org/p/gcr04/gcr04_chapter3thesmallisles
- Discover the Highlands and Islands, *The Small Isles*: https://discoverhighlandsandislands.scot/en/visitor/location/the-small-isles

Rum's mountain ridges, Eigg's long pitchstone ridge, Muck's low pasture, Canna's stepped plateau and Sanday's lower terrain are distinguished in the model. These sources guide form, not exact scale or placement. No source photography is redistributed.

Serve the directory with a static server. `npm test` checks the deterministic fields, finite sampled heights, surrounding seabed and distinct relief. Real-browser scene checks and art qualification are separate gates.

The latest browser gate checks all five islands in four directions at 390px reduced motion and 1365px normal preference, keyboard yaw/pitch, pointer look, dry cameras, 44px targets, bounds, held pixel identity and explicit weather start/stop. These are functional checks, not art acceptance or a device performance certificate.
