import { NextRequest, NextResponse } from "next/server";
import { searchNearbyPlaces } from "@/lib/places";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const mode = searchParams.get("mode") as "cool" | "warm";

  if (!lat || !lon || !mode) {
    return NextResponse.json(
      { error: "lat, lon and mode are required" },
      { status: 400 }
    );
  }

  try {
    const places = await searchNearbyPlaces(
      parseFloat(lat),
      parseFloat(lon),
      mode
    );
    return NextResponse.json(places);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch places" },
      { status: 500 }
    );
  }
}
