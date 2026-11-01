
---

### 2. Create `agents.md` (in the root folder)

```markdown
# AI Agents Guide – CoolSpot / WarmSpot

## Project Summary
CoolSpot / WarmSpot is a Next.js web application that helps users find nearby places that feel more comfortable based on current weather — cooler places when it's hot, and warmer places when it's cold.

## Tech Stack
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase
- **Maps**: Mapbox GL JS + react-map-gl
- **Weather**: OpenWeatherMap
- **Places**: Google Places API (New)
- **Deployment**: Vercel

## Folder Structure Rules
- `app/` → Only pages and API routes
- `components/map/` → Everything related to the map
- `components/places/` → Place cards, lists, details
- `components/ui/` → Reusable UI components (buttons, modals, etc.)
- `lib/` → Business logic, API helpers, scoring engine
- `lib/scoring/` → All comfort scoring logic must live here
- `types/` → All TypeScript interfaces and types
- `supabase/` → Database schema

## Coding Guidelines
1. Always use TypeScript
2. Prefer Server Components. Add `"use client"` only when necessary
3. Keep components small and focused
4. Use Tailwind CSS for all styling
5. Never hardcode API keys — always use environment variables
6. Always handle loading, empty, and error states
7. Write clean, readable, production-ready code
8. Add comments only when logic is complex

## Important Rules for AI Agents
- Never break the existing location detection + weather flow
- Cool mode must always use **blue** theme
- Warm mode must always use **orange** theme
- All scoring logic must be placed inside `lib/scoring/`
- Prefer calling Google Places from API routes (not directly from the client)
- When adding new features, update both `design.md` and this file
- Maintain consistent naming: `lat` / `lon` (not lng)
- Mobile-first design is mandatory

## Current Progress

| Day | Feature                          | Status     |
|-----|----------------------------------|------------|
| 1   | Foundation + Live Weather        | Completed  |
| 2   | Map + User Location Marker       | Completed  |
| 3   | Google Places Search + Markers   | Next       |
| 4   | Scoring Engine + Ranking         | Pending    |
| 5   | Place Detail + Feedback          | Pending    |
| 6   | Polish + Filters + UX            | Pending    |
| 7   | Testing + Deployment             | Pending    |

## How to Help
When asked to implement a feature:
1. First check `design.md` for product decisions
2. Follow the folder structure strictly
3. Keep the code consistent with existing patterns
4. Explain important decisions briefly