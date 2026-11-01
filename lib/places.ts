export interface GooglePlace {
  id: string;
  name: string;
  types: string[];
  location: {
    lat: number;
    lng: number;
  };
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: any[];
}

export async function searchNearbyPlaces(
  lat: number,
  lon: number,
  mode: "cool" | "warm"
): Promise<GooglePlace[]> {
  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error("Google Places API key is missing");
  }

  // Different place types based on mode
  const includedTypes =
    mode === "cool"
      ? ["park", "cafe", "library", "shopping_mall", "museum", "restaurant"]
      : ["cafe", "restaurant", "shopping_mall", "library", "museum"];

  const url = "https://places.googleapis.com/v1/places:searchNearby";

  const body = {
    includedTypes,
    maxResultCount: 15,
    locationRestriction: {
      circle: {
        center: {
          latitude: lat,
          longitude: lon,
        },
        radius: 1500.0, // 1.5 km
      },
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.types,places.location,places.shortFormattedAddress,places.rating,places.userRatingCount",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Google Places error:", error);
    throw new Error("Failed to fetch places");
  }

  const data = await res.json();

  if (!data.places) return [];

  return data.places.map((place: any) => ({
    id: place.id,
    name: place.displayName?.text || "Unknown Place",
    types: place.types || [],
    location: {
      lat: place.location?.latitude ?? 0,
      lng: place.location?.longitude ?? 0,
    },
    vicinity: place.shortFormattedAddress,
    rating: place.rating,
    user_ratings_total: place.userRatingCount,
  }));
}