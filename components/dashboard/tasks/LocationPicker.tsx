"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { Search, Loader2, X, MapPin } from "lucide-react";
import type L from "leaflet";

// ─── Fix Leaflet's default icon broken by Webpack ────────────────────────────
function fixLeafletIcon() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet") as typeof import("leaflet");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocationData {
    address:   string;
    longitude: number;
    latitude:  number;
}

interface NominatimResult {
    display_name: string;
    lat:          string;
    lon:          string;
}

// ─── Sub-component: syncs map center when position changes ────────────────────

function MapController({ position }: { position: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(position, map.getZoom(), { animate: true });
    }, [map, position]);
    return null;
}

// ─── Sub-component: listens to map click events ───────────────────────────────

function ClickHandler({
    onMapClick,
}: {
    onMapClick: (lat: number, lng: number) => void;
}) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// ─── Reverse geocode via Nominatim ────────────────────────────────────────────

async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
        return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
}

// ─── Forward geocode (search) via Nominatim ───────────────────────────────────

async function searchAddress(query: string): Promise<NominatimResult[]> {
    if (query.length < 3) return [];
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
            { headers: { "Accept-Language": "en" } }
        );
        return await res.json();
    } catch {
        return [];
    }
}

// ─── Main component ───────────────────────────────────────────────────────────

const DEFAULT_CENTER: [number, number] = [17.3850, 78.4867]; // Hyderabad
const DEFAULT_ZOOM = 12;

interface LocationPickerProps {
    onLocationChange: (location: LocationData) => void;
    initialPosition?: [number, number];
}

export default function LocationPicker({
    onLocationChange,
    initialPosition,
}: LocationPickerProps) {
    const [position, setPosition] = useState<[number, number]>(
        initialPosition ?? DEFAULT_CENTER
    );
    const [pinPlaced, setPinPlaced]           = useState(!!initialPosition);
    const [searchQuery, setSearchQuery]       = useState("");
    const [searchResults, setSearchResults]   = useState<NominatimResult[]>([]);
    const [isSearching, setIsSearching]       = useState(false);
    const [showDropdown, setShowDropdown]     = useState(false);
    const [isLocating, setIsLocating]         = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [iconFixed, setIconFixed]           = useState(false);

    // Fix Leaflet icon on mount (client only)
    useEffect(() => {
        fixLeafletIcon();
        setIconFixed(true);
    }, []);

    // Debounced search
    const handleSearchInput = useCallback((value: string) => {
        setSearchQuery(value);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (!value.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }
        setIsSearching(true);
        searchTimeout.current = setTimeout(async () => {
            const results = await searchAddress(value);
            setSearchResults(results);
            setShowDropdown(results.length > 0);
            setIsSearching(false);
        }, 400);
    }, []);

    // When user selects a search result
    function selectResult(result: NominatimResult) {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        setPosition([lat, lng]);
        setPinPlaced(true);
        setSearchQuery(result.display_name);
        setShowDropdown(false);
        setSearchResults([]);
        onLocationChange({
            address:   result.display_name,
            longitude: lng,
            latitude:  lat,
        });
    }

    // When user clicks on the map
    async function handleMapClick(lat: number, lng: number) {
        setPosition([lat, lng]);
        setPinPlaced(true);
        const address = await reverseGeocode(lat, lng);
        setSearchQuery(address);
        onLocationChange({ address, longitude: lng, latitude: lat });
    }

    // ── Use Current Location ──────────────────────────────────────────────────

    function handleUseCurrentLocation() {
        if (!navigator.geolocation) return;

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;

                setPosition([lat, lng]);
                setPinPlaced(true);

                const address = await reverseGeocode(lat, lng);
                setSearchQuery(address);
                onLocationChange({ address, longitude: lng, latitude: lat });

                setIsLocating(false);
            },
            () => {
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }

    if (!iconFixed) return null;

    return (
        <div className="relative w-full h-full flex flex-col">

            {/* ── Search bar ─────────────────────────────────────────────── */}
            <div className="absolute top-3 left-3 right-3 z-[1000]">
                <div className="relative shadow-lg rounded-xl overflow-visible">

                    {/* Input row */}
                    <div className="relative flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                                placeholder="Search for an address…"
                                className="w-full h-10 pl-10 pr-9 rounded-xl border border-zinc-200 bg-white/95 backdrop-blur-sm text-sm font-medium text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                            />
                            {isSearching ? (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 animate-spin" />
                            ) : searchQuery && (
                                <button
                                    onClick={() => { setSearchQuery(""); setSearchResults([]); setShowDropdown(false); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500 transition"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Search dropdown results */}
                    {showDropdown && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-zinc-200 shadow-xl overflow-hidden z-[1001]">
                            {searchResults.map((result, i) => (
                                <button
                                    key={i}
                                    onClick={() => selectResult(result)}
                                    className="w-full flex items-start gap-2.5 px-4 py-3 text-left hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0"
                                >
                                    <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                                    <span className="text-sm text-zinc-700 font-medium leading-snug line-clamp-2">
                                        {result.display_name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Leaflet map ────────────────────────────────────────────── */}
            <div className="flex-1 w-full h-full" style={{ minHeight: "inherit" }}>
                <MapContainer
                    center={position}
                    zoom={DEFAULT_ZOOM}
                    className="w-full h-full"
                    zoomControl={false}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {pinPlaced && (
                        <Marker
                            position={position}
                            draggable
                            eventHandlers={{
                                dragend: async (e) => {
                                    const marker = e.target as L.Marker;
                                    const { lat, lng } = marker.getLatLng();
                                    setPosition([lat, lng]);
                                    const address = await reverseGeocode(lat, lng);
                                    setSearchQuery(address);
                                    onLocationChange({ address, longitude: lng, latitude: lat });
                                },
                            }}
                        />
                    )}
                    <MapController position={position} />
                    <ClickHandler onMapClick={handleMapClick} />
                </MapContainer>
            </div>

            {/* ── Hint ───────────────────────────────────────────────────── */}
            {!pinPlaced && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[999] pointer-events-none">
                    <div className="bg-zinc-900/80 text-white text-xs font-semibold px-4 py-2 rounded-full backdrop-blur-sm whitespace-nowrap">
                        Click on the map or search above to set location
                    </div>
                </div>
            )}
        </div>
    );
}