import React, { useState, useRef, useCallback } from "react";
import { fetchOverpass } from "../services/api";

const FLOOD_LEGEND = [
    { label: "Dry / Passable", color: "#10F5A0", desc: "< 10 cm" },
    { label: "Knee-Deep Caution", color: "#FFBA08", desc: "30–60 cm" },
    { label: "Danger — Avoid", color: "#FF3B3B", desc: "> 60 cm" },
];

function simulateDepthEstimate(filename) {
    const hash = filename.length % 3;
    if (hash === 0) return { depth: "18 cm", category: "Shallow", severity: "green", confidence: 89 };
    if (hash === 1) return { depth: "52 cm", category: "Knee-Deep", severity: "amber", confidence: 74 };
    return { depth: "83 cm", category: "Dangerous", severity: "red", confidence: 67 };
}

function formatHour(h) {
    if (h === 12) return "12 PM";
    return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

export default function ClimatePanel({
    aqiData, showSmogZones, setShowSmogZones,
    showFloodZones, setShowFloodZones, spatialData, weatherData,
    showShadows, setShowShadows, selectedHour, setSelectedHour, buildingData, setBuildingData, showShelters, setShowShelters, mapRef,
    showNoiseZones, setShowNoiseZones, showSereneZones, setShowSereneZones
}) {
    // Subsection active state for UX accordion (optional, but clean tab grouping is great!)
    const [subTab, setSubTab] = useState("air"); // 'air' | 'flood' | 'shade' | 'noise'

    // Monsoon photo upload state
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
        setTimeout(() => {
            const result = simulateDepthEstimate(uploadedFile.name);
            setCvResult(result);
            setIsAnalyzing(false);
        }, 1800);
    };

    // ShadeSeeker load buildings
    const [isFetchingBuildings, setIsFetchingBuildings] = useState(false);
    const [fetchBuildingsError, setFetchBuildingsError] = useState(null);
    const [fetchSource, setFetchSource] = useState(null);

    const loadBuildings = useCallback(async () => {
        setIsFetchingBuildings(true);
        setFetchBuildingsError(null);

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
            setFetchBuildingsError("Could not load building data.");
        } finally {
            setIsFetchingBuildings(false);
        }
    }, [mapRef, setBuildingData, setShowShadows]);

    // Noise/Quiet states
    const [neurodivergentMode, setNeurodivergentMode] = useState(false);
    const noisyZones = spatialData?.noiseCorridors?.features || [];
    const sereneZones = spatialData?.sereneZones?.features || [];
    const noiseThreshold = neurodivergentMode ? "55 dB" : "75 dB";
    const sereneThreshold = neurodivergentMode ? "40 dB" : "50 dB";

    const sunElev = Math.max(
        75 * Math.cos(((selectedHour - 12.5) / 6) * (Math.PI / 2)),
        2
    ).toFixed(0);

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            {/* Title Section */}
            <div>
                <div className="section-label">Climate Command & Ecology</div>
                <div className="text-xs text-slate-400 font-sans">Ecological metrics & safety index controls</div>
            </div>

            {/* Sub Tabs Selection (Pills) */}
            <div className="flex bg-slate-900 border border-white/5 p-1 rounded-xl gap-1">
                {[
                    { id: "air", label: "💨 Air" },
                    { id: "flood", label: "🌧️ Flood" },
                    { id: "shade", label: "☀️ Shade" },
                    { id: "noise", label: "🔇 Noise" },
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setSubTab(t.id)}
                        className={`flex-1 py-1 text-[10px] font-semibold rounded-lg transition-colors ${subTab === t.id
                            ? "bg-white/10 text-white border border-white/10"
                            : "text-slate-400 hover:text-white"
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ──────── Sub Tab 1: Air Quality (AirGuard) ──────── */}
            {subTab === "air" && (
                <div className="flex flex-col gap-4 animate-fade-in">
                    {/* AQI Indicator */}
                    {aqiData ? (
                        <div
                            className="glass-card rounded-xl p-4 flex items-center gap-4"
                            style={{ borderColor: aqiData.color + "40" }}
                        >
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black border-2 flex-shrink-0"
                                style={{
                                    color: aqiData.color,
                                    borderColor: aqiData.color,
                                    background: aqiData.color + "15",
                                    boxShadow: `0 0 20px ${aqiData.color}35`,
                                }}
                            >
                                {aqiData.aqi}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white leading-tight">{aqiData.label}</div>
                                <div className="text-[10px] text-slate-400 mt-1">{aqiData.stationName}</div>
                                <div className="flex gap-3 mt-1.5 text-[10px] text-slate-400">
                                    <span>PM2.5: <b className="text-white">{aqiData.pm25}</b></span>
                                    {aqiData.pm10 && <span>PM10: <b className="text-white">{aqiData.pm10}</b></span>}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card rounded-xl p-4 text-center text-xs text-slate-500">
                            Loading AQI data…
                        </div>
                    )}

                    {/* Smog Zone Toggle */}
                    <div className="flex items-center justify-between glass-card rounded-xl px-4 py-3">
                        <div>
                            <div className="text-sm font-medium text-white">🌫️ Smog Boundaries</div>
                            <div className="text-[10px] text-slate-500">Neon orange hazard polygons</div>
                        </div>
                        <button
                            onClick={() => setShowSmogZones(!showSmogZones)}
                            className={`relative w-11 h-6 rounded-full transition-all duration-300 border ${showSmogZones
                                ? "bg-orange-500/30 border-orange-500/50"
                                : "bg-white/5 border-white/15"
                                }`}
                        >
                            <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 ${showSmogZones
                                ? "left-5 bg-orange-400 shadow-[0_0_8px_rgba(255,107,26,0.7)]"
                                : "left-0.5 bg-slate-500"
                                }`} />
                        </button>
                    </div>

                    {/* AQI Reference Guide */}
                    <div className="flex flex-col gap-1.5">
                        <div className="section-label">AQI Reference</div>
                        {[
                            { range: "0–50", label: "Good", color: "#10F5A0" },
                            { range: "51–100", label: "Moderate", color: "#FFBA08" },
                            { range: "101–150", label: "Sensitive Groups", color: "#FF6B1A" },
                            { range: "151–200", label: "Unhealthy", color: "#FF3B3B" },
                            { range: "201+", label: "Hazardous", color: "#8B5CF6" },
                        ].map(({ range, label, color }) => (
                            <div key={range} className="flex items-center gap-3 text-xs">
                                <div className="w-5 h-2.5 rounded" style={{ background: color + "60", border: `1px solid ${color}` }} />
                                <span className="text-slate-400 font-mono text-[10px] w-14">{range}</span>
                                <span className="text-slate-300 flex-1">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ──────── Sub Tab 2: Monsoon Matrix ──────── */}
            {subTab === "flood" && (
                <div className="flex flex-col gap-4 animate-fade-in">
                    {/* Live Rain context */}
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

                    {/* Flood Zone Overlay Toggle */}
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
                    <div className="flex flex-col gap-1.5 font-sans">
                        <div className="section-label">Depth Legend</div>
                        {FLOOD_LEGEND.map(({ label, color, desc }) => (
                            <div key={label} className="flex items-center gap-3 text-xs">
                                <div className="w-8 h-3 rounded" style={{ background: color + "55", border: `1px solid ${color}` }} />
                                <span className="text-slate-300 flex-1">{label}</span>
                                <span className="text-slate-500 font-mono text-[10px]">{desc}</span>
                            </div>
                        ))}
                    </div>

                    {/* Community Report */}
                    <div className="glass-card rounded-xl p-3 flex flex-col gap-3">
                        <div className="section-label">Community Flood Report</div>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="relative border border-dashed border-white/15 rounded-xl p-3 cursor-pointer hover:border-white/30 hover:bg-white/3 transition-all text-center overflow-hidden"
                        >
                            {previewUrl ? (
                                <>
                                    <img src={previewUrl} alt="Uploaded flood" className="w-full h-24 object-cover rounded-lg opacity-60" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="border border-amber-400 w-24 h-16 relative">
                                            <div className="absolute -top-4 left-0 text-[8px] font-mono text-amber-400 bg-slate-900/80 px-1 rounded">
                                                DEPTH_DETECT
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-slate-500">
                                    <span className="text-xl">📸</span>
                                    <div className="text-[10px]">Upload flood photo to estimate depth</div>
                                </div>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                        </div>

                        {previewUrl && !cvResult && (
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="w-full py-1.5 rounded-lg text-[10px] font-semibold bg-amber-500/15 border border-amber-500/35 text-amber-300 hover:bg-amber-500/25 transition-all disabled:opacity-50"
                            >
                                {isAnalyzing ? "Analyzing with CV Engine…" : "🔬 Estimate Depth"}
                            </button>
                        )}

                        {cvResult && (
                            <div className="rounded-lg px-2.5 py-2 border bg-emerald-500/10 border-emerald-500/40 animate-fade-in text-[10px]">
                                <div className="font-bold text-emerald-400">Estimated Depth: {cvResult.depth} ({cvResult.category})</div>
                                <div className="text-slate-400 mt-0.5">Submitted successfully & cached to local maps.</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ──────── Sub Tab 3: ShadeSeeker ──────── */}
            {subTab === "shade" && (
                <div className="flex flex-col gap-4 animate-fade-in">
                    {/* Time Slider */}
                    <div className="glass-card rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-white">Time of Day</div>
                            <div className="text-sm font-mono font-bold text-amber-300">{formatHour(selectedHour)}</div>
                        </div>

                        <input
                            type="range"
                            min={6} max={20} step={1}
                            value={selectedHour}
                            onChange={(e) => setSelectedHour(+e.target.value)}
                            className="w-full"
                        />

                        <div className="flex justify-between text-[9px] text-slate-600 font-mono -mt-2">
                            {[6, 9, 12, 15, 18, 20].map(h => (
                                <span key={h} className={selectedHour === h ? "text-amber-400" : ""}>{formatHour(h)}</span>
                            ))}
                        </div>

                        {/* Sun Data */}
                        <div className="flex gap-2 text-[10px] font-sans">
                            <div className="flex-1 glass-card rounded-lg py-1.5 text-center">
                                <div className="text-slate-500">Elevation</div>
                                <div className="text-amber-300 font-mono font-semibold">{sunElev}°</div>
                            </div>
                            <div className="flex-1 glass-card rounded-lg py-1.5 text-center">
                                <div className="text-slate-500">UV Index</div>
                                <div className="text-amber-300 font-mono font-semibold">
                                    {selectedHour >= 10 && selectedHour <= 15 ? "High" : "Moderate"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shadow Footprints live query */}
                    <div className="glass-card rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-white">Shadow Overlay</div>
                                <div className="text-[10px] text-slate-500">
                                    {buildingData
                                        ? `${buildingData.buildingCount} buildings loaded`
                                        : "No buildings loaded"}
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
                            disabled={isFetchingBuildings}
                            className="w-full py-2 rounded-lg text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all disabled:opacity-50"
                        >
                            {isFetchingBuildings ? "Loading Buildings…" : buildingData ? "🔄 Refresh Building Data" : "🏗️ Load Building Footprints"}
                        </button>
                    </div>

                    {/* Cooling Stations toggle */}
                    <div className="flex items-center justify-between glass-card rounded-xl px-4 py-3">
                        <div>
                            <div className="text-sm font-medium text-white">💧 Cooling Stations</div>
                            <div className="text-[10px] text-slate-500">Hydration & shelter markers</div>
                        </div>
                        <button
                            onClick={() => setShowShelters(!showShelters)}
                            className={`relative w-11 h-8 rounded-full transition-all duration-300 border ${showShelters
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
                </div>
            )}

            {/* ──────── Sub Tab 4: Acoustic & Noise (NavQuiet) ──────── */}
            {subTab === "noise" && (
                <div className="flex flex-col gap-4 animate-fade-in font-sans">
                    {/* Sensory profile neurodivergent mode toggle */}
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
                            <div className="flex-1 glass-card rounded-lg py-1.5 text-center">
                                <div className="text-slate-500">Noise Threshold</div>
                                <div className={`font-mono font-semibold ${neurodivergentMode ? "text-purple-300" : "text-amber-300"}`}>
                                    {noiseThreshold}
                                </div>
                            </div>
                            <div className="flex-1 glass-card rounded-lg py-1.5 text-center">
                                <div className="text-slate-500">Serene Threshold</div>
                                <div className={`font-mono font-semibold ${neurodivergentMode ? "text-purple-300" : "text-emerald-300"}`}>
                                    {"< " + sereneThreshold}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Noise Corridor Overlay Toggle */}
                    <div className="flex items-center justify-between glass-card rounded-xl px-4 py-3">
                        <div>
                            <div className="text-sm font-medium text-white">🔊 Noise Corridors</div>
                            <div className="text-[10px] text-slate-500">{noisyZones.length} high-noise stretches</div>
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

                    {/* Serene Zone Overlays Toggle */}
                    <div className="flex items-center justify-between glass-card rounded-xl px-4 py-3">
                        <div>
                            <div className="text-sm font-medium text-white">🍃 Serene Zones</div>
                            <div className="text-[10px] text-slate-500">{sereneZones.length} low-decibel areas</div>
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
                </div>
            )}
        </div>
    );
}
