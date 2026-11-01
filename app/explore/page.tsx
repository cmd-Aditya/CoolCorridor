"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Snowflake,
  Loader2,
  MapPin,
  Star,
  Route,
  Sparkles,
  Compass,
  Filter,
  Navigation,
} from "lucide-react";
import MapView from "@/components/map/MapView";
import { Suspense, useEffect, useState, useMemo } from "react";
import { scoreCoolPlaces, ScoredPlace } from "@/lib/scoring/coolPlaces";

type FilterCategory = "all" | "nature" | "indoor" | "cafe";

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = (searchParams.get("mode") as "cool" | "warm") || "cool";
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lon = parseFloat(searchParams.get("lon") || "0");

  const [places, setPlaces] = useState<ScoredPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<ScoredPlace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>("all");

  const isValidLocation =
    lat !== 0 && lon !== 0 && !Number.isNaN(lat) && !Number.isNaN(lon);

  useEffect(() => {
    if (!isValidLocation) {
      setLoading(false);
      return;
    }

    async function fetchPlaces() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/api/places/nearby?lat=${lat}&lon=${lon}&mode=${mode}`
        );

        if (!res.ok) throw new Error("Failed to fetch places");

        const data = await res.json();
        const scoredPlaces = scoreCoolPlaces(data, lat, lon);
        setPlaces(scoredPlaces);
        if (scoredPlaces.length > 0) {
          setSelectedPlace(scoredPlaces[0]);
        }
      } catch (err) {
        setError("Could not load nearby microclimate refuges. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlaces();
  }, [lat, lon, mode, isValidLocation]);

  const filteredPlaces = useMemo(() => {
    if (categoryFilter === "all") return places;
    return places.filter((p) => {
      const types = p.types || [];
      if (categoryFilter === "nature") {
        return types.includes("park") || types.includes("natural_feature");
      }
      if (categoryFilter === "indoor") {
        return (
          types.includes("library") ||
          types.includes("shopping_mall") ||
          types.includes("museum")
        );
      }
      if (categoryFilter === "cafe") {
        return (
          types.includes("cafe") ||
          types.includes("coffee_shop") ||
          types.includes("restaurant")
        );
      }
      return true;
    });
  }, [places, categoryFilter]);

  const topScore = places.length > 0 ? places[0].score : null;
  const closestDist =
    places.length > 0 ? Math.min(...places.map((p) => p.distance)) : null;

  // Navigate to Cool Route with selected place as destination
  const handleGetDirections = (place: ScoredPlace) => {
    const destination = encodeURIComponent(place.name);
    // We pass current location as start (user can change it)
    router.push(
      `/route?destination=${destination}&destLat=${place.location.lat}&destLng=${place.location.lng}`
    );
  };

  return (
    <main className="min-h-screen bg-[#0A0D08] text-white flex flex-col bg-dither-grid">
      {/* Header */}
      <header className="bg-[#0A0D08]/90 backdrop-blur-md border-b border-[#27272A] px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3.5 py-2 rounded-[17px] bg-[#11150E] hover:bg-[#171D13] border border-[#27272A] text-[#A1A1AA] hover:text-white flex items-center gap-2 text-xs sm:text-sm transition"
          >
            <ArrowLeft size={16} />
            <span className="font-medium">Dashboard</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="CoolCorridor"
              className="w-8 h-8 object-contain"
            />
            <div>
              <span className="text-sm sm:text-base block leading-none">
                <span className="font-bold text-[#7A9A6E]">Cool</span>
                <span className="font-medium text-[#C4B99A]">Corridor</span>
                <span className="text-white font-semibold"> · Cool Places</span>
              </span>
              <span className="font-mono text-[10px] text-[#A1A1AA] uppercase tracking-wider">
                MICROCLIMATE REFUGE DIRECTORY
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isValidLocation && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#11150E] border border-[#27272A] font-mono text-xs text-[#A1A1AA]">
              <Compass size={13} className="text-[#7A9A6E]" />
              <span>
                {lat.toFixed(4)}°N, {lon.toFixed(4)}°E
              </span>
            </div>
          )}

          <Link
            href="/route"
            className="px-3.5 py-2 rounded-[17px] bg-[#7A9A6E] hover:bg-[#88a97c] text-[#0A0D08] font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition"
          >
            <Route size={14} />
            <span className="hidden sm:inline">Cool Route</span>
          </Link>
        </div>
      </header>

      {!isValidLocation ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-[18px] bg-[#11150E] border border-[#27272A] p-6 text-center space-y-4 shadow-panel">
            <div className="w-12 h-12 rounded-full bg-[#C4B99A]/15 border border-[#C4B99A]/40 text-[#C4B99A] flex items-center justify-center mx-auto">
              <MapPin size={22} />
            </div>
            <h1 className="text-xl font-semibold text-white">
              Coordinates Required for Terrain Scan
            </h1>
            <p className="text-sm text-[#A1A1AA]">
              No active latitude and longitude coordinates were provided.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() =>
                  router.push("/explore?mode=cool&lat=19.0760&lon=72.8777")
                }
                className="flex-1 py-3 px-4 rounded-[17px] bg-[#7A9A6E] text-[#0A0D08] font-mono text-xs font-semibold uppercase tracking-wider hover:bg-[#89aa7d] transition"
              >
                Load Reference Grid
              </button>
              <Link
                href="/"
                className="flex-1 py-3 px-4 rounded-[17px] bg-[#0A0D08] border border-[#27272A] text-white font-mono text-xs font-semibold uppercase tracking-wider hover:border-[#C4B99A] transition"
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Map */}
          <div className="lg:col-span-7 h-[44vh] lg:h-[calc(100vh-7.5rem)] lg:sticky lg:top-20">
            <MapView
              latitude={lat}
              longitude={lon}
              mode={mode}
              places={filteredPlaces}
              selectedPlace={selectedPlace}
              onSelectPlace={(place) => {
                if (!place) {
                  setSelectedPlace(null);
                } else {
                  const found = places.find((p) => p.id === place.id);
                  setSelectedPlace(found || null);
                }
              }}
            />
          </div>

          {/* List Column */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Summary Card */}
            <div className="rounded-[18px] bg-[#11150E] border border-[#27272A] p-5 shadow-panel space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#C4B99A] block">
                    SCAN RESULTS · 1.5KM RADIUS
                  </span>
                  <h1 className="text-xl font-semibold text-white mt-0.5">
                    {loading
                      ? "Scanning microclimates..."
                      : `${filteredPlaces.length} cool places nearby`}
                  </h1>
                </div>
                <span className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-[#0A0D08] border border-[#27272A] text-[#7A9A6E]">
                  SORTED BY COMFORT
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-[14px] bg-[#0A0D08] border border-[#27272A]">
                  <span className="font-mono text-[10px] text-[#A1A1AA] block">
                    PEAK SCORE
                  </span>
                  <span className="font-mono text-lg font-semibold text-[#7A9A6E] mt-0.5 block">
                    {topScore !== null ? `${topScore}/100` : "--"}
                  </span>
                </div>
                <div className="p-3 rounded-[14px] bg-[#0A0D08] border border-[#27272A]">
                  <span className="font-mono text-[10px] text-[#A1A1AA] block">
                    NEAREST
                  </span>
                  <span className="font-mono text-lg font-semibold text-[#C4B99A] mt-0.5 block">
                    {closestDist !== null ? `${closestDist}m` : "--"}
                  </span>
                </div>
                <div className="p-3 rounded-[14px] bg-[#0A0D08] border border-[#27272A]">
                  <span className="font-mono text-[10px] text-[#A1A1AA] block">
                    REFUGES
                  </span>
                  <span className="font-mono text-lg font-semibold text-white mt-0.5 block">
                    {filteredPlaces.length}
                  </span>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <Filter size={13} className="text-[#A1A1AA] shrink-0" />
                {(
                  [
                    { id: "all", label: "All Refuges" },
                    { id: "nature", label: "Parks & Canopy" },
                    { id: "indoor", label: "Libraries & AC" },
                    { id: "cafe", label: "Cafés & Rest" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setCategoryFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-full font-mono text-[11px] font-semibold whitespace-nowrap transition ${categoryFilter === tab.id
                        ? "bg-[#C4B99A] text-[#0A0D08]"
                        : "bg-[#0A0D08] text-[#A1A1AA] border border-[#27272A] hover:text-white"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div className="rounded-[18px] bg-[#11150E] border border-[#27272A] p-12 flex flex-col items-center justify-center gap-3 text-center">
                <Loader2 className="animate-spin text-[#7A9A6E]" size={32} />
                <p className="text-sm font-medium text-white">
                  Evaluating shade canopy & indoor cooling...
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-[18px] bg-red-950/30 border border-red-500/40 p-6 text-center text-red-200 text-sm">
                {error}
              </div>
            )}

            {!loading && !error && filteredPlaces.length === 0 && (
              <div className="rounded-[18px] bg-[#11150E] border border-[#27272A] p-8 text-center space-y-2">
                <p className="text-white font-medium text-sm">
                  No matching cool places in this filter.
                </p>
                {categoryFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("all")}
                    className="mt-2 px-4 py-2 rounded-full bg-[#7A9A6E] text-[#0A0D08] font-mono text-xs font-semibold uppercase"
                  >
                    Show All Refuges
                  </button>
                )}
              </div>
            )}

            {/* Place Cards */}
            <div className="space-y-3 pb-6">
              {filteredPlaces.map((place, index) => {
                const isSelected = selectedPlace?.id === place.id;
                return (
                  <div
                    key={place.id}
                    onClick={() => setSelectedPlace(place)}
                    className={`group rounded-[18px] p-4 border transition-all duration-200 cursor-pointer hover:-translate-y-0.5 ${isSelected
                        ? "bg-[#171D13] border-[#C4B99A] shadow-glow"
                        : "bg-[#11150E] border-[#27272A] hover:border-[#7A9A6E]/60"
                      }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-[12px] font-mono text-xs font-semibold flex flex-col items-center justify-center shrink-0 border ${isSelected
                            ? "bg-[#C4B99A] text-[#0A0D08] border-[#C4B99A]"
                            : "bg-[#0A0D08] text-[#C4B99A] border-[#27272A]"
                          }`}
                      >
                        <span>#{index + 1}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-white text-base leading-snug group-hover:text-[#C4B99A] transition-colors">
                            {place.name}
                          </h3>
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0A0D08] border border-[#7A9A6E]/50 shrink-0">
                            <span className="font-mono text-xs font-semibold text-[#7A9A6E]">
                              {place.score}
                            </span>
                            <span className="font-mono text-[10px] text-[#A1A1AA]">
                              PTS
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-[#C4B99A] mt-1.5 flex items-center gap-1.5 font-medium">
                          <Sparkles size={12} className="text-[#7A9A6E] shrink-0" />
                          <span>{place.reason}</span>
                        </p>

                        {place.vicinity && (
                          <p className="text-xs text-[#A1A1AA] mt-1 truncate">
                            {place.vicinity}
                          </p>
                        )}

                        <div className="mt-3 pt-2.5 border-t border-[#27272A] flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 font-mono text-xs text-[#A1A1AA]">
                            <span className="flex items-center gap-1 text-white">
                              <MapPin size={12} className="text-[#7A9A6E]" />
                              {place.distance} m
                            </span>
                            {place.rating && (
                              <span className="flex items-center gap-1 text-[#C4B99A]">
                                <Star
                                  size={12}
                                  className="fill-[#C4B99A] text-[#C4B99A]"
                                />
                                {place.rating}
                              </span>
                            )}
                          </div>

                          <div className="w-20 h-1.5 bg-[#0A0D08] rounded-full overflow-hidden border border-[#27272A]">
                            <div
                              className="h-full bg-[#7A9A6E] rounded-full"
                              style={{ width: `${place.score}%` }}
                            />
                          </div>
                        </div>

                        {/* Get Directions Button - only on selected card */}
                        {isSelected && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGetDirections(place);
                            }}
                            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#7A9A6E] hover:bg-[#88a97c] text-[#0A0D08] font-mono text-xs font-semibold uppercase tracking-wider transition"
                          >
                            <Navigation size={14} />
                            Get Directions
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0D08] text-[#C4B99A] font-mono text-xs flex items-center justify-center">
          INITIALIZING TERRAIN SCANNER...
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}