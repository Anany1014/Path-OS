/**
 * EmpathyScore.jsx
 * Displays the Route Resilience Index — animated metrics card showing
 * how "safe" and "comfortable" the computed route is.
 */

import React from "react";

function MetricPill({ label, value, color }) {
    return (
        <div
            className="flex items-center justify-between rounded-lg px-3 py-2 border"
            style={{
                background: color + "15",
                borderColor: color + "35",
            }}
        >
            <span className="text-xs text-slate-400">{label}</span>
            <span className="text-xs font-semibold" style={{ color }}>{value}</span>
        </div>
    );
}

export default function EmpathyScore({ score, mode, routeData }) {
    if (!score) return null;

    const scoreColor =
        score.score >= 80 ? "#10F5A0" :
            score.score >= 50 ? "#FFBA08" : "#FF3B3B";

    return (
        <div className="glass-card p-4 rounded-xl flex flex-col gap-3 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-xs font-bold text-white">Resilience Index</div>
                    <div className="text-[10px] text-slate-400">{score.label}</div>
                </div>
                {/* Score Ring */}
                <div
                    className="w-12 h-12 rounded-full flex items-center justify-center border-2 text-lg font-bold"
                    style={{
                        borderColor: scoreColor,
                        color: scoreColor,
                        background: scoreColor + "10",
                        boxShadow: `0 0 16px ${scoreColor}40`,
                    }}
                >
                    {score.score}
                </div>
            </div>

            {/* Route Summary */}
            {routeData && (
                <div className="flex gap-2 text-xs">
                    <div className="flex-1 glass-card rounded-lg p-2 text-center">
                        <div className="text-slate-400 text-[10px]">Distance</div>
                        <div className="font-semibold text-white">{routeData.distanceKm} km</div>
                    </div>
                    <div className="flex-1 glass-card rounded-lg p-2 text-center">
                        <div className="text-slate-400 text-[10px]">Time</div>
                        <div className="font-semibold text-white">{routeData.durationMin} min</div>
                    </div>
                    <div className="flex-1 glass-card rounded-lg p-2 text-center">
                        <div className="text-slate-400 text-[10px]">Mode</div>
                        <div className="font-semibold" style={{ color: mode === "pulse" ? "#10F5A0" : "#FFBA08" }}>
                            {mode === "pulse" ? "⚡" : "🛡️"} {mode}
                        </div>
                    </div>
                </div>
            )}

            {/* Metrics Grid */}
            <div className="flex flex-col gap-1.5">
                <MetricPill label="🌳 Shade Coverage" value={score.shaded} color="#10F5A0" />
                <MetricPill label="🌊 Flooded Zones" value={`${score.floodedZones} avoided`} color={score.floodedZones === 0 ? "#10F5A0" : "#FF3B3B"} />
                <MetricPill label="💨 AQI Exposure" value={score.aqiExposure} color={score.aqiExposure === "Low" ? "#10F5A0" : "#FFBA08"} />
                <MetricPill label="🔊 Noise Level" value={score.noiseLevel} color={score.noiseLevel === "Low" ? "#10F5A0" : "#FFBA08"} />
            </div>
        </div>
    );
}
