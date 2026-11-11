# Small Isles: elevation experiment

Separate unmerged experiment based on Mapzen composite terrain tiles. The procedural candidate is preserved on `build/five-islands-nov11`. This branch is not an art-approved release.

See [terrain credits](TERRAIN_ATTRIBUTION.md) for provider attribution, exact tile URL ledger, crop metadata and modifications. Relief is exaggerated 1.8 times; scenery and surface texture are artistic additions. This is not survey or navigation data.

Grounding for the five distinct profiles:
- NatureScot, *The Special Qualities of the Small Isles National Scenic Area*: https://www.nature.scot/sites/default/files/national-scenic-area/9154/nsa-special-qualities.pdf
- Scottish Geology Trust, *Chapter 3: The Small Isles*: https://geoguide.scottishgeologytrust.org/p/gcr04/gcr04_chapter3thesmallisles
- Discover the Highlands and Islands, *The Small Isles*: https://discoverhighlandsandislands.scot/en/visitor/location/the-small-isles

Rum's mountain ridges, Eigg's long pitchstone ridge, Muck's low pasture, Canna's stepped plateau and Sanday's lower terrain are distinguished in the model. These sources guide form, not exact scale or placement. No geographic-source photographs are redistributed. Surface textures use credited CC0 Poly Haven materials, not photographs of these islands. Navigation drawings remain schematic sketches from the procedural study, not surveyed shorelines.

Serve the directory with a static server. `npm test` checks the deterministic fields, finite sampled heights, surrounding seabed and distinct relief. Real-browser scene checks and art qualification are separate gates.

The latest browser gate checks all five islands in four directions at 390px reduced motion and 1365px normal preference, keyboard yaw/pitch, pointer look, dry cameras, 44px targets, bounds, held pixel identity and explicit weather start/stop. These are functional checks, not art acceptance or a device performance certificate.

## Regenerating the elevation arrays

The checked-in `dem-data.js` is sufficient to serve the app. To regenerate it, use Python with NumPy and Pillow:

```sh
python3 scripts/acquire-dem.py
python3 scripts/encode-dem.py
npm test
```

`SCOTTISH_DEM_CACHE` can override the default `/tmp/scottish-dem` cache. Acquisition creates the directory, caches the source tiles and writes intermediate arrays. It uses public source tiles and makes no authenticated requests. Source service responses can change; `data/terrain-tiles.json` records the original URLs used for this candidate, not a claim of byte-identical future provider content. Regenerated output must be reviewed before committing.

## Artistic additions are separate from source elevations

Eigg's narrow Sgurr ridge is locally interpreted in `landmarks.js`, rather than left smoothed away by the composite data. Its profile and Muck's field wall are artistic additions, not survey data or a reconstructed actual field. See the attribution document for source references and precise limits. The checked-in raw arrays remain unchanged. `measuredHeightAt` reads the scaled source; `heightAt` includes the artistic ridge.

## Vegetation/geology art candidate (November 11, 2026)

The branch now keeps the existing CC0 moor/rock material visible at middle and far distances instead of fading to a smooth base color after 100 metres. Cliff exposure follows slope, with interpreted rock bands and a wet/shingle transition near sea level. These surface marks are artistic, not mapped geological layers. Native elevation arrays, 1.8x relief and the interpreted Sgurr overlay are unchanged.

Foreground stones use three deformed archetypes, varied tints and a desaturated stone-interior crop of the credited Poly Haven rocky material. Grass uses crossed alpha-cutout cards with fine curved leaf silhouettes instead of broad triangular spikes. The deterministic atlas generator is in `scripts/generate-moor-tuft.py` (Pillow required); it is procedural artwork, not island photography. Clumps, color, height and placement vary in all directions. Low heather/sedge-like drifts are interpreted scenery, not a botanical survey.

This is still a stylized, unmerged art candidate, not photorealism or art acceptance. Broad silhouettes remain generalized by the source resolution; the Sgurr profile is visibly interpreted. Grass-card repetition, low-detail wall stones, smooth terrain close to steep slopes, sparse middle-distance vegetation and schematic distant coastlines remain. Shore material changes do not reconstruct beaches or add surveyed coastal detail. The hand-drawn coastal-chart navigation and held-by-default weather behavior are preserved. No audio changes.
