"use client";

import { useEffect, useState } from "react";
import { WeatherData } from "@/types";
import {
  MapPin,
  Snowflake,
  Route,
  Loader2,
  Thermometer,
  Droplets,
  ArrowUpRight,
  Layers,
  ShieldCheck,
  Activity,
  TreePine,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import TopoCanvas from "@/components/ui/TopoCanvas";
import SplashScreen from "@/components/SplashScreen";


const PRESET_ENVIRONMENTS = [
  {
    id: "park",
    label: "Botanical Canopy / Park",
    bonus: 35,
    tempDelta: -4.2,
    tag: "EVAPOTRANSPIRATION + SHADE",
  },
  {
    id: "library",
    label: "Public Library / Civic AC",
    bonus: 32,
    tempDelta: -6.5,
    tag: "INDOOR HVAC REFUGE",
  },
  {
    id: "mall",
    label: "Atrium / Cooling Center",
    bonus: 30,
    tempDelta: -6.0,
    tag: "HIGH-CAPACITY COOLING",
  },
  {
    id: "cafe",
    label: "Shaded Café / Hydration",
    bonus: 18,
    tempDelta: -3.0,
    tag: "REST + HYDRATION POINT",
  },
];

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [selectedEnv, setSelectedEnv] = useState(PRESET_ENVIRONMENTS[0]);
  const [simDistance, setSimDistance] = useState(240);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = sessionStorage.getItem("coolcorridor_splash_seen");
      if (seen === "1") {
        setShowSplash(false);
      }
    }
  }, []);

  const handleSplashFinish = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("coolcorridor_splash_seen", "1");
    }
    setShowSplash(false);
  };

  async function loadWeatherForCoords(latitude: number, longitude: number) {
    setLoading(true);
    setError(null);
    setCoords({ lat: latitude, lon: longitude });

    try {
      const res = await fetch(
        `/api/weather/current?lat=${latitude}&lon=${longitude}`
      );
      if (!res.ok) throw new Error("Failed to fetch weather");
      const data = await res.json();
      setWeather(data);
    } catch (err) {
      setError("Failed to fetch weather data from Open-Meteo telemetry.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        loadWeatherForCoords(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      () => {
        setError("Location permission denied. Please allow location access.");
        setLoading(false);
      }
    );
  }, []);

  const handleUseFallbackCoords = () => {
    // Mumbai central coordinates for instant fallback / demo telemetry
    loadWeatherForCoords(19.076, 72.8777);
  };

  const baseTemp = weather?.feelsLike ?? 32;
  const projectedTemp = (baseTemp + selectedEnv.tempDelta).toFixed(1);
  const projectedScore = Math.min(
    100,
    Math.max(0, Math.round(50 + selectedEnv.bonus - simDistance / 80 + 8.8))
  );

  const exploreHref = coords
    ? `/explore?mode=cool&lat=${coords.lat}&lon=${coords.lon}`
    : "/explore?mode=cool&lat=19.076&lon=72.8777";

  return (
    <main className="relative min-h-screen bg-[#0A0D08] text-white selection:bg-[#7A9A6E]/30 selection:text-[#C4B99A] bg-dither-grid">
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

      {/* Supporting Topographic Canvas Layer */}
      <TopoCanvas />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-[#27272A] bg-[#0A0D08]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-[12px] bg-[#11150E] border border-[#27272A] group-hover:border-[#7A9A6E]/60 flex items-center justify-center p-1 transition">
              <img
                src="/logo.png"
                alt="CoolCorridor Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="tracking-tight text-base sm:text-lg">
                  <span className="font-bold text-[#7A9A6E]">Cool</span>
                  <span className="font-medium text-[#C4B99A]">Corridor</span>
                </span>
              </div>
              <p className="font-mono text-[10px] tracking-[0.14em] text-[#A1A1AA] uppercase hidden sm:block">
                Cooler Places. Brighter Days.
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-[#A1A1AA]">
            <a
              href="#telemetry"
              className="hover:text-white transition-colors font-mono text-xs uppercase tracking-wider"
            >
              01 Telemetry
            </a>
            <Link
              href={exploreHref}
              className="hover:text-white transition-colors font-mono text-xs uppercase tracking-wider"
            >
              02 Cool Refuges
            </Link>
            <Link
              href="/route"
              className="hover:text-white transition-colors font-mono text-xs uppercase tracking-wider"
            >
              03 Cool Route
            </Link>
            <a
              href="#simulator"
              className="hover:text-white transition-colors font-mono text-xs uppercase tracking-wider"
            >
              04 Thermal Matrix
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#27272A] bg-[#11150E] font-mono text-[11px] text-[#A1A1AA]">
              <span
                className={`w-2 h-2 rounded-full ${weather
                  ? "bg-[#7A9A6E] animate-pulse"
                  : loading
                    ? "bg-[#C4B99A] animate-ping"
                    : "bg-red-400"
                  }`}
              />
              <span>
                {coords
                  ? `${coords.lat.toFixed(3)}°N, ${coords.lon.toFixed(3)}°E`
                  : "AWAITING GPS LOCK"}
              </span>
            </div>

            <Link
              href="/route"
              className="px-4 py-2 rounded-[17px] bg-[#7A9A6E] hover:bg-[#6b8b60] text-[#0A0D08] font-medium text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-glow"
            >
              <span>Route Planner</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 space-y-12">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end animate-mask-reveal">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#27272A] bg-[#11150E]">
              <Layers size={13} className="text-[#7A9A6E]" />
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#C4B99A]">
                COOLCORRIDOR · COOLER PLACES. BRIGHTER DAYS.
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-medium tracking-tight text-white leading-[1.04]">
              Map the city heat in living detail.
            </h1>

            <p className="text-base sm:text-lg text-[#A1A1AA] max-w-2xl leading-[1.6]">
              High-resolution urban thermal analysis with real-time microclimate
              telemetry. Discover shaded botanical refuges, climate-controlled
              civic spaces, and cooler pedestrian walking corridors.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={exploreHref}
                className={`px-6 py-3.5 rounded-[17px] bg-[#7A9A6E] hover:bg-[#89aa7c] text-[#0A0D08] font-semibold text-sm flex items-center gap-2 transition-all hover:-translate-y-0.5 shadow-glow ${!coords && loading ? "opacity-60 pointer-events-none" : ""
                  }`}
              >
                <Snowflake size={17} />
                <span>Find Cool Places</span>
                <ArrowUpRight size={16} />
              </Link>

              <Link
                href="/route"
                className="px-6 py-3.5 rounded-[17px] bg-[#11150E] hover:bg-[#171D13] text-white border border-[#27272A] hover:border-[#C4B99A]/50 font-medium text-sm flex items-center gap-2 transition-all hover:-translate-y-0.5"
              >
                <Route size={17} className="text-[#C4B99A]" />
                <span>Find Cool Route</span>
              </Link>
            </div>
          </div>

          {/* Right Column Quick Telemetry Summary Strip */}
          <div className="lg:col-span-5">
            <div className="rounded-[18px] bg-[#11150E] border border-[#27272A] p-5 shadow-panel space-y-4">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                  ACTIVE SENSOR TELEMETRY
                </span>
                <span className="font-mono text-[11px] text-[#7A9A6E] flex items-center gap-1">
                  <Activity size={13} />
                  LIVE FEED
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-[14px] bg-[#0A0D08] border border-[#27272A]">
                  <span className="font-mono text-[10px] text-[#A1A1AA] uppercase block">
                    AMBIENT
                  </span>
                  <span className="text-2xl font-semibold text-white mt-1 block font-mono">
                    {weather ? `${weather.temp}°C` : "--°C"}
                  </span>
                </div>
                <div className="p-3 rounded-[14px] bg-[#0A0D08] border border-[#27272A]">
                  <span className="font-mono text-[10px] text-[#A1A1AA] uppercase block">
                    FEELS LIKE
                  </span>
                  <span className="text-2xl font-semibold text-[#C4B99A] mt-1 block font-mono">
                    {weather ? `${weather.feelsLike}°C` : "--°C"}
                  </span>
                </div>
                <div className="p-3 rounded-[14px] bg-[#0A0D08] border border-[#27272A]">
                  <span className="font-mono text-[10px] text-[#A1A1AA] uppercase block">
                    HUMIDITY
                  </span>
                  <span className="text-2xl font-semibold text-[#7A9A6E] mt-1 block font-mono">
                    {weather ? `${weather.humidity}%` : "--%"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#A1A1AA] pt-1">
                <span className="font-mono flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#C4B99A]" />
                  {coords
                    ? `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`
                    : "Detecting coordinates..."}
                </span>
                <span className="font-mono uppercase text-[#C4B99A]">
                  {weather?.description ?? "CALIBRATING"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Dashboard Section */}
        <section id="telemetry" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Primary Weather & Thermal Telemetry Panel (5 cols) */}
          <div className="lg:col-span-5 rounded-[18px] bg-[#11150E] border border-[#27272A] p-6 shadow-panel flex flex-col justify-between animate-fade-up">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#7A9A6E]" />
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#C4B99A]">
                    MODULE 01 · ATMOSPHERIC STATE
                  </span>
                </div>
                <Thermometer size={18} className="text-[#7A9A6E]" />
              </div>

              {/* Loading State */}
              {loading && (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-[#27272A] rounded-[16px] bg-[#0A0D08]/60">
                  <Loader2 className="animate-spin text-[#7A9A6E]" size={30} />
                  <p className="text-sm text-white font-medium">
                    Detecting your location &amp; weather...
                  </p>
                  <p className="font-mono text-xs text-[#A1A1AA]">
                    QUERYING OPEN-METEO SATELLITE GRID
                  </p>
                </div>
              )}

              {/* Error State with Instant Fallback */}
              {error && !loading && (
                <div className="bg-red-950/30 border border-red-500/40 rounded-[16px] p-5 space-y-3">
                  <p className="font-medium text-red-200 text-sm">{error}</p>
                  <p className="text-xs text-[#A1A1AA]">
                    Enable browser location access or load reference urban
                    coordinates to inspect live telemetry.
                  </p>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={handleUseFallbackCoords}
                    className="w-full py-2.5 px-4 rounded-[14px] bg-[#C4B99A] text-[#0A0D08] font-mono text-xs font-semibold uppercase tracking-wider hover:bg-[#d3c9ad] transition flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={13} />
                    <span>Load Reference Coordinates (19.076°N, 72.877°E)</span>
                  </button>
                </div>
              )}

              {/* Active Weather Display */}
              {weather && !loading && (
                <div className="space-y-5">
                  <div className="flex items-baseline justify-between bg-[#0A0D08] border border-[#27272A] rounded-[16px] p-5">
                    <div>
                      <span className="font-mono text-xs uppercase text-[#7A9A6E] block">
                        {weather.description}
                      </span>
                      <div className="text-5xl sm:text-6xl font-semibold tracking-tight text-white mt-1 font-mono">
                        {weather.temp}°
                      </div>
                      <p className="text-sm text-[#A1A1AA] mt-2">
                        Apparent feels-like:{" "}
                        <span className="text-[#C4B99A] font-mono font-semibold">
                          {weather.feelsLike}°C
                        </span>
                      </p>
                    </div>

                    <div className="text-right space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11150E] border border-[#27272A] font-mono text-xs text-[#C4B99A]">
                        <Droplets size={13} className="text-[#7A9A6E]" />
                        <span>{weather.humidity}% RH</span>
                      </div>
                      <p className="font-mono text-[11px] text-[#A1A1AA]">
                        WMO CODE · {weather.icon}
                      </p>
                    </div>
                  </div>

                  {/* Surface Token Callout Card (#C4B99A) */}
                  <div className="rounded-[16px] bg-[#C4B99A] text-[#0A0D08] p-4 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0A0D08]/80">
                        MICROCLIMATE RELIEF TARGET
                      </span>
                      <ShieldCheck size={16} className="text-[#0A0D08]" />
                    </div>
                    <p className="text-sm font-semibold mt-1">
                      Shaded parks &amp; indoor refuges within 800m can reduce
                      perceived heat stress by 3°C–6°C.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-5 mt-5 border-t border-[#27272A] flex items-center justify-between font-mono text-xs text-[#A1A1AA]">
              <span>SOURCE: OPEN-METEO FORECAST API</span>
              <span>RESOLUTION: 2M AGL</span>
            </div>
          </div>

          {/* Right Column: Two Primary Operational Mode Cards (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Mode 1: Find Cool Places */}
            <Link
              href={exploreHref}
              className={`group rounded-[18px] bg-[#11150E] hover:bg-[#171D13] border border-[#27272A] hover:border-[#7A9A6E] p-6 shadow-panel flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 animate-fade-up delay-75 ${!coords && loading ? "opacity-60 pointer-events-none" : ""
                }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-[14px] bg-[#7A9A6E]/15 border border-[#7A9A6E]/40 flex items-center justify-center text-[#7A9A6E] group-hover:bg-[#7A9A6E] group-hover:text-[#0A0D08] transition-colors">
                    <Snowflake size={22} />
                  </div>
                  <span className="font-mono text-xs font-semibold uppercase px-3 py-1 rounded-full bg-[#0A0D08] border border-[#27272A] text-[#7A9A6E]">
                    MODE 01 · STATIONARY
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-white group-hover:text-[#C4B99A] transition-colors flex items-center justify-between">
                    <span>Find Cool Places</span>
                    <ArrowUpRight
                      size={20}
                      className="text-[#A1A1AA] group-hover:text-[#C4B99A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                    />
                  </h2>
                  <p className="text-sm text-[#A1A1AA] mt-2 leading-relaxed">
                    Feeling hot? Discover nearby parks, libraries, malls, and
                    shaded cafés ranked by our multi-factor Cool Score.
                  </p>
                </div>

                {/* Mini Comfort Weighting Breakdown */}
                <div className="bg-[#0A0D08] border border-[#27272A] rounded-[14px] p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[#A1A1AA]">BOTANICAL PARKS</span>
                    <span className="text-[#7A9A6E] font-semibold">+35 PTS</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#11150E] rounded-full overflow-hidden">
                    <div className="h-full bg-[#7A9A6E] w-[92%] rounded-full" />
                  </div>

                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[#A1A1AA]">LIBRARIES &amp; AC ATRIUMS</span>
                    <span className="text-[#C4B99A] font-semibold">+32 PTS</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#11150E] rounded-full overflow-hidden">
                    <div className="h-full bg-[#C4B99A] w-[84%] rounded-full" />
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-[#27272A] flex items-center justify-between font-mono text-xs">
                <span className="text-[#7A9A6E] font-semibold">
                  LAUNCH EXPLORER
                </span>
                <span className="text-[#A1A1AA]">1.5KM SCAN RADIUS</span>
              </div>
            </Link>

            {/* Mode 2: Find Cool Route */}
            <Link
              href="/route"
              className="group rounded-[18px] bg-[#11150E] hover:bg-[#171D13] border border-[#27272A] hover:border-[#C4B99A] p-6 shadow-panel flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 animate-fade-up delay-150"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-[14px] bg-[#C4B99A]/15 border border-[#C4B99A]/40 flex items-center justify-center text-[#C4B99A] group-hover:bg-[#C4B99A] group-hover:text-[#0A0D08] transition-colors">
                    <Route size={22} />
                  </div>
                  <span className="font-mono text-xs font-semibold uppercase px-3 py-1 rounded-full bg-[#0A0D08] border border-[#27272A] text-[#C4B99A]">
                    MODE 02 · CORRIDOR
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-white group-hover:text-[#C4B99A] transition-colors flex items-center justify-between">
                    <span>Find Cool Route</span>
                    <ArrowUpRight
                      size={20}
                      className="text-[#A1A1AA] group-hover:text-[#C4B99A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                    />
                  </h2>
                  <p className="text-sm text-[#A1A1AA] mt-2 leading-relaxed">
                    Going somewhere? Plot a pedestrian, cycling, or driving
                    route with mapped cooling refuges along the way.
                  </p>
                </div>

                {/* SVG Topographic Corridor Preview */}
                <div className="bg-[#0A0D08] border border-[#27272A] rounded-[14px] p-3.5">
                  <div className="flex items-center justify-between font-mono text-[10px] text-[#A1A1AA] mb-2">
                    <span>CORRIDOR SHADE PROFILE</span>
                    <span className="text-[#7A9A6E]">WALK / CYCLE / DRIVE</span>
                  </div>
                  <svg
                    viewBox="0 0 240 54"
                    className="w-full h-12 overflow-visible"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient
                        id="routeFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#7A9A6E"
                          stopOpacity="0.35"
                        />
                        <stop
                          offset="100%"
                          stopColor="#7A9A6E"
                          stopOpacity="0.0"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,42 C35,38 55,14 90,22 C125,30 150,8 190,16 C215,21 228,12 240,10 L240,52 L0,52 Z"
                      fill="url(#routeFill)"
                    />
                    <path
                      d="M0,42 C35,38 55,14 90,22 C125,30 150,8 190,16 C215,21 228,12 240,10"
                      fill="none"
                      stroke="#7A9A6E"
                      strokeWidth="2"
                    />
                    <circle cx="58" cy="18" r="3.5" fill="#C4B99A" />
                    <circle cx="145" cy="14" r="3.5" fill="#C4B99A" />
                    <circle cx="210" cy="17" r="3.5" fill="#7A9A6E" />
                  </svg>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-[#27272A] flex items-center justify-between font-mono text-xs">
                <span className="text-[#C4B99A] font-semibold">
                  OPEN ROUTE VECTOR
                </span>
                <span className="text-[#A1A1AA]">MAPBOX DIRECTIONS V5</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Interactive Microclimate Scoring Matrix Section */}
        <section
          id="simulator"
          className="rounded-[18px] bg-[#11150E] border border-[#27272A] p-6 sm:p-8 shadow-panel animate-fade-up delay-225"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2">
                <TreePine size={16} className="text-[#7A9A6E]" />
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#C4B99A]">
                  INTERACTIVE MODEL · MICROCLIMATE COMFORT SIMULATOR
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-medium text-white tracking-tight">
                How CoolCorridor ranks urban thermal refuges.
              </h2>

              <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
                Select a terrain typology and walking distance below to inspect
                how our scoring engine weighs canopy shade, indoor climate
                control, and pedestrian fatigue against current ambient heat.
              </p>

              {/* Environment Selector Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {PRESET_ENVIRONMENTS.map((env) => {
                  const active = selectedEnv.id === env.id;
                  return (
                    <button
                      key={env.id}
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setSelectedEnv(env)}
                      className={`text-left p-3.5 rounded-[16px] border transition-all ${active
                        ? "bg-[#7A9A6E]/15 border-[#7A9A6E] text-white"
                        : "bg-[#0A0D08] border-[#27272A] text-[#A1A1AA] hover:border-[#C4B99A]/40 hover:text-white"
                        }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
                        <span className={active ? "text-[#C4B99A]" : "text-[#A1A1AA]"}>
                          {env.tag}
                        </span>
                        <span className="text-[#7A9A6E] font-semibold">
                          +{env.bonus} BONUS
                        </span>
                      </div>
                      <p className="font-medium text-sm mt-1 text-white">
                        {env.label}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Distance Slider */}
              <div className="bg-[#0A0D08] border border-[#27272A] rounded-[16px] p-4 space-y-2">
                <div className="flex items-center justify-between font-mono text-xs">
                  <label htmlFor="distance-slider" className="text-[#A1A1AA]">
                    WALKING DISTANCE TO REFUGE
                  </label>
                  <span className="text-[#C4B99A] font-semibold">
                    {simDistance} METERS (-{Math.round(simDistance / 80)} PTS)
                  </span>
                </div>
                <input
                  id="distance-slider"
                  type="range"
                  suppressHydrationWarning
                  min={50}
                  max={1400}
                  step={50}
                  value={simDistance}
                  onChange={(e) => setSimDistance(Number(e.target.value))}
                  className="w-full accent-[#7A9A6E] cursor-pointer"
                />
              </div>
            </div>

            {/* Output Readout Card */}
            <div className="lg:col-span-5">
              <div className="rounded-[18px] bg-[#0A0D08] border border-[#27272A] p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                  <span className="font-mono text-xs uppercase text-[#A1A1AA]">
                    COMPUTED COMFORT INDEX
                  </span>
                  <span className="font-mono text-xs text-[#7A9A6E] flex items-center gap-1">
                    <Sparkles size={13} />
                    REAL-TIME MODEL
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="font-mono text-[11px] uppercase text-[#A1A1AA] block">
                      COOL SCORE
                    </span>
                    <span className="text-5xl font-semibold font-mono text-[#7A9A6E]">
                      {projectedScore}
                    </span>
                    <span className="font-mono text-sm text-[#A1A1AA]">
                      {" "}
                      / 100
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-[11px] uppercase text-[#A1A1AA] block">
                      EST. MICROCLIMATE
                    </span>
                    <span className="text-3xl font-semibold font-mono text-[#C4B99A]">
                      {projectedTemp}°C
                    </span>
                    <span className="font-mono text-xs text-[#7A9A6E] block mt-0.5">
                      ({selectedEnv.tempDelta}°C vs street)
                    </span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-[#11150E] rounded-full overflow-hidden border border-[#27272A]">
                  <div
                    className="h-full bg-[#7A9A6E] transition-all duration-300 rounded-full"
                    style={{ width: `${projectedScore}%` }}
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <Link
                    href={exploreHref}
                    className="w-full py-3 px-4 rounded-[17px] bg-[#C4B99A] hover:bg-[#d4c9ab] text-[#0A0D08] font-mono text-xs font-semibold uppercase tracking-wider text-center transition"
                  >
                    Scan Real Refuges Near You →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
