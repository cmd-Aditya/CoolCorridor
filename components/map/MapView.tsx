"use client";

import { useEffect, useState } from "react";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/mapbox";
import { MapPin, Compass, Sparkles, Star } from "lucide-react";

export interface Place {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  types: string[];
  vicinity?: string;
  rating?: number;
  distance?: number;
  score?: number;
  reason?: string;
}

interface MapViewProps {
  latitude: number;
  longitude: number;
  mode: "cool" | "warm";
  places?: Place[];
  selectedPlace?: Place | null;
  onSelectPlace?: (place: Place | null) => void;
}

export default function MapView({
  latitude,
  longitude,
  mode,
  places = [],
  selectedPlace: controlledSelectedPlace,
  onSelectPlace,
}: MapViewProps) {
  const [viewState, setViewState] = useState({
    latitude,
    longitude,
    zoom: 14,
  });

  const [internalSelectedPlace, setInternalSelectedPlace] =
    useState<Place | null>(null);

  const selectedPlace =
    controlledSelectedPlace !== undefined
      ? controlledSelectedPlace
      : internalSelectedPlace;

  const handleSelectPlace = (place: Place | null) => {
    if (onSelectPlace) {
      onSelectPlace(place);
    } else {
      setInternalSelectedPlace(place);
    }

    if (place) {
      setViewState((prev) => ({
        ...prev,
        latitude: place.location.lat,
        longitude: place.location.lng,
      }));
    }
  };

  useEffect(() => {
    if (latitude && longitude) {
      setViewState((prev) => ({
        ...prev,
        latitude,
        longitude,
      }));
    }
  }, [latitude, longitude]);

  return (
    <div className="relative w-full h-full rounded-[18px] overflow-hidden border border-[#27272A] bg-[#0A0D08] shadow-panel">
      {/* Top-Left Telemetry HUD Overlay */}
      <div className="pointer-events-none absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
        <div className="bg-[#0A0D08]/90 backdrop-blur-md border border-[#27272A] px-3 py-1.5 rounded-full flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#7A9A6E] animate-pulse" />
          <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[#C4B99A]">
            TERRAIN LAYER · {mode === "cool" ? "COOL REFUGES" : "THERMAL"}
          </span>
        </div>
        <div className="hidden sm:flex bg-[#0A0D08]/85 backdrop-blur-md border border-[#27272A] px-3 py-1.5 rounded-full items-center gap-1.5 font-mono text-[11px] text-[#A1A1AA]">
          <Compass size={12} className="text-[#7A9A6E]" />
          <span>
            {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
          </span>
        </div>
      </div>

      {/* Bottom-Left Legend Overlay */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 hidden sm:flex items-center gap-3 bg-[#0A0D08]/90 backdrop-blur-md border border-[#27272A] px-3 py-1.5 rounded-full font-mono text-[11px] text-[#A1A1AA]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C4B99A]" />
          ORIGIN GPS
        </span>
        <span className="text-[#27272A]">|</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7A9A6E]" />
          COOL REFUGE ({places.length})
        </span>
      </div>

      <Map
        mapboxAccessToken={
          process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        }
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        style={{ width: "100%", height: "100%" }}
      >
        {/* User Location Marker */}
        <Marker latitude={latitude} longitude={longitude} anchor="bottom">
          <div className="relative group">
            <div className="absolute -inset-2 rounded-full bg-[#C4B99A]/25 animate-ping" />
            <div className="relative w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0A0D08] bg-[#C4B99A] text-[#0A0D08]">
              <MapPin size={18} strokeWidth={2.5} />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#0A0D08] border border-[#27272A] text-[#C4B99A] font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap pointer-events-none shadow-md">
              YOU ARE HERE
            </div>
          </div>
        </Marker>

        {/* Place Markers */}
        {places.map((place) => {
          const isSelected = selectedPlace?.id === place.id;
          return (
            <Marker
              key={place.id}
              latitude={place.location.lat}
              longitude={place.location.lng}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleSelectPlace(place);
              }}
            >
              <button
                type="button"
                aria-label={`Select ${place.name}`}
                className={`group relative flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isSelected ? "scale-125 z-20" : "hover:scale-110 z-10"
                }`}
              >
                {isSelected && (
                  <span className="absolute -inset-1.5 rounded-full bg-[#C4B99A]/30 animate-pulse" />
                )}
                <div
                  className={`px-2 py-1 rounded-full font-mono text-[11px] font-semibold flex items-center gap-1 border shadow-md transition-colors ${
                    isSelected
                      ? "bg-[#C4B99A] text-[#0A0D08] border-white"
                      : "bg-[#11150E] text-white border-[#7A9A6E] hover:border-[#C4B99A]"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? "bg-[#0A0D08]" : "bg-[#7A9A6E]"
                    }`}
                  />
                  <span>{place.score ?? "●"}</span>
                </div>
              </button>
            </Marker>
          );
        })}

        {/* Popup when clicking a place */}
        {selectedPlace && (
          <Popup
            latitude={selectedPlace.location.lat}
            longitude={selectedPlace.location.lng}
            anchor="top"
            onClose={() => handleSelectPlace(null)}
            closeOnClick={false}
          >
            <div className="p-1 min-w-[200px] max-w-[240px] text-white">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#7A9A6E]/20 text-[#7A9A6E] border border-[#7A9A6E]/40">
                  INDEX {selectedPlace.score ?? "--"}/100
                </span>
                {selectedPlace.distance !== undefined && (
                  <span className="font-mono text-[11px] text-[#C4B99A]">
                    {selectedPlace.distance}m
                  </span>
                )}
              </div>

              <p className="font-semibold text-sm text-white leading-snug mt-1.5">
                {selectedPlace.name}
              </p>

              {selectedPlace.reason && (
                <p className="text-xs text-[#C4B99A] mt-1 flex items-center gap-1">
                  <Sparkles size={11} className="shrink-0" />
                  <span>{selectedPlace.reason}</span>
                </p>
              )}

              {selectedPlace.vicinity && (
                <p className="text-xs text-[#A1A1AA] mt-1 line-clamp-2">
                  {selectedPlace.vicinity}
                </p>
              )}

              {selectedPlace.rating && (
                <div className="flex items-center gap-1 text-xs text-[#C4B99A] font-mono mt-2 pt-1.5 border-t border-[#27272A]">
                  <Star size={11} className="fill-[#C4B99A] text-[#C4B99A]" />
                  <span>{selectedPlace.rating} VERIFIED RATING</span>
                </div>
              )}
            </div>
          </Popup>
        )}

        <NavigationControl position="top-right" />
      </Map>
    </div>
  );
}
