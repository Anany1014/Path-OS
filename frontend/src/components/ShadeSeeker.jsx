/**
 * ShadeSeeker.jsx — Heat Mitigation & Shadow Simulation Module
 * Provides:
 *  1. Interactive time-slider (6am – 8pm)
 *  2. Triggers shadow polygon computation in MapCanvas via parent state
 *  3. Fetches building footprints from backend /api/overpass
 *  4. Shows hydration station / shelter overlay toggle
 *
 * Shadow math is executed in MapCanvas.jsx via the buildShadowPolygon()
 * function (L = h * cot(θ)) — this component just drives the time value.
 */

import React, { useState, useCallback } from "react";
import { fetchOverpass } from "../services/api";

const HOURS = Array.from({ length: 15 }, (_, i) => i + 6); // 6am to 8pm

function formatHour(h) {
    if (h === 12) return "12 PM";
    return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

// Time-of-day color for the slider gradient
function sliderGradient(hour) {
    if (hour < 8) return "from-blue-900 via-blue-700 to-orange-400";
    if (hour < 11) return "from-orange-400 to-yellow-300";
    if (hour < 15) return "from-yellow-300 to-amber-400";
    if (hour < 18) return "from-amber-400 to-orange-500";
    return "from-orange-500 via-red-600 to-indigo-900";
}

export default function ShadeSeeker({
    showShadows, setShowShadows,
    selectedHour, setSelectedHour,
    buildingData, setBuildingData,
    showShelters, setShowShelters,
    mapRef,
}) {
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [fetchSource, setFetchSource] = useState(null);

    // ─── Fetch building footprints from Overpass via backend ─────────────────
    const loadBuildings = useCallback(async () => {
        setIsFetching(true);
        setFetchError(null);

        // ── Zoom guard: prevent massive Overpass queries at city-level zoom ──
        if (mapRef && mapRef.getZoom && mapRef.getZoom() < 14) {
            setFetchError("Please zoom in closer (zoom ≥ 14) to load building shadows safely.");
            setIsFetching(false);
            return;
        }

        // Get current map viewport bbox, or use Delhi CP as default
        let bbox = "28.60,77.19,28.65,77.25";
        if (mapRef) {
            try {
                const bounds = mapRef.getBounds();
                bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
            } catch (_) { }
        }

        try {
            const data = await fetchOverpass(bbox);
            setBuildingData(data);
            setFetchSource(data.fallback ? "demo" : "overpass");
            setShowShadows(true);
        } catch (err) {
            setFetchError("Could not load building data. Make sure backend is running.");
        } finally {
            setIsFetching(false);
        }
    }, [mapRef, setBuildingData, setShowShadows]);


    const sunElev = Math.max(
        75 * Math.cos(((selectedHour - 12.5) / 6) * (Math.PI / 2)),
        2
    ).toFixed(0);

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <div>
                <div className="section-label">ShadeSeeker</div>
                <div className="text-xs text-slate-400">Simulate building shadows by time of day</div>
            </div>

            {/* ── Time Slider ── */}
            <div className="glass-card rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">Time of Day</div>
                    <div className="text-sm font-mono font-bold text-amber-300">{formatHour(selectedHour)}</div>
                </div>

                {/* Sun arc visualization */}
                <div className="relative h-10 flex items-end justify-center overflow-hidden rounded-lg bg-slate-900/50">
                    <svg viewBox="0 0 200 50" className="w-full h-full" preserveAspectRatio="none">
                        {/* Sun arc path */}
                        <path
                            d="M 0 50 Q 100 -5 200 50"
                            fill="none"
                            stroke="rgba(255,186,8,0.3)"
                            strokeWidth="1.5"
                            strokeDasharray="4,3"
                        />
                        {/* Sun position dot */}
                        {(() => {
                            const t = (selectedHour - 6) / 14;
                            const x = t * 200;
                            const arcY = 50 - Math.sin(t * Math.PI) * 45;
                            return (
                                <circle cx={x} cy={arcY} r="5" fill="#FFBA08"
                                    style={{ filter: "drop-shadow(0 0 4px #FFBA0880)" }}
                                />
                            );
                        })()}
                    </svg>
                </div>

                <input
                    type="range"
                    min={6} max={20} step={1}
                    value={selectedHour}
                    onChange={(e) => setSelectedHour(+e.target.value)}
                    className="w-full"
                />

                {/* Hour ticks */}
                <div className="flex justify-between text-[9px] text-slate-600 font-mono -mt-2">
                    {[6, 9, 12, 15, 18, 20].map(h => (
                        <span key={h} className={selectedHour === h ? "text-amber-400" : ""}>{formatHour(h)}</span>
                    ))}
                </div>

                {/* Sun info */}
                <div className="flex gap-2 text-[10px]">
                    <div className="flex-1 glass-card rounded-lg px-2 py-1.5 text-center">
                        <div className="text-slate-500">Elevation</div>
                        <div className="text-amber-300 font-mono font-semibold">{sunElev}°</div>
                    </div>
                    <div className="flex-1 glass-card rounded-lg px-2 py-1.5 text-center">
                        <div className="text-slate-500">UV Index</div>
                        <div className="text-amber-300 font-mono font-semibold">
                            {selectedHour >= 10 && selectedHour <= 15 ? "High" : "Moderate"}
                        </div>
                    </div>
                    <div className="flex-1 glass-card rounded-lg px-2 py-1.5 text-center">
                        <div className="text-slate-500">Shadow L</div>
                        <div className="text-amber-300 font-mono font-semibold">
                            {(18 / Math.tan((+sunElev * Math.PI) / 180)).toFixed(0)}m
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Shadow Overlay Controls ── */}
            <div className="glass-card rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium text-white">Shadow Overlay</div>
                        <div className="text-[10px] text-slate-500">
                            {buildingData
                                ? `${buildingData.buildingCount} buildings · ${fetchSource === "demo" ? "Demo data" : "Overpass live"}`
                                : "No building data loaded"}
                        </div>
                    </div>
                    <button
                        onClick={() => { if (buildingData) setShowShadows(!showShadows); }}
                        disabled={!buildingData}
                        className={`relative w-11 h-6 rounded-full transition-all duration-300 border ${showShadows && buildingData
                            ? "bg-amber-500/30 border-amber-500/50"
                            : "bg-white/5 border-white/15"
                            } disabled:opacity-40`}
                    >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 ${showShadows && buildingData
                            ? "left-5 bg-amber-400 shadow-[0_0_8px_rgba(255,186,8,0.7)]"
                            : "left-0.5 bg-slate-500"
                            }`} />
                    </button>
                </div>

                <button
                    onClick={loadBuildings}
                    disabled={isFetching}
                    className="w-full py-2 rounded-lg text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all disabled:opacity-50"
                >
                    {isFetching ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Loading Buildings…
                        </span>
                    ) : buildingData ? "🔄 Refresh Building Data" : "🏗️ Load Building Footprints"}
                </button>

                {fetchError && (
                    <div className="text-[10px] text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1.5">
                        ⚠️ {fetchError}
                    </div>
                )}
            </div>

            {/* ── Hydration Stations Toggle ── */}
            <div className="flex items-center justify-between glass-card rounded-xl px-4 py-3">
                <div>
                    <div className="text-sm font-medium text-white">💧 Cooling Stations</div>
                    <div className="text-[10px] text-slate-500">Hydration & shelter markers</div>
                </div>
                <button
                    onClick={() => setShowShelters(!showShelters)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 border ${showShelters
                        ? "bg-emerald-500/30 border-emerald-500/50"
                        : "bg-white/5 border-white/15"
                        }`}
                >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 ${showShelters
                        ? "left-5 bg-emerald-400 shadow-[0_0_8px_rgba(16,245,160,0.7)]"
                        : "left-0.5 bg-slate-500"
                        }`} />
                </button>
            </div>

            {/* Formula Note */}
            <div className="text-[10px] text-slate-600 text-center leading-relaxed">
                Shadow length: <span className="font-mono text-amber-600/70">L = h · cot(θ)</span>
                <br />θ = sun elevation angle, h = building height
            </div>
        </div>
    );
}
