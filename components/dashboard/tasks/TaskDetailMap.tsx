"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import { MapPin } from "lucide-react";

function fixLeafletIcon() {
    const L = require("leaflet") as typeof import("leaflet");
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
}

function FitView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 14, { animate: false });
    }, [map, center]);
    return null;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TaskDetailMapProps {
    // GeoJSON order: [lng, lat]
    coordinates: [number, number];
    address: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TaskDetailMap({ coordinates, address }: TaskDetailMapProps) {
    // GeoJSON stores [lng, lat] — Leaflet needs [lat, lng]
    const [lng, lat] = coordinates;
    const center: [number, number] = [lat, lng];

    // Fix icon on mount (runs once, client-only)
    const fixed = useRef(false);
    useEffect(() => {
        if (!fixed.current) { fixLeafletIcon(); fixed.current = true; }
    }, []);

    // Fallback if coordinates are [0,0] (task has no geo data)
    const hasCoords = lat !== 0 || lng !== 0;

    if (!hasCoords) {
        return (
            <div className="w-full h-[260px] sm:h-[320px] rounded-2xl bg-zinc-100 border border-zinc-200 flex flex-col items-center justify-center gap-3 text-zinc-400">
                <MapPin className="h-8 w-8 text-zinc-300" />
                <div className="text-center">
                    <p className="text-sm font-semibold text-zinc-500">Location not available</p>
                    <p className="text-xs mt-0.5">{address}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[260px] sm:h-[320px] rounded-2xl overflow-hidden border border-zinc-200 shadow-sm">
            <MapContainer
                center={center}
                zoom={14}
                scrollWheelZoom={false}
                dragging={true}
                zoomControl={true}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
            >
                {/* Tile layer — same as LocationPicker */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Approximate radius circle — Airbnb-style privacy */}
                <Circle
                    center={center}
                    radius={400}
                    pathOptions={{
                        color:       "#2563eb",
                        fillColor:   "#2563eb",
                        fillOpacity: 0.08,
                        weight:      1.5,
                        opacity:     0.25,
                    }}
                />

                {/* Precise marker */}
                <Marker position={center} />

                <FitView center={center} />
            </MapContainer>

            {/* Address overlay chip */}
            <div className="absolute bottom-3 left-3 right-3 z-[400] pointer-events-none">
                <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-md border border-zinc-200/80 rounded-xl shadow-md px-3 py-2 max-w-full">
                    <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span className="text-xs font-semibold text-zinc-700 truncate">{address}</span>
                </div>
            </div>
        </div>
    );
}