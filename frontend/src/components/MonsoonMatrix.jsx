/**
 * MonsoonMatrix.jsx — Flood / Rain Navigation Module
 * Provides:
 *  1. Toggle for flood zone overlay on the map
 *  2. Crowdsource photo upload simulation with bounding-box CV overlay
 *  3. Simulated computer-vision depth estimation result
 */

import React, { useState, useRef } from "react";

const FLOOD_LEGEND = [
    { label: "Dry / Passable", color: "#10F5A0", desc: "< 10 cm" },
    { label: "Knee-Deep Caution", color: "#FFBA08", desc: "30–60 cm" },
    { label: "Danger — Avoid", color: "#FF3B3B", desc: "> 60 cm" },
];

// Simulated CV depth estimation (mock)
function simulateDepthEstimate(filename) {
    const hash = filename.length % 3;
    if (hash === 0) return { depth: "18 cm", category: "Shallow", severity: "green", confidence: 89 };
    if (hash === 1) return { depth: "52 cm", category: "Knee-Deep", severity: "amber", confidence: 74 };
    return { depth: "83 cm", category: "Dangerous", severity: "red", confidence: 67 };
}

export default function MonsoonMatrix({ showFloodZones, setShowFloodZones, spatialData, weatherData }) {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [cvResult, setCvResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setCvResult(null);
    };

    const handleAnalyze = () => {
        if (!uploadedFile) return;
        setIsAnalyzing(true);
        // Simulate ML inference delay
        setTimeout(() => {
            const result = simulateDepthEstimate(uploadedFile.name);
            setCvResult(result);
            setIsAnalyzing(false);
        }, 1800);
    };

    const severityColorMap = { green: "#10F5A0", amber: "#FFBA08", red: "#FF3B3B" };

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <div>
                <div className="section-label">Monsoon Matrix</div>
                <div className="text-xs text-slate-400">Real-time flood depth zone navigation</div>
            </div>

            {/* Weather Context */}
            {weatherData && (
                <div className={`flex items-center gap-2 rounded-lg px-3 py-2 border text-xs ${weatherData.isRaining
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                        : "bg-slate-500/10 border-slate-500/20 text-slate-400"
                    }`}>
                    <span className="text-base">{weatherData.isRaining ? "🌧️" : "🌤️"}</span>
                    <div>
                        <div className="font-medium">{weatherData.condition}</div>
                        <div className="text-[10px] opacity-70">
                            Precip: {weatherData.precipitation ?? 0} mm · Wind: {weatherData.windspeed} km/h
                        </div>
                    </div>
                </div>
            )}

            {/* Overlay Toggle */}
            <div className="flex items-center justify-between glass-card rounded-xl px-4 py-3">
                <div>
                    <div className="text-sm font-medium text-white">Flood Zone Overlay</div>
                    <div className="text-[10px] text-slate-500">
                        {spatialData?.floodZones?.features?.length || 0} active zones
                    </div>
                </div>
                <button
                    onClick={() => setShowFloodZones(!showFloodZones)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 border ${showFloodZones
                            ? "bg-emerald-500/30 border-emerald-500/50"
                            : "bg-white/5 border-white/15"
                        }`}
                >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 ${showFloodZones
                            ? "left-5 bg-emerald-400 shadow-[0_0_8px_rgba(16,245,160,0.7)]"
                            : "left-0.5 bg-slate-500"
                        }`} />
                </button>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-1.5">
                <div className="section-label">Depth Legend</div>
                {FLOOD_LEGEND.map(({ label, color, desc }) => (
                    <div key={label} className="flex items-center gap-3 text-xs">
                        <div className="w-8 h-3 rounded" style={{ background: color + "55", border: `1px solid ${color}` }} />
                        <span className="text-slate-300 flex-1">{label}</span>
                        <span className="text-slate-500 font-mono text-[10px]">{desc}</span>
                    </div>
                ))}
            </div>

            {/* Active Zones List */}
            {showFloodZones && spatialData?.floodZones?.features?.length > 0 && (
                <div className="flex flex-col gap-1.5">
                    <div className="section-label">Active Zones</div>
                    {spatialData.floodZones.features.map((f) => {
                        const depthColor = f.properties.depth === "chest" ? "#FF3B3B" : f.properties.depth === "knee" ? "#FFBA08" : "#10F5A0";
                        return (
                            <div
                                key={f.properties.id}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 border text-xs"
                                style={{ background: depthColor + "08", borderColor: depthColor + "30" }}
                            >
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: depthColor }} />
                                <span className="flex-1 text-slate-300 truncate">{f.properties.name}</span>
                                <span className="capitalize font-semibold text-[10px]" style={{ color: depthColor }}>
                                    {f.properties.depth}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Crowdsource Photo Upload ── */}
            <div className="glass-card rounded-xl p-3 flex flex-col gap-3">
                <div className="section-label">Community Flood Report</div>

                {/* Upload Area */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative border-2 border-dashed border-white/15 rounded-xl p-4 cursor-pointer hover:border-white/30 hover:bg-white/3 transition-all text-center overflow-hidden"
                >
                    {previewUrl ? (
                        <>
                            <img src={previewUrl} alt="Uploaded flood" className="w-full h-28 object-cover rounded-lg opacity-60" />
                            {/* Bounding box CV overlay graphic */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div
                                    className="border-2 w-32 h-20 relative"
                                    style={{ borderColor: "#FFBA08", boxShadow: "0 0 12px rgba(255,186,8,0.4)" }}
                                >
                                    {/* Corner pins */}
                                    {["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map((pos, i) => (
                                        <div key={i} className={`absolute ${pos} w-3 h-3 border-2 rounded-sm border-amber-400`} />
                                    ))}
                                    <div className="absolute -top-5 left-0 text-[9px] font-mono text-amber-400 bg-slate-900/80 px-1 rounded">
                                        DEPTH_DETECT
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-500">
                            <span className="text-2xl">📸</span>
                            <div className="text-xs">Tap to upload flood photo</div>
                            <div className="text-[10px]">CV engine estimates water depth</div>
                        </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                </div>

                {previewUrl && !cvResult && (
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="w-full py-2 rounded-lg text-xs font-semibold bg-amber-500/15 border border-amber-500/35 text-amber-300 hover:bg-amber-500/25 transition-all disabled:opacity-50"
                    >
                        {isAnalyzing ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Analyzing with CV Engine…
                            </span>
                        ) : "🔬 Estimate Depth"}
                    </button>
                )}

                {/* CV Result */}
                {cvResult && (
                    <div
                        className="rounded-lg px-3 py-2.5 border animate-fade-in"
                        style={{
                            background: severityColorMap[cvResult.severity] + "10",
                            borderColor: severityColorMap[cvResult.severity] + "40",
                        }}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold" style={{ color: severityColorMap[cvResult.severity] }}>
                                Estimated Depth: {cvResult.depth}
                            </span>
                            <span className="text-[10px] text-slate-400">
                                {cvResult.confidence}% confidence
                            </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                            Category: <span className="font-medium" style={{ color: severityColorMap[cvResult.severity] }}>
                                {cvResult.category}
                            </span>
                            {" "}— Submitted to community hazard layer ✓
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
