# Project Progress Log

This is the running delivery record for CoolSpot / WarmSpot. Update it at the
end of every work session so the current state, evidence, and next priorities
are clear.

## Day 1 — Foundation and live weather

**Date:** October 26, 2026  
**Status:** Complete

### Goal

Establish the MVP foundation and show real local weather after the user grants
location permission.

### Completed

- Set up the Next.js, TypeScript, Tailwind CSS application and core tooling.
- Added the root-level `app`, `components`, `lib`, `supabase`, and `types`
  structure.
- Added local configuration for Supabase, OpenWeatherMap, Mapbox, and Google
  Places.
- Added a server-side OpenWeatherMap request path, preserving the weather key
  outside browser code.
- Built the homepage with location detection, current condition, temperature,
  feels-like temperature, humidity, and mode-selection buttons.
- Added Cool Spots and Warm Spots placeholder screens that receive the current
  location.
- Created the Supabase database tables: `profiles`, `places`,
  `user_feedback`, and `favorites`.
- Corrected the weather request after identifying a mismatch between the
  environment variable name and the code.

### Verified

- TypeScript and ESLint checks passed during setup.
- Live app successfully displayed: Clear Sky, 31°C, feels like 31°C, and 37%
  humidity at the detected location.
- Both mode buttons opened their corresponding screens with the detected
  coordinates.
- A Supabase table query confirmed all four required tables exist.

### Not in scope yet

- Map rendering and markers.
- Google Places search and place ingestion.
- Comfort scoring and ranking.
- Authentication screens and saved favorites UI.
- Feedback submission UI.

### Next: Day 2

- Add the Mapbox map shell and current-location marker.
- Create a server-side Google Places search route.
- Fetch candidate nearby places for Cool and Warm modes.
- Begin the first transparent comfort-scoring rules.

## Day 2 — Map foundation and interactive location

**Date:** October 27, 2026  
**Status:** Complete

### Goal

Integrate Mapbox GL JS to display an interactive map centered on the user's
detected location with dynamic mode-based visual indicators.

### Completed

- Integrated Mapbox GL JS with `react-map-gl` (using `react-map-gl/mapbox` v8).
- Created a reusable, isolated `MapView` component (`components/map/MapView.tsx`)
  handling viewport state, zoom, pan, and navigation controls.
- Connected the component securely to `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`.
- Updated the Explore page (`app/explore/page.tsx`) to render the interactive map
  within a responsive layout.
- Added user current-location marker ("You are here") with dynamic mode styling:
  - **Cool Spots mode:** Blue location marker (`bg-blue-500`)
  - **Warm Spots mode:** Orange location marker (`bg-orange-500`)
- Connected Homepage (`app/page.tsx`) to Explore page via URL query parameters,
  successfully passing latitude, longitude, and active mode.
- Verified accurate centering on user coordinates with default zoom level 14.
- Added comprehensive edge-case handling: loading states (`Suspense`) and an
  informative fallback screen for missing or invalid coordinates.

### Verified

- `npm run typecheck` and `npm run lint` pass without errors.
- Homepage successfully captures browser geolocation and displays live weather.
- Clicking "Find Cool Spots" navigates to `/explore?mode=cool&lat=...&lon=...`
  and displays the map centered on user coordinates with a blue marker.
- Clicking "Find Warm Spots" navigates to `/explore?mode=warm&lat=...&lon=...`
  and displays the map with an orange marker.
- Map interaction (zoom, pan, rotation, and navigation controls) verified smooth and responsive.

### Not in scope yet (for future days)

- Google Places search integration.
- Rendering nearby venue candidate markers on the map.
- Comfort scoring and ranking algorithm.
- Place list view / result cards overlay.

### Next: Day 3

- Implement server-side Google Places API search route.
- Retrieve candidate venues based on proximity and comfort criteria.
- Build initial comfort-scoring algorithm in `lib/scoring/`.
- Display place markers and result cards on the Explore screen.

## Day 3 — Google Places Search + Show Places on Map

**Date:** October 28, 2026  
**Status:** Complete

### Goal

When the user opens Cool Spots or Warm Spots, the app should:
1. Fetch real nearby places from Google Places (New) API.
2. Show them as interactive markers on the map.
3. Display a list of places below in an aesthetic sheet.
4. Show basic info: Name, Type, Distance, and Rating.

### Completed

- Built `lib/places.ts` integrating the Google Places API (New) `places:searchNearby` endpoint with mode-aware venue types:
  - Cool mode: parks, cafes, libraries, shopping malls, museums, restaurants.
  - Warm mode: cafes, restaurants, shopping malls, libraries, museums.
- Created server route `app/api/places/nearby/route.ts` validating `lat`, `lon`, and `mode` query params.
- Updated `components/map/MapView.tsx`:
  - Added interactive candidate place markers styled by mode (blue for Cool Spots, orange for Warm Spots).
  - Implemented clickable markers and popups displaying venue name, vicinity address, and rating.
  - Added bidirectional sync between selected list cards and map marker popups.
  - Supported robust Mapbox token resolution (`NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` / `NEXT_PUBLIC_MAPBOX_TOKEN`).
- Updated `app/explore/page.tsx`:
  - Implemented proximity calculation using Haversine distance formula with formatted distance units (`m` / `km`).
  - Added primary venue category badges and star ratings.
  - Implemented place selection interaction syncing map view and marker popups.
  - Provided clean loading, error handling, and empty state UIs.
- Configured environment variables in `.env.local` for Google Places API key and Mapbox token.

### Verified

- `npm run typecheck` and `npm run lint` passed with 0 errors or warnings.
- Server route `GET /api/places/nearby?lat=...&lon=...&mode=cool` returns 15 real venues with full metadata.
- End-to-end browser subagent verified:
  - Mapbox map loaded with user marker ("You are here") and venue markers.
  - Bottom sheet displays 15 places with accurate distance, type badges, ratings, and addresses.
  - Clicking venue cards and markers opens popups and centers map view.
  - Warm Spots and Cool Spots modes verified with theme styling.

### Not in scope yet (for future days)

- Comfort scoring and ranking algorithm (`lib/scoring/`).
- Sun/shade and indoor/outdoor weather-comfort weighting.
- User favorites and feedback submission.

### Next: Day 4

- Implement transparent Comfort Scoring & Ranking algorithm based on weather conditions (temperature, solar radiation/conditions, humidity) and venue attributes (indoor/outdoor, tree canopy/shade).
- Sort and highlight highest-comfort spots first with score badges.

## Day 4A — Redesign Homepage for Two Clear Modes (CoolPath)

**Date:** October 28, 2026  
**Status:** Complete

### Goal

Properly set up the project for the final vision under the **CoolPath** branding with two clear options:
1. **Find Cool Places:** For resting when feeling hot.
2. **Find Cool Route:** For pedestrian navigation on a cooler walking path from A to B.

### Completed

- Redesigned `app/page.tsx`:
  - Updated branding to **CoolPath** with the subtitle *"Stay cool in the city heat"*.
  - Refactored live weather card with temperature, feels-like, condition description, humidity, and thermometer icon.
  - Replaced the previous generic buttons with two dedicated mode cards:
    - **Find Cool Places** (blue `Snowflake` icon box) linking to `/explore?mode=cool&lat=...&lon=...`.
    - **Find Cool Route** (emerald `Route` icon box) linking to `/route`.
  - Maintained geolocation detection and location coordinates display.
- Created placeholder screen `app/route/page.tsx` for the upcoming Cool Route routing feature.
- Documented architectural shift in `docs/DECISIONS.md` under `D-012`.

### Verified

- `npm run typecheck` and `npm run lint` passed with 0 errors.
- End-to-end browser subagent verified:
  - Homepage renders "CoolPath" branding and live weather (temp, feels-like, humidity, icon).
  - "Find Cool Places" card navigates to `/explore` with active coordinates and cool mode.
  - "Find Cool Route" card navigates to `/route` displaying the Cool Route mode placeholder.
  - "Back" button on `/route` returns smoothly to the homepage.

### Next: Day 4B & Beyond

- Improve **Cool Places** scoring and ranking algorithm (`lib/scoring/`).
- Build the real **Cool Route** pedestrian heat-mitigated pathfinding feature.

## Day 4B — Cool Places Scoring & Ranking Algorithm

**Date:** October 28, 2026  
**Status:** Complete

### Goal

Make nearby places smarter by scoring and ranking them according to cooling effectiveness and convenience:
- Prioritize parks, green areas, libraries, museums, and air-conditioned shopping malls.
- Give moderate priority to cafés for resting.
- Give lower priority to bars and standard restaurants.
- Apply a distance penalty so closer relief options gain priority.
- Display transparent "Cool Score" and human-readable comfort reasons.

### Completed

- Implemented `lib/scoring/coolPlaces.ts`:
  - `scoreCoolPlaces` multi-factor scoring function:
    - Base score of 50.
    - Venue-type weightings (+35 for parks, +32 for libraries, +30 for malls, +28 for museums, +18 for cafés, +8 for restaurants, +5 for bars).
    - Distance penalty (`- distance / 80`) reducing score based on walking distance.
    - Quality bonus (`+ rating * 2`).
    - Clamped to 0–100 and sorted in descending order.
  - Haversine distance calculation in meters.
- Updated `components/map/MapView.tsx`:
  - Extended `Place` interface with optional `distance`, `score`, and `reason` fields.
  - Synchronized selection between map markers, map popups, and list cards.
- Updated `app/explore/page.tsx`:
  - Integrates `scoreCoolPlaces` to rank fetched Google Places candidates immediately.
  - Renders ranked list items with rank badges (`#1`, `#2`, ...), Cool Score badges, comfort reasons, distance in meters, and star ratings.
  - Interactive card click centers the map and displays the marker popup.
- Documented scoring formula in `docs/DECISIONS.md` under `D-013`.

### Verified

- `npm run typecheck` and `npm run lint` pass with 0 errors.
- Live browser subagent verification:
  - Fetched 15 live nearby places and correctly scored each venue.
  - Verified sorting in descending score order (`#1: Persian Darbar` score 65, `#2` score 64, `#3: McDonald's` score 61).
  - Verified each card displays Cool Score, reason, distance in meters, and rating.
  - Verified clicking a list card selects it, centers the map, and displays the popup.

### Next: Day 5

- Build the **Cool Route** pedestrian navigation feature:
  - Origin and destination inputs on `/route`.
  - Pedestrian walking path calculation.
  - Shaded vs exposed street segments weighting.
  - Render route line on Mapbox map.

## Day 5 — Cool Route Initial Feature (Geocoding & Walking Directions)

**Date:** October 29, 2026  
**Status:** Complete

### Goal

Build the first functional step of the **Cool Route** pedestrian navigation feature:
- Allow users to enter a starting point and destination (or select "Use current").
- Geocode queries to coordinates using Mapbox Geocoding API.
- Request a walking route from the Mapbox Directions API.
- Render the path on Mapbox map with start/end markers and estimated distance & walking duration.

### Completed

- Implemented `app/route/page.tsx`:
  - Start input with "Use current" geolocation quick-select.
  - Destination input with MapPin icon.
  - Geocoding using `api.mapbox.com/geocoding/v5/mapbox.places/`.
  - Walking routing using `api.mapbox.com/directions/v5/mapbox/walking/`.
  - Walking metrics banner displaying distance in km (`(distance / 1000).toFixed(1) km`) and estimated walking time (`~X min walk`).
  - Interactive Mapbox GL map with `MapRef`, dynamic `fitBounds` camera framing with padding, resize event triggers, and full-width vector tiles.
  - Start marker (emerald with inner dot), Destination marker (red pin), and GeoJSON route line (`#059669`, 5px width).
  - Robust Mapbox token resolution (`NEXT_PUBLIC_MAPBOX_TOKEN` and `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`).
- Documented technical decision `D-014` in `docs/DECISIONS.md`.

### Verified

- `npm run typecheck` and `npm run lint` pass with 0 errors.
- End-to-end browser subagent verification:
  - Navigated to `http://localhost:3000/route`.
  - Tested routing from **"Andheri Station"** to **"Juhu Beach"**.
  - Verified geocoding resolved both locations.
  - Distance displayed: **3.8 km**, Duration: **~45 min walk**.
  - Map rendered full-screen vector tiles, start marker, end marker, and green route line with automated fitBounds framing.

### Next: Day 5B / Day 6

- Heat-aware path optimization:
  - Shaded vs exposed segments analysis.
  - Alternative route comparison (Standard Route vs Cool Route).
  - Tree canopy / sun exposure score overlay.

## Day 5B — Smarter Cool Route (Enhanced Results Card & Location Flow)

**Date:** October 29, 2026  
**Status:** Complete

### Goal

Enhance the Cool Route page with:
- Better visual feedback and clear typography.
- Enhanced Results Card featuring Leaf icon, Ruler distance, Clock duration, and a Cool Preference note.
- Direct "Current Location" resolution without duplicate geocoding round-trips.
- Form submission support (Enter key or button click) and full-width vector map tiles.

### Completed

- Updated `app/route/page.tsx`:
  - Added new Recommended Route results card with emerald `Leaf` badge.
  - Added metrics grid with `Ruler` (distance in km) and `Clock` (walking duration in minutes).
  - Added clean Cool Preference advisory notice: *"This is the best available walking route. Future updates will prefer paths near parks and shaded areas."*
  - Wrapped search inputs in an HTML5 form supporting Enter-key submission and resilient value resolution.
  - Handled `"Current Location"` directly using cached GPS coordinates.
  - Full-width vector map tiles with automated resize triggers and fitBounds padding.

### Verified

- `npm run typecheck` and `npm run lint` pass with 0 errors.
- Visual browser subagent verification:
  - Route tested from **"Andheri Station"** to **"Juhu Beach"**.
  - Verified Results Card displays **3.8 km** and **~45 min walk**.
  - Verified advisory message and full-width Mapbox vector map with green route line.

### Next: Day 6

- Calculate multiple walking alternatives (Standard vs Green/Shaded Path).
- Green corridor / park proximity bonus along pedestrian segments.






