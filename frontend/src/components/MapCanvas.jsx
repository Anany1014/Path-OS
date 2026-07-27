/**
 * MapCanvas.jsx — React-Leaflet Core Map Component
 * Renders the OSM base map with all dynamic overlays:
 *  • Flood zone polygons (Monsoon Matrix)
 *  • Noise corridor polylines (NavQuiet)
 *  • Serene zone polygons (NavQuiet)
 *  • Smog boundary polygons (AirGuard)
 *  • Emergency shelter markers
 *  • Route polylines (Pulse and Haven)
 *  • Building shadow polygons (ShadeSeeker — computed via trig)
 */

import React, { useMemo, useRef, useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Polygon,
    Polyline,
    CircleMarker,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";
import L from "leaflet";

// ─── Leaflet default icon fix (Vite asset bundling) ──────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Custom shelter icon ──────────────────────────────────────────────────────
const shelterIcon = new L.DivIcon({
    className: "",
    html: `<div style="
    width:28px;height:28px;border-radius:50%;
    background:rgba(16,245,160,0.15);
    border:2px solid #10F5A0;
    display:flex;align-items:center;justify-content:center;
    font-size:13px;
    box-shadow:0 0 12px rgba(16,245,160,0.5);
  ">🏥</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

// ─── Overlay color palettes ───────────────────────────────────────────────────
const FLOOD_COLORS = {
    chest: { color: "#FF3B3B", fillColor: "#FF3B3B", fillOpacity: 0.35, weight: 2, dashArray: "4,3" },
    knee: { color: "#FFBA08", fillColor: "#FFBA08", fillOpacity: 0.30, weight: 2, dashArray: "4,3" },
    shallow: { color: "#10F5A0", fillColor: "#10F5A0", fillOpacity: 0.20, weight: 1.5, dashArray: "4,3" },
};
const NOISE_COLORS = {
    red: { color: "#FF3B3B", weight: 4, opacity: 0.8, dashArray: "8,4" },
    amber: { color: "#FFBA08", weight: 3, opacity: 0.7, dashArray: "8,4" },
};
const SERENE_STYLE = { color: "#10F5A0", fillColor: "#10F5A0", fillOpacity: 0.12, weight: 1.5 };
const SMOG_STYLE = { color: "#FF6B1A", fillColor: "#FF6B1A", fillOpacity: 0.20, weight: 2, dashArray: "6,3" };

// ─── Sun Elevation Angle (degrees) for New Delhi (28.6°N) ────────────────────
// Simple sinusoidal approximation. Solar noon ≈ 12:30 IST.
function sunElevation(hour) {
    const solarNoon = 12.5;
    const maxElev = 75; // degrees at solar noon in summer
    const angle = ((hour - solarNoon) / 6) * 90;
    const elev = maxElev * Math.cos((angle * Math.PI) / 180);
    return Math.max(elev, 2); // minimum 2° so we never divide by zero
}

// ─── Sun Azimuth (degrees from North) for Delhi ───────────────────────────────
function sunAzimuth(hour) {
    // Rises ~70° East, sets ~290° West; noon ≈ 180° South
    return 70 + ((hour - 6) / 12) * 220;
}

// ─── Compute shadow polygon for one building ─────────────────────────────────
// Returns a leaflet [lat, lon] polygon array representing the shadow.
// Shadow formula: L = h * cot(θ) where θ = sun elevation in radians
function buildShadowPolygon(building, hour) {
    const elevDeg = sunElevation(hour);
    const azimDeg = sunAzimuth(hour);
    const elevRad = (elevDeg * Math.PI) / 180;
    const azimRad = (azimDeg * Math.PI) / 180;

    // Shadow length in degrees of lat/lon (1° ≈ 111km at equator)
    const L_meters = building.height / Math.tan(elevRad);
    const L_deg = L_meters / 111000;

    // Shadow cast opposite to sun direction (azimuth + 180°)
    const shadowAzim = azimRad + Math.PI;
    const dLon = L_deg * Math.sin(shadowAzim);
    const dLat = L_deg * Math.cos(shadowAzim);

    // Offset each footprint vertex in the shadow direction
    const footprint = building.footprint; // [[lng, lat], ...]
    const shadow = footprint.map(([lng, lat]) => [lat + dLat, lng + dLon]);
    return shadow;
}

// ─── Map-ready callback component ────────────────────────────────────────────
function MapReadyBridge({ onMapReady }) {
    const map = useMap();
    useEffect(() => { if (onMapReady) onMapReady(map); }, [map, onMapReady]);
    return null;
}

// ─── Route GeoJSON extractor (multilinestring or linestring) ─────────────────
function extractLatLngs(geojson) {
    if (!geojson) return [];
    const { type, coordinates } = geojson;
    if (type === "LineString") {
        return coordinates.map(([lng, lat]) => [lat, lng]);
    }
    if (type === "MultiLineString") {
        return coordinates.flatMap((seg) => seg.map(([lng, lat]) => [lat, lng]));
    }
    return [];
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MapCanvas({
    center,
    spatialData,
    routeData,
    routeMode,
    showFloodZones,
    showNoiseZones,
    showSereneZones,
    showSmogZones,
    showShelters,
    showShadows,
    buildingData,
    selectedHour,
    onMapReady,
}) {
    // Pre-compute shadow polygons when hour or buildings change
    const shadowPolygons = useMemo(() => {
        if (!showShadows || !buildingData?.buildings?.length) return [];
        return buildingData.buildings.map((b) => ({
            id: b.id,
            name: b.name,
            coords: buildShadowPolygon(b, selectedHour),
        }));
    }, [showShadows, buildingData, selectedHour]);

    const routeCoords = useMemo(() => extractLatLngs(routeData?.geojson), [routeData]);
    const routeColor = routeMode === "pulse" ? "#10F5A0" : "#FFBA08";
    const routeWeight = routeMode === "pulse" ? 4 : 5;

    return (
        <MapContainer
            center={[center.lat, center.lng]}
            zoom={10}
            zoomControl={false}
            style={{ position: "absolute", inset: 0, zIndex: 0 }}
        >
            {/* ── OSM Base Tiles ── */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
            />

            {/* ── Map-ready bridge ── */}
            <MapReadyBridge onMapReady={onMapReady} />

            {/* ── Flood Zone Polygons (Monsoon Matrix) ── */}
            {showFloodZones && spatialData?.floodZones?.features?.map((feature) => {
                const depth = feature.properties.depth;
                const style = FLOOD_COLORS[depth] || FLOOD_COLORS.shallow;
                const latLngs = feature.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
                return (
                    <Polygon key={feature.properties.id} positions={latLngs} pathOptions={style}>
                        <Popup>
                            <div className="text-xs">
                                <div className="font-bold mb-1">{feature.properties.name}</div>
                                <div>Water Depth: <span className="font-semibold capitalize">{depth}</span></div>
                                <div
                                    className="mt-1 px-2 py-0.5 rounded text-center text-[10px] font-bold"
                                    style={{ background: style.color + "33", color: style.color, border: `1px solid ${style.color}55` }}
                                >
                                    {depth === "chest" ? "🔴 DANGER — Avoid" : depth === "knee" ? "🟡 CAUTION" : "🟢 Passable"}
                                </div>
                            </div>
                        </Popup>
                    </Polygon>
                );
            })}

            {/* ── Noise Corridor Polylines (NavQuiet) ── */}
            {showNoiseZones && spatialData?.noiseCorridors?.features?.map((feature) => {
                const style = NOISE_COLORS[feature.properties.severity] || NOISE_COLORS.amber;
                const latLngs = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
                return (
                    <Polyline key={feature.properties.id} positions={latLngs} pathOptions={style}>
                        <Popup>
                            <div className="text-xs">
                                <div className="font-bold mb-1">{feature.properties.name}</div>
                                <div>Noise Level: <span className="font-semibold">{feature.properties.decibels} dB</span></div>
                            </div>
                        </Popup>
                    </Polyline>
                );
            })}

            {/* ── Serene Zone Polygons (NavQuiet) ── */}
            {showSereneZones && spatialData?.sereneZones?.features?.map((feature) => {
                const latLngs = feature.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
                return (
                    <Polygon key={feature.properties.id} positions={latLngs} pathOptions={SERENE_STYLE}>
                        <Popup>
                            <div className="text-xs">
                                <div className="font-bold mb-1">🍃 {feature.properties.name}</div>
                                <div>Ambient Noise: <span className="font-semibold text-emerald-300">{feature.properties.decibels} dB</span></div>
                                <div className="text-emerald-400 text-[10px] mt-1">✓ Serene Zone</div>
                            </div>
                        </Popup>
                    </Polygon>
                );
            })}

            {/* ── Smog Boundary Polygons (AirGuard) ── */}
            {showSmogZones && spatialData?.smogZones?.features?.map((feature) => {
                const latLngs = feature.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
                return (
                    <Polygon key={feature.properties.id} positions={latLngs} pathOptions={SMOG_STYLE}>
                        <Popup>
                            <div className="text-xs">
                                <div className="font-bold mb-1">⚠️ {feature.properties.name}</div>
                                <div>PM2.5: <span className="font-semibold text-orange-300">{feature.properties.pm25} µg/m³</span></div>
                                <div className="capitalize text-orange-400 text-[10px] mt-1">{feature.properties.severity.replace("_", " ")}</div>
                            </div>
                        </Popup>
                    </Polygon>
                );
            })}

            {/* ── Emergency Shelter Markers ── */}
            {showShelters && spatialData?.emergencyShelters?.map((shelter) => (
                <Marker key={shelter.id} position={[shelter.lat, shelter.lon]} icon={shelterIcon}>
                    <Popup>
                        <div className="text-xs">
                            <div className="font-bold mb-1">{shelter.name}</div>
                            <div className="capitalize text-emerald-300">{shelter.type}</div>
                            {shelter.phone && <div className="text-slate-400 mt-1">📞 {shelter.phone}</div>}
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* ── Shadow Polygons (ShadeSeeker) ── */}
            {showShadows && shadowPolygons.map((sp) => (
                <Polygon
                    key={`shadow-${sp.id}`}
                    positions={sp.coords}
                    pathOptions={{ color: "#1e293b", fillColor: "#0f172a", fillOpacity: 0.55, weight: 0 }}
                >
                    <Popup>
                        <div className="text-xs">
                            <div className="font-bold mb-1">{sp.name}</div>
                            <div className="text-slate-400">Shadow at {selectedHour}:00</div>
                        </div>
                    </Popup>
                </Polygon>
            ))}

            {/* ── Route Polyline ── */}
            {routeCoords.length > 0 && (
                <>
                    {/* Glow halo */}
                    <Polyline
                        positions={routeCoords}
                        pathOptions={{ color: routeColor, weight: routeWeight + 6, opacity: 0.15 }}
                    />
                    {/* Main route line */}
                    <Polyline
                        positions={routeCoords}
                        pathOptions={{ color: routeColor, weight: routeWeight, opacity: 0.95, lineCap: "round" }}
                    />
                </>
            )}
        </MapContainer>
    );
}
