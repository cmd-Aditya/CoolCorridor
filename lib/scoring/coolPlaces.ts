export interface ScoredPlace {
  id: string;
  name: string;
  types: string[];
  location: {
    lat: number;
    lng: number;
  };
  vicinity?: string;
  rating?: number;
  distance: number; // in meters
  score: number;
  reason: string;
}

function getDistanceFromLatLonInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function scoreCoolPlaces(
  places: any[],
  userLat: number,
  userLon: number
): ScoredPlace[] {
  const scored = places.map((place) => {
    const distance = getDistanceFromLatLonInMeters(
      userLat,
      userLon,
      place.location.lat,
      place.location.lng
    );

    let score = 50; // base score
    let reason = "General place";

    const types = place.types || [];

    // Strong positive for good cool places
    if (types.includes("park")) {
      score += 35;
      reason = "Park with shade potential";
    } else if (types.includes("library")) {
      score += 32;
      reason = "Library (usually air-conditioned)";
    } else if (types.includes("museum")) {
      score += 28;
      reason = "Museum (indoor & cool)";
    } else if (types.includes("shopping_mall")) {
      score += 30;
      reason = "Shopping mall with AC";
    } else if (types.includes("cafe") || types.includes("coffee_shop")) {
      score += 18;
      reason = "Café (good for resting)";
    } else if (types.includes("restaurant")) {
      score += 8;
      reason = "Restaurant";
    } else if (types.includes("bar")) {
      score += 5;
      reason = "Bar";
    }

    // Distance penalty (closer is better)
    // Every 100m reduces score a bit
    score -= distance / 80;

    // Small bonus for higher rating
    if (place.rating) {
      score += place.rating * 2;
    }

    // Clamp score
    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
      id: place.id,
      name: place.name,
      types: place.types,
      location: place.location,
      vicinity: place.vicinity,
      rating: place.rating,
      distance: Math.round(distance),
      score,
      reason,
    };
  });

  // Sort by score (highest first)
  return scored.sort((a, b) => b.score - a.score);
}
