/**
 * AirGuard.jsx — Air Quality Navigation + Offline Compass
 *
 * DUAL RENDER MODE:
 *  1. isOffline=false (Online):  AQI dashboard panel, smog overlay toggle,
 *                                 metro suggestion, and shelter list.
 *  2. isOffline=true  (Offline): Full-screen dark compass UI using
 *                                 DeviceOrientationEvent API (magnetometer).
 *                                 Points to nearest cached shelter.
 *
 * The offline/online branch is driven by App.jsx's useOnlineStatus hook.
 * When the browser loses connectivity, App swaps the entire layout to
 * the offline compass view.
 */

import React, { useState, useEffect, useRef } from "react";
import localforage from "localforage";

// ─── Bearing calculation (great-circle) ──────────────────────────────────────
function calcBearing(fromLat, fromLon, toLat, toLon) {
    const toRad = (d) => (d * Math.PI) / 180;
    const dLon = toRad(toLon - fromLon);
    const lat1 = toRad(fromLat);
    const lat2 = toRad(toLat);
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const brng = (Math.atan2(y, x) * 180) / Math.PI;
    return (brng + 360) % 360;
}

// ─── Distance (Haversine, km) ─────────────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ──────────────────────────────────────────────────────────────────────────────
// OFFLINE COMPASS COMPONENT
// ──────────────────────────────────────────────────────────────────────────────
function OfflineCompass({ shelters }) {
    const [compassHeading, setCompassHeading] = useState(0);
    const [deviceBearing, setDeviceBearing] = useState(0);
    const [userPos, setUserPos] = useState(null);
    const [nearestShelter, setNearestShelter] = useState(null);
    const [permissionError, setPermissionError] = useState(null);
    const [cachedShelters, setCachedShelters] = useState(shelters);
    const needleRef = useRef(null);

    // ── Cache shelters in localforage on mount ────────────────────────────────
    useEffect(() => {
        if (shelters?.length > 0) {
            localforage.setItem("path-os-shelters", shelters).catch(() => { });
        } else {
            localforage.getItem("path-os-shelters").then((cached) => {
                if (cached) setCachedShelters(cached);
            });
        }
    }, [shelters]);

    // ── Get current GPS position ──────────────────────────────────────────────
    useEffect(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserPos({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => {
                // Fallback to Delhi CP if geolocation denied
                setUserPos({ lat: 28.6315, lon: 77.2167 });
            },
            { enableHighAccuracy: true }
        );
    }, []);

    // ── Find nearest shelter ──────────────────────────────────────────────────
    useEffect(() => {
        if (!userPos || !cachedShelters?.length) return;
        const nearest = cachedShelters.reduce((best, s) => {
            const d = haversine(userPos.lat, userPos.lon, s.lat, s.lon);
            return !best || d < best.distance ? { ...s, distance: d } : best;
        }, null);
        setNearestShelter(nearest);
    }, [userPos, cachedShelters]);

    // ── Device orientation (magnetometer compass) ─────────────────────────────
    useEffect(() => {
        async function requestPermission() {
            if (typeof DeviceOrientationEvent?.requestPermission === "function") {
                try {
                    const perm = await DeviceOrientationEvent.requestPermission();
                    if (perm !== "granted") {
                        setPermissionError("Compass permission denied. Using simulated heading.");
                        simulateCompass();
                        return;
                    }
                } catch {
                    setPermissionError("Could not request orientation permission.");
                    simulateCompass();
                    return;
                }
            }
            window.addEventListener("deviceorientationabsolute", handleOrientation, true);
            window.addEventListener("deviceorientation", handleOrientation, true);
        }

        function handleOrientation(e) {
            const heading = e.webkitCompassHeading ?? e.alpha ?? 0;
            setDeviceBearing(heading);
        }

        function simulateCompass() {
            // Simulate a slowly rotating compass for desktop testing
            let angle = 0;
            const interval = setInterval(() => {
                angle = (angle + 1.2) % 360;
                setDeviceBearing(angle);
            }, 50);
            return () => clearInterval(interval);
        }

        requestPermission();
        return () => {
            window.removeEventListener("deviceorientationabsolute", handleOrientation, true);
            window.removeEventListener("deviceorientation", handleOrientation, true);
        };
    }, []);

    // ── Compute needle rotation toward nearest shelter ────────────────────────
    useEffect(() => {
        if (!nearestShelter || !userPos) return;
        const bearing = calcBearing(
            userPos.lat, userPos.lon,
            nearestShelter.lat, nearestShelter.lon
        );
        // Needle should point toward shelter relative to device heading
        const rotation = (bearing - deviceBearing + 360) % 360;
        setCompassHeading(rotation);
    }, [nearestShelter, userPos, deviceBearing]);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center gap-6 animate-fade-in">
            {/* Background grid pattern */}
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: "radial-gradient(circle, rgba(16,245,160,0.4) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                }}
            />

            {/* Offline banner */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-center py-3 bg-red-900/30 border-b border-red-500/30">
                <div className="flex items-center gap-2 text-sm text-red-300">
                    <div className="w-2 h-2 rounded-full bg-red-400 pulse-red" />
                    <span className="font-semibold">OFFLINE MODE — AirGuard Compass Active</span>
                </div>
            </div>

            {/* Compass Rose */}
            <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Outer ring */}
                <div
                    className="absolute inset-0 rounded-full border-2 border-emerald-500/20"
                    style={{ boxShadow: "0 0 40px rgba(16,245,160,0.08), inset 0 0 40px rgba(16,245,160,0.03)" }}
                />
                {/* Mid ring */}
                <div className="absolute inset-8 rounded-full border border-white/5" />
                {/* Inner ring */}
                <div className="absolute inset-16 rounded-full border border-white/5" />

                {/* Cardinal directions */}
                {[
                    { label: "N", angle: 0, top: "8px", left: "50%", transform: "translateX(-50%)" },
                    { label: "S", angle: 180, bottom: "8px", left: "50%", transform: "translateX(-50%)" },
                    { label: "E", angle: 90, right: "8px", top: "50%", transform: "translateY(-50%)" },
                    { label: "W", angle: 270, left: "8px", top: "50%", transform: "translateY(-50%)" },
                ].map(({ label, ...style }) => (
                    <span
                        key={label}
                        className="absolute text-xs font-mono font-bold text-white/30"
                        style={{ position: "absolute", ...style }}
                    >
                        {label}
                    </span>
                ))}

                {/* Compass Needle */}
                <div
                    ref={needleRef}
                    className="absolute w-full h-full flex items-center justify-center"
                    style={{ transform: `rotate(${compassHeading}deg)`, transition: "transform 0.3s ease-out" }}
                >
                    {/* North point (neon red) */}
                    <div
                        className="absolute"
                        style={{
                            width: 0, height: 0,
                            borderLeft: "8px solid transparent",
                            borderRight: "8px solid transparent",
                            borderBottom: "72px solid #FF3B3B",
                            top: "20px",
                            filter: "drop-shadow(0 0 8px #FF3B3B)",
                        }}
                    />
                    {/* South point (slate) */}
                    <div
                        className="absolute"
                        style={{
                            width: 0, height: 0,
                            borderLeft: "8px solid transparent",
                            borderRight: "8px solid transparent",
                            borderTop: "72px solid #475569",
                            bottom: "20px",
                        }}
                    />
                    {/* Center dot */}
                    <div className="absolute w-4 h-4 rounded-full bg-slate-700 border-2 border-emerald-500/60 z-10" />
                </div>

                {/* Target dot for nearest shelter */}
                {nearestShelter && (
                    <div
                        className="absolute w-3 h-3 rounded-full bg-emerald-400"
                        style={{
                            top: "50%",
                            left: "50%",
                            transform: `translate(-50%, -50%) rotate(${compassHeading}deg) translateY(-90px)`,
                            boxShadow: "0 0 12px rgba(16,245,160,0.8)",
                            transition: "transform 0.3s ease-out",
                        }}
                    />
                )}
            </div>

            {/* Nearest Shelter Info */}
            {nearestShelter ? (
                <div className="glass-panel rounded-2xl px-6 py-4 text-center flex flex-col items-center gap-2 max-w-xs">
                    <div className="text-2xl">🏥</div>
                    <div className="text-sm font-bold text-white">{nearestShelter.name}</div>
                    <div className="text-xs text-emerald-400 capitalize">{nearestShelter.type}</div>
                    <div className="text-xs text-slate-400">
                        ~{nearestShelter.distance?.toFixed(1)} km away · Bearing {compassHeading.toFixed(0)}°
                    </div>
                    {nearestShelter.phone && (
                        <a href={`tel:${nearestShelter.phone}`} className="text-xs text-blue-400 underline">
                            📞 {nearestShelter.phone}
                        </a>
                    )}
                </div>
            ) : (
                <div className="glass-panel rounded-2xl px-6 py-4 text-center text-xs text-slate-400">
                    Locating nearest shelter…
                </div>
            )}

            {/* All Cached Shelters */}
            {cachedShelters?.length > 0 && (
                <div className="glass-panel rounded-xl px-4 py-3 max-w-xs w-full">
                    <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-widest">Cached Shelters</div>
                    {cachedShelters.slice(0, 3).map((s) => (
                        <div key={s.id} className="flex items-center gap-2 py-1 text-xs">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-slate-300 truncate">{s.name}</span>
                        </div>
                    ))}
                </div>
            )}

            {permissionError && (
                <div className="text-xs text-amber-400 text-center max-w-xs opacity-70">{permissionError}</div>
            )}

            {/* Restore connection instruction */}
            <div className="text-[10px] text-slate-600 text-center">
                Restore internet connection to return to full navigation mode
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// ONLINE AQI PANEL COMPONENT
// ──────────────────────────────────────────────────────────────────────────────
function OnlineAQIPanel({ aqiData, showSmogZones, setShowSmogZones, shelters }) {
    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <div>
                <div className="section-label">AirGuard</div>
                <div className="text-xs text-slate-400">Air quality & visibility protection</div>
            </div>

            {/* AQI Badge */}
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
                        <div className="text-sm font-bold text-white">{aqiData.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{aqiData.stationName}</div>
                        <div className="flex gap-3 mt-1 text-[10px] text-slate-400">
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

            {/* Metro Suggestion Alert */}
            {aqiData?.suggestMetro && (
                <div className="flex items-start gap-2 bg-orange-500/10 border border-orange-500/30 rounded-xl px-3 py-3 text-xs">
                    <span className="text-lg flex-shrink-0">🚇</span>
                    <div>
                        <div className="font-semibold text-orange-300">Metro Route Suggested</div>
                        <div className="text-slate-400 mt-0.5">
                            AQI exceeds 150. Surface roads are unhealthy. Consider underground transit to reduce exposure.
                        </div>
                    </div>
                </div>
            )}

            {/* Smog Zone Overlay */}
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

            {/* Air Quality Guide */}
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
                        <span className="text-slate-400 font-mono text-[10px] w-16">{range}</span>
                        <span className="text-slate-300 flex-1">{label}</span>
                    </div>
                ))}
            </div>

            {/* Emergency Shelters preview */}
            {shelters?.length > 0 && (
                <div className="flex flex-col gap-1.5">
                    <div className="section-label">Nearest Shelters</div>
                    {shelters.slice(0, 3).map((s) => (
                        <div key={s.id} className="flex items-center gap-2 text-xs glass-card rounded-lg px-3 py-2">
                            <span className="text-emerald-400">🏥</span>
                            <span className="flex-1 text-slate-300 truncate">{s.name}</span>
                            <span className="text-slate-500 capitalize text-[10px]">{s.type}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// EXPORTED COMPONENT — branches on isOffline
// ──────────────────────────────────────────────────────────────────────────────
export default function AirGuard({ isOffline, aqiData, showSmogZones, setShowSmogZones, shelters }) {
    if (isOffline) {
        return <OfflineCompass shelters={shelters} />;
    }
    return (
        <OnlineAQIPanel
            aqiData={aqiData}
            showSmogZones={showSmogZones}
            setShowSmogZones={setShowSmogZones}
            shelters={shelters}
        />
    );
}
