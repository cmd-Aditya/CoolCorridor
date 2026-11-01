"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Route,
  MapPin,
  Navigation,
  Loader2,
  Leaf,
  Clock,
  Ruler,
  Thermometer,
  Footprints,
  Bike,
  Car,
} from "lucide-react";
import Map, { Marker, Source, Layer, NavigationControl, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

interface Coordinates {
  lat: number;
  lng: number;
}

interface CoolPlace {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  vicinity?: string;
}

type TransportMode = "walking" | "cycling" | "driving";

export default function RoutePage() {
  const searchParams = useSearchParams();

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [startCoords, setStartCoords] = useState<Coordinates | null>(null);
  const [endCoords, setEndCoords] = useState<Coordinates | null>(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
  const [alternativeRoute, setAlternativeRoute] = useState<any>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTemp, setCurrentTemp] = useState<number | null>(null);
  const [coolPlaces, setCoolPlaces] = useState<CoolPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<CoolPlace | null>(null);
  const [mode, setMode] = useState<TransportMode>("walking");
  const [suggestedMode, setSuggestedMode] = useState<TransportMode | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const watchIdRef = useRef<number | null>(null);

  const [viewState, setViewState] = useState({
    latitude: 19.1052,
    longitude: 72.8784,
    zoom: 13,
  });

  // Auto-fill destination coming from Cool Places
  useEffect(() => {
    const destination = searchParams.get("destination");
    const destLat = searchParams.get("destLat");
    const destLng = searchParams.get("destLng");

    if (destination) {
      setEnd(destination);
    }

    if (destLat && destLng) {
      const lat = parseFloat(destLat);
      const lng = parseFloat(destLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        setEndCoords({ lat, lng });
      }
    }
  }, [searchParams]);

  // Initial location + temperature
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (position) => {
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setUserLocation(coords);
      setViewState({
        latitude: coords.lat,
        longitude: coords.lng,
        zoom: 13,
      });

      try {
        const res = await fetch(
          `/api/weather/current?lat=${coords.lat}&lon=${coords.lng}`
        );
        const data = await res.json();
        setCurrentTemp(data.temp);
      } catch (err) {
        console.error("Temperature fetch failed");
      }
    });
  }, []);

  // Live tracking
  const startTracking = () => {
    if (!navigator.geolocation) return;

    setIsTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setViewState((prev) => ({
          ...prev,
          latitude: coords.lat,
          longitude: coords.lng,
        }));
      },
      (err) => console.error("Tracking error", err),
      { enableHighAccuracy: true, maximumAge: 3000 }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  async function geocodePlace(query: string): Promise<Coordinates | null> {
    if (query.toLowerCase() === "current location" && userLocation) {
      return userLocation;
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${token}&limit=1&country=IN`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.features?.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
    return null;
  }

  function suggestModeByDistance(distanceInMeters: number): TransportMode {
    if (distanceInMeters < 1200) return "walking";
    if (distanceInMeters < 7000) return "cycling";
    return "driving";
  }

  async function getRoute(
    start: Coordinates,
    end: Coordinates,
    selectedMode: TransportMode
  ) {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    const profile =
      selectedMode === "driving" ? "driving-traffic" : selectedMode;

    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&overview=full&alternatives=true&access_token=${token}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error("No route found");
    }

    const mainRoute = data.routes[0];

    setRouteGeoJSON({
      type: "Feature",
      properties: {},
      geometry: mainRoute.geometry,
    });

    setDistance(mainRoute.distance);
    setDuration(mainRoute.duration);

    if (data.routes[1]) {
      setAlternativeRoute({
        type: "Feature",
        properties: {},
        geometry: data.routes[1].geometry,
      });
    } else {
      setAlternativeRoute(null);
    }

    const suggested = suggestModeByDistance(mainRoute.distance);
    setSuggestedMode(suggested);

    const midLat = (start.lat + end.lat) / 2;
    const midLng = (start.lng + end.lng) / 2;

    setViewState({
      latitude: midLat,
      longitude: midLng,
      zoom: 13,
    });

    if (selectedMode === "walking") {
      fetchCoolPlacesNearRoute(midLat, midLng);
    } else {
      setCoolPlaces([]);
    }
  }

  async function fetchCoolPlacesNearRoute(lat: number, lng: number) {
    try {
      const res = await fetch(
        `/api/places/nearby?lat=${lat}&lon=${lng}&mode=cool`
      );
      if (!res.ok) return;
      const data = await res.json();
      setCoolPlaces(
        data.slice(0, 7).map((p: any) => ({
          id: p.id,
          name: p.name,
          location: p.location,
          vicinity: p.vicinity,
        }))
      );
    } catch (err) {
      console.error(err);
    }
  }

  const handleFindRoute = async () => {
    if (!start.trim() || !end.trim()) {
      setError("Please enter both start and destination");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setRouteGeoJSON(null);
      setAlternativeRoute(null);
      setDistance(null);
      setDuration(null);
      setCoolPlaces([]);

      const startLoc = await geocodePlace(start);

      // If we already have endCoords from Cool Places, use them
      let endLoc = endCoords;
      if (!endLoc) {
        endLoc = await geocodePlace(end);
      }

      if (!startLoc || !endLoc) {
        setError("Could not find one of the locations. Try a more specific name.");
        return;
      }

      setStartCoords(startLoc);
      setEndCoords(endLoc);

      await getRoute(startLoc, endLoc, mode);
    } catch (err) {
      setError("Failed to find route. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when mode changes
  useEffect(() => {
    if (startCoords && endCoords) {
      setLoading(true);
      getRoute(startCoords, endCoords, mode).finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const useCurrentLocation = () => {
    if (userLocation) {
      setStart("Current Location");
      setStartCoords(userLocation);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0D08] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#27272A] px-4 py-3 flex items-center justify-between sticky top-0 z-30 bg-[#0A0D08]/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#A1A1AA] hover:text-white"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="CoolCorridor"
              className="w-7 h-7 object-contain"
            />
            <span className="text-sm sm:text-base">
              <span className="font-bold text-[#7A9A6E]">Cool</span>
              <span className="font-medium text-[#C4B99A]">Corridor</span>
              <span className="text-[#A1A1AA] text-xs font-mono ml-1.5 uppercase">
                {"// Route"}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentTemp !== null && (
            <div className="flex items-center gap-1 text-sm text-[#A1A1AA]">
              <Thermometer size={14} />
              <span className="font-mono">{currentTemp}°</span>
            </div>
          )}
          <button
            suppressHydrationWarning
            onClick={isTracking ? stopTracking : startTracking}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${isTracking
                ? "bg-[#7A9A6E] text-black border-[#7A9A6E]"
                : "border-[#27272A] text-[#A1A1AA]"
              }`}
          >
            {isTracking ? "Tracking..." : "Track Me"}
          </button>
        </div>
      </header>

      {/* Inputs */}
      <div className="p-4 space-y-3 border-b border-[#27272A]">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#7A9A6E]" />
          <input
            suppressHydrationWarning
            type="text"
            placeholder="Starting point"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full pl-9 pr-24 py-3 rounded-2xl bg-[#12150F] border border-[#27272A] text-sm focus:outline-none focus:border-[#7A9A6E]"
          />
          {userLocation && (
            <button
              suppressHydrationWarning
              onClick={useCurrentLocation}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7A9A6E]"
            >
              Use current
            </button>
          )}
        </div>

        <div className="relative">
          <MapPin
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400"
          />
          <input
            suppressHydrationWarning
            type="text"
            placeholder="Destination"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[#12150F] border border-[#27272A] text-sm focus:outline-none focus:border-[#7A9A6E]"
          />
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2">
          {[
            { id: "walking", label: "Walk", icon: Footprints },
            { id: "cycling", label: "Cycle", icon: Bike },
            { id: "driving", label: "Drive", icon: Car },
          ].map((item) => (
            <button
              key={item.id}
              suppressHydrationWarning
              onClick={() => setMode(item.id as TransportMode)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm border transition ${mode === item.id
                  ? "bg-[#7A9A6E] text-black border-[#7A9A6E]"
                  : "border-[#27272A] text-[#A1A1AA]"
                }`}
            >
              <item.icon size={15} />
              {item.label}
            </button>
          ))}
        </div>

        <button
          suppressHydrationWarning
          onClick={handleFindRoute}
          disabled={loading}
          className="w-full bg-[#7A9A6E] hover:bg-[#8baa7d] disabled:opacity-60 text-black font-medium py-3.5 rounded-2xl flex items-center justify-center gap-2 transition"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Finding optimized route...
            </>
          ) : (
            <>
              <Navigation size={18} />
              Find Optimized Route
            </>
          )}
        </button>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}
      </div>

      {/* Results Card */}
      {distance && duration && (
        <div className="px-4 py-3">
          <div className="bg-[#12150F] border border-[#27272A] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Leaf size={16} className="text-[#7A9A6E]" />
                <span className="font-medium text-[#C4B99A]">Primary Route</span>
              </div>
              <span className="text-xs text-[#A1A1AA] uppercase tracking-wider">
                {mode}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-[#A1A1AA]">
                <Ruler size={14} />
                {(distance / 1000).toFixed(1)} km
              </div>
              <div className="flex items-center gap-2 text-[#A1A1AA]">
                <Clock size={14} />
                ~{Math.round(duration / 60)} min
              </div>
            </div>

            {suggestedMode && suggestedMode !== mode && (
              <p className="mt-3 text-xs text-[#C4B99A] bg-[#1a1f17] px-3 py-2 rounded-xl">
                Suggestion: <strong>{suggestedMode}</strong> may be better for
                this distance.
              </p>
            )}

            {mode === "walking" && coolPlaces.length > 0 && (
              <p className="mt-2 text-xs text-[#7A9A6E]">
                {coolPlaces.length} cool places found near this route
              </p>
            )}
          </div>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative min-h-[450px]">
        <div className="absolute inset-0">
          <Map
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            style={{ width: "100%", height: "100%" }}
          >
            <NavigationControl position="top-right" />

            {userLocation && (
              <Marker
                latitude={userLocation.lat}
                longitude={userLocation.lng}
                anchor="center"
              >
                <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow animate-pulse" />
              </Marker>
            )}

            {startCoords && (
              <Marker
                latitude={startCoords.lat}
                longitude={startCoords.lng}
                anchor="bottom"
              >
                <div className="w-7 h-7 rounded-full bg-[#7A9A6E] border-2 border-white shadow flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </Marker>
            )}

            {endCoords && (
              <Marker
                latitude={endCoords.lat}
                longitude={endCoords.lng}
                anchor="bottom"
              >
                <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-white shadow flex items-center justify-center">
                  <MapPin size={14} className="text-white" />
                </div>
              </Marker>
            )}

            {coolPlaces.map((place) => (
              <Marker
                key={place.id}
                latitude={place.location.lat}
                longitude={place.location.lng}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedPlace(place);
                }}
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 border border-white shadow cursor-pointer flex items-center justify-center">
                  <Leaf size={11} className="text-white" />
                </div>
              </Marker>
            ))}

            {selectedPlace && (
              <Popup
                latitude={selectedPlace.location.lat}
                longitude={selectedPlace.location.lng}
                onClose={() => setSelectedPlace(null)}
                closeOnClick={false}
              >
                <div className="text-white text-sm p-1">
                  <p className="font-semibold">{selectedPlace.name}</p>
                  <p className="text-xs text-[#A1A1AA]">
                    {selectedPlace.vicinity}
                  </p>
                </div>
              </Popup>
            )}

            {routeGeoJSON && (
              <Source id="main-route" type="geojson" data={routeGeoJSON}>
                <Layer
                  id="main-route-line"
                  type="line"
                  layout={{ "line-join": "round", "line-cap": "round" }}
                  paint={{
                    "line-color": "#7A9A6E",
                    "line-width": 5,
                    "line-opacity": 0.95,
                  }}
                />
              </Source>
            )}

            {alternativeRoute && (
              <Source id="alt-route" type="geojson" data={alternativeRoute}>
                <Layer
                  id="alt-route-line"
                  type="line"
                  layout={{ "line-join": "round", "line-cap": "round" }}
                  paint={{
                    "line-color": "#C4B99A",
                    "line-width": 4,
                    "line-opacity": 0.55,
                    "line-dasharray": [2, 2],
                  }}
                />
              </Source>
            )}
          </Map>
        </div>
      </div>
    </main>
  );
}