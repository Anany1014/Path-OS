/**
 * App.jsx — Path OS Root Application
 * Manages global state and orchestrates all feature modules.
 *
 * State:
 *  - routeMode: 'pulse' | 'haven'
 *  - activeTab: which control panel tab is open
 *  - routeData: GeoJSON route + empathy score from backend
 *  - weatherData / aqiData: live environmental context
 *  - spatialData: mock PostGIS flood/noise/shelter data
 *  - selectedHour: time-slider value for ShadeSeeker (0–23)
 *  - isOnline: navigator.onLine status (AirGuard trigger)
 */

import React, { useState, useEffect, useCallback } from "react";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { fetchSpatialData, fetchWeather, fetchAQI } from "./services/api";
import MapCanvas from "./components/MapCanvas";
import ControlPanel from "./components/ControlPanel";
import AlertTicker from "./components/AlertTicker";
import AirGuardOffline from "./components/AirGuard";
import Login from "./components/Login";

// Default map center: Delhi NCR
const DEFAULT_CENTER = { lat: 28.52, lng: 77.20 };

export default function App() {
    const isOnline = useOnlineStatus();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState("");

    // ─── Global Route State ────────────────────────────────────────────────
    const [routeMode, setRouteMode] = useState("pulse"); // 'pulse' | 'haven'
    const [routeData, setRouteData] = useState(null);    // { geojson, empathyScore, durationMin, distanceKm }
    const [activeTab, setActiveTab] = useState("route"); // 'route' | 'climate'

    // ─── Environmental Data ────────────────────────────────────────────────
    const [weatherData, setWeatherData] = useState(null);
    const [aqiData, setAqiData] = useState(null);
    const [spatialData, setSpatialData] = useState(null);

    // ─── Overlay Toggles ──────────────────────────────────────────────────
    const [showFloodZones, setShowFloodZones] = useState(true);
    const [showNoiseZones, setShowNoiseZones] = useState(false);
    const [showSereneZones, setShowSereneZones] = useState(false);
    const [showSmogZones, setShowSmogZones] = useState(false);
    const [showShelters, setShowShelters] = useState(true);
    const [showShadows, setShowShadows] = useState(false);

    // ─── ShadeSeeker Time Slider ──────────────────────────────────────────
    const [selectedHour, setSelectedHour] = useState(12); // noon default
    const [buildingData, setBuildingData] = useState(null);

    // ─── Map Ref (for programmatic panning) ──────────────────────────────
    const [mapRef, setMapRef] = useState(null);

    // ─── Load spatial + environmental data on mount ───────────────────────
    useEffect(() => {
        // Load mock spatial layer (flood zones, noise, shelters)
        fetchSpatialData()
            .then(setSpatialData)
            .catch((e) => console.warn("[App] Spatial data fetch failed:", e.message));

        // Load weather for default center (Delhi)
        fetchWeather(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng)
            .then(setWeatherData)
            .catch((e) => console.warn("[App] Weather fetch failed:", e.message));

        // Load AQI for default center
        fetchAQI(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng)
            .then(setAqiData)
            .catch((e) => console.warn("[App] AQI fetch failed:", e.message));
    }, []);

    // ─── Route callback (passed down to DualRoutingSelector) ─────────────
    const handleRouteResult = useCallback((data) => {
        setRouteData(data);
    }, []);

    // ─── If not logged in: render Login screen ───────────────────────────
    if (!isLoggedIn) {
        return <Login onLogin={(name) => { setIsLoggedIn(true); setUser(name); }} />;
    }

    // ─── If offline: render AirGuard compass fullscreen ─────────────────
    if (!isOnline) {
        return (
            <AirGuardOffline
                isOffline={true}
                shelters={spatialData?.emergencyShelters || []}
            />
        );
    }

    // ─── Online: full Crisis Command Center UI ────────────────────────────
    return (
        <div className="relative w-full h-screen overflow-hidden bg-slate-950">

            {/* ── Map Canvas (full viewport background) ── */}
            <MapCanvas
                center={DEFAULT_CENTER}
                spatialData={spatialData}
                routeData={routeData}
                routeMode={routeMode}
                showFloodZones={showFloodZones}
                showNoiseZones={showNoiseZones}
                showSereneZones={showSereneZones}
                showSmogZones={showSmogZones}
                showShelters={showShelters}
                showShadows={showShadows}
                buildingData={buildingData}
                selectedHour={selectedHour}
                onMapReady={setMapRef}
            />

            {/* ── Top Header Bar ── */}
            <header className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-4 py-3 pointer-events-none">
                {/* Left: Online indicator (sitting nicely above the left sidebar) */}
                <div className="glass-panel rounded-2xl px-4 py-2 pointer-events-auto flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-slate-300">Live</span>
                    <span className="text-xs text-slate-500 font-mono">
                        {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                </div>

                {/* Center: Weather + AQI strip */}
                <div className="glass-panel rounded-2xl px-4 py-2 pointer-events-auto flex items-center gap-5">
                    {weatherData && (
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400">🌡️</span>
                            <span className="text-white font-medium">{weatherData.temp}°C</span>
                            <span className="text-slate-500">·</span>
                            <span className={weatherData.isRaining ? "text-blue-400" : "text-slate-400"}>
                                {weatherData.isRaining ? "🌧️ " : ""}
                                {weatherData.condition}
                            </span>
                        </div>
                    )}
                    {aqiData && (
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400">💨</span>
                            <span className="font-mono font-medium" style={{ color: aqiData.color }}>
                                AQI {aqiData.aqi}
                            </span>
                            <span className="text-slate-500 text-[10px]">{aqiData.label}</span>
                        </div>
                    )}
                    {!weatherData && !aqiData && (
                        <span className="text-slate-500 text-xs">Loading environment data…</span>
                    )}
                </div>

                {/* Right: Path OS Logo */}
                <div className="glass-panel rounded-2xl px-4 py-2 pointer-events-auto flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white leading-tight">Path OS</div>
                        <div className="text-[10px] text-slate-400 leading-tight">Climate Navigation</div>
                    </div>
                </div>
            </header>

            {/* ── Control Panel (floating right sidebar) ── */}
            <ControlPanel
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                routeMode={routeMode}
                setRouteMode={setRouteMode}
                routeData={routeData}
                onRouteResult={handleRouteResult}
                weatherData={weatherData}
                aqiData={aqiData}
                spatialData={spatialData}
                showFloodZones={showFloodZones}
                setShowFloodZones={setShowFloodZones}
                showNoiseZones={showNoiseZones}
                setShowNoiseZones={setShowNoiseZones}
                showSereneZones={showSereneZones}
                setShowSereneZones={setShowSereneZones}
                showSmogZones={showSmogZones}
                setShowSmogZones={setShowSmogZones}
                showShelters={showShelters}
                setShowShelters={setShowShelters}
                showShadows={showShadows}
                setShowShadows={setShowShadows}
                selectedHour={selectedHour}
                setSelectedHour={setSelectedHour}
                buildingData={buildingData}
                setBuildingData={setBuildingData}
                mapRef={mapRef}
            />

            {/* ── Alert Ticker (bottom bar) ── */}
            <AlertTicker weatherData={weatherData} aqiData={aqiData} />
        </div>
    );
}
