# Technical Decision Log

This log records decisions that materially affect the project. Add a new entry
when a choice changes the product scope, data model, security approach, API
architecture, or repository structure.

## D-001 — Use root-level App Router directories

**Date:** October 26, 2026  
**Status:** Accepted

The project uses root-level `app/`, `lib/`, and `components/` directories
instead of `src/`.

**Why:** The application was initialized with this layout. Keeping one App
Router location avoids conflicting `app/` and `src/app/` directories and makes
the initial MVP easier to navigate.

## D-002 — Keep weather API access server-side

**Date:** October 26, 2026  
**Status:** Accepted

OpenWeatherMap requests run through a Next.js route handler, using
`OPENWEATHERMAP_API_KEY` without a `NEXT_PUBLIC_` prefix.

**Why:** A public environment variable is bundled into browser code. The
server-side route lets the homepage retrieve weather without revealing the API
key to visitors.

## D-003 — Use Supabase profiles linked to Supabase Auth users

**Date:** October 26, 2026  
**Status:** Accepted

The user-facing data table is `profiles`, keyed by `auth.users.id`, rather
than a separate password or identity table.

**Why:** Supabase Auth owns authentication identities. A linked profile holds
application-specific preferences, including preferred comfort temperatures,
while avoiding duplicate account data.

## D-004 — Use Mapbox for map display and Google Places for discovery

**Date:** October 26, 2026  
**Status:** Accepted

Mapbox will provide the interactive map. Google Places API (New) will identify
nearby candidate venues.

**Why:** This separates map presentation from place discovery. It also lets us
rank and store place data independently of the map vendor.

## D-005 — Defer service-role key use

**Date:** October 26, 2026  
**Status:** Accepted

The Supabase service-role key is not required for the Day 1 flow and remains
unset.

**Why:** The service-role key bypasses Row Level Security and should only be
introduced for a clearly defined server-side administrative task.

## D-006 — Day 1 stops after weather and mode navigation

**Date:** October 26, 2026  
**Status:** Accepted

Day 1 delivers live weather and mode selection; maps, places, ranking,
feedback, and favorites move to later milestones.

**Why:** A focused first milestone proves location, weather, routing, secrets,
and the base data model before adding more expensive map and Places API work.

## D-007 — Use the Mapbox-specific react-map-gl v8 entry point

**Date:** October 27, 2026  
**Status:** Accepted

Map components import from `react-map-gl/mapbox`, not `react-map-gl`.

**Why:** `react-map-gl` v8 separates its Mapbox and MapLibre integrations into
explicit entry points. The project uses Mapbox GL 3, so the Mapbox entry point
is the compatible API and prevents module-export errors during development.

## D-008 — Encapsulate map presentation into a dedicated `MapView` component

**Date:** October 27, 2026  
**Status:** Accepted

All Mapbox map rendering, viewport state management, and marker display logic are
encapsulated inside `components/map/MapView.tsx` rather than directly in the explore page.

**Why:** Keeps `app/explore/page.tsx` clean and focused on layout, URL parameter parsing,
and page-level error boundaries. Encapsulating Mapbox logic in `components/map/` prevents
vendor leaks across pages and makes future additions (such as place markers, clustering,
and radius circles) modular and reusable.

## D-009 — Pass location and discovery mode via URL search parameters

**Date:** October 27, 2026  
**Status:** Accepted

Coordinates (`lat`, `lon`) and discovery mode (`mode=cool|warm`) are passed from the
Homepage to the Explore screen via query parameters (`/explore?mode=cool&lat=...&lon=...`).

**Why:** URL search parameters make the exploration view shareable, bookmarkable, and
resilient to page refreshes without needing a heavyweight global client state store
(e.g., Redux or Zustand). It also integrates cleanly with Next.js App Router and `<Suspense>`.

## D-010 — Dynamic mode-based marker visual styling

**Date:** October 27, 2026  
**Status:** Accepted

The user location marker on the map adapts its accent color based on the selected mode:
blue (`bg-blue-500`) for Cool Spots and orange (`bg-orange-500`) for Warm Spots.

**Why:** Provides clear, persistent visual feedback and maintains thematic consistency
with the mode chosen on the homepage throughout map exploration.

## D-011 — Provide explicit fallback UI for invalid or denied location states

**Date:** October 27, 2026  
**Status:** Accepted

If `/explore` is accessed without valid coordinates or with non-numeric inputs, the page
renders an explanatory fallback UI with a direct link back to the homepage instead of
initializing the map.

**Why:** Mapbox GL will throw runtime errors if initialized with invalid or null
coordinates. An early check with user guidance prevents runtime crashes and guides the
user to enable geolocation on the homepage.

## D-012 — Refocus product architecture to Cool Places and Cool Route modes (CoolPath)

**Date:** October 28, 2026  
**Status:** Accepted

The product evolves from the dual hot/cold discovery concept to a dedicated heat-mitigation
solution under the **CoolPath** umbrella, focusing on two distinct user intentions:
1. **Find Cool Places:** For resting when feeling hot (finding nearby shaded parks, cafes, libraries, museums).
2. **Find Cool Route:** For pedestrian navigation from A to B along cooler, shaded paths.

**Why:** Urban heat stress is primarily a pedestrian navigation and cooling-shelter problem.
Separating stationary cooling (places to rest) from dynamic cooling (cooler walking paths)
aligns with actual user behavior and provides a clearer, more purposeful user experience.

## D-013 — Transparent Multi-Factor Cool Places Scoring Algorithm

**Date:** October 28, 2026  
**Status:** Accepted

Candidate places returned from Google Places are scored and ranked via `lib/scoring/coolPlaces.ts`
using a transparent, multi-factor comfort formula:
- **Base Score:** 50
- **Venue Type Weight:**
  - Park (+35): Shade potential and microclimate cooling
  - Library (+32): Guaranteed indoor AC and quiet resting space
  - Shopping Mall (+30): High-capacity AC and water/restroom access
  - Museum (+28): Indoor climate-controlled environment
  - Café / Coffee Shop (+18): Commercial seating and beverages
  - Restaurant (+8): Moderate indoor seating
  - Bar (+5): Minor cooling venue
- **Distance Penalty:** `- distance / 80` (every 100m reduces comfort score proportionally to pedestrian fatigue)
- **Quality Factor:** `+ rating * 2` (small boost for verified high-quality spots)
- **Clamped & Sorted:** Clamped between 0 and 100, and sorted in descending score order.

**Why:** Returning raw, unranked Google Places results forces users to manually evaluate each option.
Providing a transparent score and explanation ensures users quickly identify the best, nearest place to seek relief.

## D-014 — Mapbox Geocoding and Directions API for Pedestrian Routing

**Date:** October 29, 2026  
**Status:** Accepted

The Cool Route feature in `app/route/page.tsx` integrates Mapbox Geocoding API (`v5/mapbox.places`)
and Mapbox Directions API (`v5/mapbox/walking`) with client-side GeoJSON vector rendering:
- Text-to-coordinate geocoding with fallback to live GPS (`Current Location`).
- Walking path polyline rendering via Mapbox `Source` and `Layer` (`line-color: #059669`).
- Automatic bounding box framing with `fitBounds` and resize synchronization.

**Why:** Client-side Mapbox Directions provides low-latency pedestrian pathing with real-world walking
metrics (distance and duration) directly aligned with Mapbox GL vector tile rendering.




