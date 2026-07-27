/**
 * NavQuiet.jsx — Sensory Routing / Noise Corridor Module
 * Provides:
 *  1. Toggle for noise corridor polylines (red/amber) on the map
 *  2. Toggle for serene zone polygon overlays (emerald)
 *  3. Sensory Profile toggle for neurodivergent mode (tighter thresholds)
 *  4. Summary of active zones
 */

import React, { useState } from "react";

export default function NavQuiet({
    showNoiseZones, setShowNoiseZones,
    showSereneZones, setShowSereneZones,
    spatialData,
}) {
    const [neurodivergentMode, setNeurodivergentMode] = useState(false);

    const noisyZones = spatialData?.noiseCorridors?.features || [];
    const sereneZones = spatialData?.sereneZones?.features || [];

    // In neurodivergent mode, show stricter threshold label
    const noiseThreshold = neurodivergentMode ? "55 dB" : "75 dB";
    const sereneThreshold = neurodivergentMode ? "40 dB" : "50 dB";

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <div>
                <div className="section-label">NavQuiet</div>
                <div className="text-xs text-slate-400">Sensory-friendly routing corridors</div>
            </div>

            {/* Sensory Profile Card */}
            <div className="glass-card rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-semibold text-white">Sensory Profile</div>
                        <div className="text-[10px] text-slate-500">
                            {neurodivergentMode ? "🧠 Neurodivergent — Extra Quiet" : "Standard sensitivity"}
                        </div>
                    </div>
                    <button
                        onClick={() => setNeurodivergentMode(!neurodivergentMode)}
                        className={`relative w-11 h-6 rounded-full transition-all duration-300 border ${neurodivergentMode
                                ? "bg-purple-500/30 border-purple-500/50"
                                : "bg-white/5 border-white/15"
                            }`}
                    >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 ${neurodivergentMode
                                ? "left-5 bg-purple-400 shadow-[0_0_8px_rgba(139,92,246,0.7)]"
                                : "left-0.5 bg-slate-500"
                            }`} />
                    </button>
                </div>

                <div className="flex gap-2 text-[10px]">
                    <div className="flex-1 glass-card rounded-lg px-2 py-1.5 text-center">
                        <div className="text-slate-500">Noise Threshold</div>
                        <div className={`font-mono font-semibold ${neurodivergentMode ? "text-purple-300" : "text-amber-300"}`}>
                            {noiseThreshold}
                        </div>
                    </div>
                    <div className="flex-1 glass-card rounded-lg px-2 py-1.5 text-center">
                        <div className="text-slate-500">Serene Threshold</div>
                        <div className={`font-mono font-semibold ${neurodivergentMode ? "text-purple-300" : "text-emerald-300"}`}>
                            {"< " + sereneThreshold}
                        </div>
                    </div>
                </div>
            </div>

            {/* Noise Zone Toggle */}
            <div className="flex items-center justify-between glass-card rounded-xl px-4 py-3">
                <div>
                    <div className="text-sm font-medium text-white">🔊 Noise Corridors</div>
                    <div className="text-[10px] text-slate-500">
                        {noisyZones.length} high-noise stretch{noisyZones.length !== 1 ? "es" : ""}
                    </div>
                </div>
                <button
                    onClick={() => setShowNoiseZones(!showNoiseZones)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 border ${showNoiseZones
                            ? "bg-red-500/30 border-red-500/50"
                            : "bg-white/5 border-white/15"
                        }`}
                >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 ${showNoiseZones
                            ? "left-5 bg-red-400 shadow-[0_0_8px_rgba(255,59,59,0.7)]"
                            : "left-0.5 bg-slate-500"
                        }`} />
                </button>
            </div>

            {/* Serene Zone Toggle */}
            <div className="flex items-center justify-between glass-card rounded-xl px-4 py-3">
                <div>
                    <div className="text-sm font-medium text-white">🍃 Serene Zones</div>
                    <div className="text-[10px] text-slate-500">
                        {sereneZones.length} low-decibel area{sereneZones.length !== 1 ? "s" : ""}
                    </div>
                </div>
                <button
                    onClick={() => setShowSereneZones(!showSereneZones)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 border ${showSereneZones
                            ? "bg-emerald-500/30 border-emerald-500/50"
                            : "bg-white/5 border-white/15"
                        }`}
                >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 ${showSereneZones
                            ? "left-5 bg-emerald-400 shadow-[0_0_8px_rgba(16,245,160,0.7)]"
                            : "left-0.5 bg-slate-500"
                        }`} />
                </button>
            </div>

            {/* Noise Zone Details */}
            {noisyZones.length > 0 && (
                <div className="flex flex-col gap-1.5">
                    <div className="section-label">Avoid These Corridors</div>
                    {noisyZones.map((f) => {
                        const isRed = f.properties.severity === "red";
                        const color = isRed ? "#FF3B3B" : "#FFBA08";
                        return (
                            <div
                                key={f.properties.id}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 border text-xs"
                                style={{ background: color + "08", borderColor: color + "30" }}
                            >
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                                <span className="flex-1 text-slate-300 truncate">{f.properties.name}</span>
                                <span className="font-mono text-[10px]" style={{ color }}>
                                    {f.properties.decibels} dB
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Serene Zone Details */}
            {sereneZones.length > 0 && (
                <div className="flex flex-col gap-1.5">
                    <div className="section-label">Peaceful Alternatives</div>
                    {sereneZones.map((f) => (
                        <div
                            key={f.properties.id}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 border text-xs bg-emerald-500/5 border-emerald-500/20"
                        >
                            <span>🍃</span>
                            <span className="flex-1 text-slate-300 truncate">{f.properties.name}</span>
                            <span className="font-mono text-[10px] text-emerald-400">
                                {f.properties.decibels} dB
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Decibel Reference */}
            <div className="flex flex-col gap-1 glass-card rounded-xl p-3">
                <div className="section-label">Decibel Reference</div>
                {[
                    { label: "Library", db: "30–40", color: "#10F5A0" },
                    { label: "Quiet park", db: "40–50", color: "#34D399" },
                    { label: "Normal traffic", db: "65–75", color: "#FFBA08" },
                    { label: "Construction", db: "85–95", color: "#FF6B1A" },
                    { label: "Concert / Jet", db: "100+", color: "#FF3B3B" },
                ].map(({ label, db, color }) => (
                    <div key={label} className="flex items-center gap-2 text-[10px]">
                        <div className="w-4 h-1.5 rounded" style={{ background: color + "60" }} />
                        <span className="text-slate-400 flex-1">{label}</span>
                        <span className="font-mono" style={{ color }}>{db} dB</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
