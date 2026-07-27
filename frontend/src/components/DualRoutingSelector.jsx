/**
 * DualRoutingSelector.jsx
 * The primary routing UI: origin/destination inputs, Pulse ↔ Haven toggle,
 * route calculation, and EmpathyScore display.
 */

import React, { useState } from "react";
import { fetchRoute } from "../services/api";
import EmpathyScore from "./EmpathyScore";

const LOCAL_GEOCODE_FALLBACK = [
    { label: "Connaught Place, New Delhi", value: [77.2167, 28.6315] },
    { label: "India Gate, New Delhi", value: [77.2295, 28.6129] },
    { label: "Karol Bagh, New Delhi", value: [77.1910, 28.6520] },
    { label: "Lodhi Garden, New Delhi", value: [77.2320, 28.5904] },
    { label: "Saket Metro Station, New Delhi", value: [77.2066, 28.5244] },
    { label: "AIIMS, New Delhi", value: [77.2100, 28.5672] },
    { label: "Noida Sector 62, Uttar Pradesh", value: [77.3639, 28.6219] },
    { label: "DLF Cyber City, Gurugram, Haryana", value: [77.0878, 28.4952] },
    { label: "Indirapuram, Ghaziabad, Uttar Pradesh", value: [77.3735, 28.6362] },
    { label: "Faridabad Sector 15, Haryana", value: [77.3178, 28.4069] },
    { label: "Dwarka Sector 10, New Delhi", value: [77.0589, 28.5812] },
    { label: "Red Fort, Delhi", value: [77.2410, 28.6562] },
];

function LocationSearchInput({ label, onChange, placeholder, mapRef }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [searching, setSearching] = useState(false);

    const handleInputChange = async (val) => {
        setQuery(val);
        if (val.length < 3) {
            setSuggestions([]);
            return;
        }

        setSearching(true);
        setIsOpen(true);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val + ", Delhi NCR")}&limit=5`
            );
            if (response.ok) {
                const data = await response.json();
                const formatted = data.map((item) => ({
                    label: item.display_name.replace(", India", ""),
                    value: [parseFloat(item.lon), parseFloat(item.lat)],
                }));
                const localMatches = LOCAL_GEOCODE_FALLBACK.filter((item) =>
                    item.label.toLowerCase().includes(val.toLowerCase())
                );
                setSuggestions([...formatted, ...localMatches].slice(0, 5));
            } else {
                throw new Error("HTTP error");
            }
        } catch {
            const matches = LOCAL_GEOCODE_FALLBACK.filter((item) =>
                item.label.toLowerCase().includes(val.toLowerCase())
            );
            setSuggestions(matches);
        } finally {
            setSearching(false);
        }
    };

    const selectSuggestion = (s) => {
        setQuery(s.label.split(",")[0]);
        onChange(s.value);
        setIsOpen(false);
        if (mapRef) {
            mapRef.setView([s.value[1], s.value[0]], 13);
        }
    };

    return (
        <div className="relative flex flex-col gap-1">
            <label className="section-label">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => {
                        if (suggestions.length > 0) setIsOpen(true);
                    }}
                    placeholder={placeholder}
                    className="glass-input pr-8 text-white text-xs"
                />
                {searching && (
                    <div className="absolute right-2.5 top-2.5 w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                )}
            </div>

            {isOpen && suggestions.length > 0 && (
                <ul className="absolute z-[1010] left-0 right-0 top-full mt-1 bg-slate-900/95 border border-white/10 rounded-xl max-h-48 overflow-y-auto shadow-2xl backdrop-blur-md">
                    {suggestions.map((s, i) => (
                        <li
                            key={i}
                            onClick={() => selectSuggestion(s)}
                            className="px-3 py-2 text-[10px] text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                        >
                            {s.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function DualRoutingSelector({ routeMode, setRouteMode, routeData, onRouteResult, mapRef }) {
    const [originCoords, setOriginCoords] = useState(null);
    const [destinationCoords, setDestinationCoords] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCalculate = async () => {
        if (!originCoords || !destinationCoords) {
            setError("Please select both from and to locations from search results.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchRoute(originCoords, destinationCoords, routeMode);
            onRouteResult(data);
        } catch (err) {
            setError("Route calculation failed. Check that the backend is running.");
            console.error("[DualRouting]", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            {/* Section Header */}
            <div>
                <div className="section-label">Dual Routing Engine</div>
                <div className="text-xs text-slate-400">Choose your route strategy</div>
            </div>

            {/* ── Mode Toggle ── */}
            <div className="glass-card p-1 flex gap-1 rounded-xl">
                <button
                    onClick={() => setRouteMode("pulse")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${routeMode === "pulse"
                        ? "bg-emerald-500/25 border border-emerald-400/50 text-emerald-200 shadow-[0_0_20px_rgba(16,245,160,0.3)]"
                        : "text-slate-400 hover:text-white"
                        }`}
                >
                    <span>⚡</span> Pulse
                    <span className="text-[9px] opacity-60 font-normal">Fastest</span>
                </button>
                <button
                    onClick={() => setRouteMode("haven")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${routeMode === "haven"
                        ? "bg-amber-500/25 border border-amber-400/50 text-amber-200 shadow-[0_0_20px_rgba(255,186,8,0.3)]"
                        : "text-slate-400 hover:text-white"
                        }`}
                >
                    <span>🛡️</span> Haven
                    <span className="text-[9px] opacity-60 font-normal">Safest</span>
                </button>
            </div>

            {/* Mode Description */}
            <div className={`text-xs rounded-lg px-3 py-2 border ${routeMode === "pulse"
                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                : "bg-amber-500/5 border-amber-500/20 text-amber-300"
                }`}>
                {routeMode === "pulse"
                    ? "⚡ Fastest path via OSRM. Optimizes for pure speed and distance."
                    : "🛡️ Haven avoids flooded underpasses, smog zones, and high-noise corridors via ORS."}
            </div>

            {/* Nominatim Search Inputs */}
            <div className="flex flex-col gap-2">
                <LocationSearchInput
                    label="From Location"
                    onChange={setOriginCoords}
                    placeholder="Enter origin (e.g. Noida)"
                    mapRef={mapRef}
                />
                <LocationSearchInput
                    label="To Location"
                    onChange={setDestinationCoords}
                    placeholder="Enter destination (e.g. Saket)"
                    mapRef={mapRef}
                />
            </div>

            {/* Calculate Button */}
            <button
                onClick={handleCalculate}
                disabled={isLoading}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${routeMode === "pulse"
                    ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 hover:bg-emerald-500/30 shadow-[0_0_20px_rgba(16,245,160,0.15)]"
                    : "bg-amber-500/20 border border-amber-500/50 text-amber-200 hover:bg-amber-500/30 shadow-[0_0_20px_rgba(255,186,8,0.15)]"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Calculating…
                    </span>
                ) : (
                    `Calculate ${routeMode === "pulse" ? "⚡ Fastest" : "🛡️ Haven"} Route`
                )}
            </button>

            {error && (
                <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    ⚠️ {error}
                </div>
            )}

            {/* Empathy Score */}
            {routeData?.empathyScore && (
                <EmpathyScore score={routeData.empathyScore} mode={routeMode} routeData={routeData} />
            )}
        </div>
    );
}
