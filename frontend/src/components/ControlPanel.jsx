/**
 * ControlPanel.jsx — Glassmorphic Floating Side Panel
 * Tabbed navigation shell for all 5 Path OS feature modules.
 * Floats over the map via absolute positioning.
 */

import React from "react";
import DualRoutingSelector from "./DualRoutingSelector";
import ClimatePanel from "./ClimatePanel";

const TABS = [
    { id: "route", icon: "🗺️", label: "Route" },
    { id: "climate", icon: "🌡️", label: "Climate" },
];

export default function ControlPanel({
    activeTab, setActiveTab,
    routeMode, setRouteMode,
    routeData, onRouteResult,
    weatherData, aqiData, spatialData,
    showFloodZones, setShowFloodZones,
    showNoiseZones, setShowNoiseZones,
    showSereneZones, setShowSereneZones,
    showSmogZones, setShowSmogZones,
    showShelters, setShowShelters,
    showShadows, setShowShadows,
    selectedHour, setSelectedHour,
    buildingData, setBuildingData,
    mapRef,
    user, onLogout,
}) {
    return (
        <aside
            className="absolute top-4 left-4 bottom-16 z-[1000] w-80 flex flex-col gap-2 animate-slide-in"
            style={{ maxHeight: "calc(100vh - 96px)" }}
        >
            {/* ── Tab Navigation ── */}
            <nav className="glass-panel rounded-2xl p-1.5 flex gap-1 flex-shrink-0">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex flex-col items-center py-1.5 rounded-xl transition-all duration-200 text-[9px] font-medium gap-0.5 ${activeTab === tab.id
                            ? "bg-white/15 text-white border border-white/20"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <span className="text-base leading-none">{tab.icon}</span>
                        <span className="leading-none">{tab.label}</span>
                    </button>
                ))}
            </nav>

            {/* ── Active Panel Content ── */}
            <div className="glass-panel rounded-2xl flex-1 overflow-y-auto p-4 animate-fade-in">
                {activeTab === "route" && (
                    <DualRoutingSelector
                        routeMode={routeMode}
                        setRouteMode={setRouteMode}
                        routeData={routeData}
                        onRouteResult={onRouteResult}
                        mapRef={mapRef}
                    />
                )}
                {activeTab === "climate" && (
                    <ClimatePanel
                        aqiData={aqiData}
                        showSmogZones={showSmogZones}
                        setShowSmogZones={setShowSmogZones}
                        showFloodZones={showFloodZones}
                        setShowFloodZones={setShowFloodZones}
                        spatialData={spatialData}
                        weatherData={weatherData}
                        showShadows={showShadows}
                        setShowShadows={setShowShadows}
                        selectedHour={selectedHour}
                        setSelectedHour={setSelectedHour}
                        buildingData={buildingData}
                        setBuildingData={setBuildingData}
                        showShelters={showShelters}
                        setShowShelters={setShowShelters}
                        mapRef={mapRef}
                        showNoiseZones={showNoiseZones}
                        setShowNoiseZones={setShowNoiseZones}
                        showSereneZones={showSereneZones}
                        setShowSereneZones={setShowSereneZones}
                    />
                )}
            </div>

            {/* ── Profile & Logout Footer ── */}
            <div className="glass-panel rounded-2xl p-3 flex items-center justify-between mt-auto flex-shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-xs">
                        {user ? user[0].toUpperCase() : "OP"}
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[11px] font-semibold text-slate-200">{user || "Operator"}</span>
                        <span className="text-[9px] text-slate-400">System Command</span>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 active:scale-95 transition-all duration-200"
                >
                    Logout
                </button>
            </div>
        </aside>
    );
}
