import { WeatherData } from "@/types";

export async function getCurrentWeather(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code&timezone=auto`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch weather data from Open-Meteo");
  }

  const data = await res.json();
  const current = data.current;

  // Simple weather code to description mapping
  const weatherDescriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Light showers",
    81: "Showers",
    82: "Heavy showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with hail",
  };

  const weatherCode = current.weather_code;
  const description = weatherDescriptions[weatherCode] || "Unknown";

  return {
    temp: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    humidity: current.relative_humidity_2m,
    description: description,
    icon: weatherCode.toString(), // we can improve icons later
  };
}
