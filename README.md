# CoolCorridor

**Cooler Places. Brighter Days.**

CoolCorridor is a web application that helps people navigate urban heat more intelligently. It combines real-time weather data, nearby cool places, and multi-modal routing to reduce heat exposure during daily movement in cities.

---

## Problem

Urban heat is a growing public health and comfort issue. Traditional navigation apps optimize only for distance or time and completely ignore temperature. As a result, people often walk or travel through the hottest streets even when a meaningfully cooler alternative exists nearby.

This is especially problematic for:
- Outdoor workers and delivery riders
- Elderly people and children
- Anyone commuting or moving around during peak heat hours

---

## Solution

CoolCorridor provides two practical tools:

### 1. Find Cool Places
Discover nearby places where you can rest and cool down:
- Parks and shaded areas
- Libraries and air-conditioned indoor spaces
- Cafés and rest spots

Places are ranked using a comfort scoring system based on place type, distance, and other factors.

### 2. Find Cool Route
Get optimized routes between two points with support for:
- Walking
- Cycling
- Driving (traffic-aware)

The system suggests the most suitable transport mode based on distance and shows cool places along walking routes.

---

## Key Features

- Real-time temperature using Open-Meteo (free)
- Location-based cool place discovery
- Comfort scoring & ranking of places
- Multi-modal routing (Walk / Cycle / Drive)
- Traffic-aware driving estimates
- Live location tracking
- “Get Directions” from any cool place
- Dark terrain-inspired UI (Meridian Geo design system)
- Splash screen + custom branding

---

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Maps:** Mapbox GL JS + react-map-gl
- **Weather:** Open-Meteo
- **Places:** Google Places API
- **Routing:** Mapbox Directions API
- **Deployment:** Vercel (recommended)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/coolcorridor.git
cd coolcorridor