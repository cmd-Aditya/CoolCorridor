import { NextRequest, NextResponse } from "next/server";
import { getCurrentWeather } from "@/lib/weather";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Latitude and longitude are required" },
      { status: 400 }
    );
  }

  try {
    const weather = await getCurrentWeather(parseFloat(lat), parseFloat(lon));
    return NextResponse.json(weather);
  } catch (error) {
    console.error("Weather API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather" },
      { status: 500 }
    );
  }
}
