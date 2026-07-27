/**
 * AlertTicker.jsx — Live Crisis Alert Streaming Ticker
 * Renders a horizontally-scrolling bottom banner with:
 *  • Simulated rotating crisis messages
 *  • Live precipitation data from weatherData prop
 *  • Live AQI reading from aqiData prop
 *  • Neon red pulse animation on severe alerts
 */

import React, { useState, useEffect } from "react";

// Rotating pool of simulated crisis + municipal alerts
const STATIC_ALERTS = [
    { type: "severe", text: "🔴 NDMA ALERT: Flash flood warning issued for Yamuna floodplain — avoid Ring Road near Geeta Colony" },
    { type: "warning", text: "🟡 CAUTION: Minto Bridge underpass reporting standing water depth >60cm — rerouting recommended for two-wheelers" },
    { type: "info", text: "🔵 DMRC Update: Blue Line running at 85% capacity. Metro preferred during peak smog hours." },
    { type: "severe", text: "🔴 SEVERE: Visibility below 200m on NH-48 near Gurugram toll due to dense fog — avoid highway travel" },
    { type: "warning", text: "🟡 AQI WARNING: Anand Vihar AQI at 287 (Very Unhealthy). Sensitive groups advised to stay indoors." },
    { type: "info", text: "🟢 SHELTER: NDMC Cooling Centre at Connaught Place Palika Kiosk B2 now open 8am–10pm. Free water distribution." },
    { type: "severe", text: "🔴 ROAD CLOSED: Rohini Sector 22 underpass completely submerged — alternate via Pitampura metro bus stop" },
    { type: "info", text: "🌿 SERENITY: Lodhi Garden path network confirmed low-noise corridor (42 dB avg) — recommended for morning walks" },
];

export default function AlertTicker({ weatherData, aqiData }) {
    const [tickerItems, setTickerItems] = useState(STATIC_ALERTS);
    const [timeStr, setTimeStr] = useState("");

    // Continuously running clock
    useEffect(() => {
        const updateClock = () => {
            setTimeStr(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        };
        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    // Inject live data alerts when environmental props update
    useEffect(() => {
        const liveAlerts = [];

        if (weatherData?.isRaining) {
            liveAlerts.push({
                type: "severe",
                text: `🌧️ LIVE: Active rainfall ${weatherData.rain?.toFixed(1) ?? "?"}mm/hr detected — ${weatherData.condition}. Monsoon Matrix flood overlays activated.`,
            });
        }

        if (aqiData && aqiData.aqi > 100) {
            liveAlerts.push({
                type: aqiData.aqi > 200 ? "severe" : "warning",
                text: `💨 LIVE AQI: ${aqiData.stationName} reading ${aqiData.aqi} — ${aqiData.label}. ${aqiData.suggestMetro ? "Metro routes strongly advised." : "Limit outdoor exposure."}`,
            });
        }

        if (weatherData && weatherData.temp > 38) {
            liveAlerts.push({
                type: "warning",
                text: `🌡️ HEAT ADVISORY: Feels like ${weatherData.feelsLike}°C. ShadeSeeker active — prioritizing tree canopy routes. Hydration stations marked on map.`,
            });
        }

        setTickerItems([...liveAlerts, ...STATIC_ALERTS]);
    }, [weatherData, aqiData]);

    const hasSevere = tickerItems.some((a) => a.type === "severe");
    const tickerText = tickerItems.map((a) => a.text).join("   ·   ");

    return (
        <div
            className={`absolute bottom-0 left-0 right-0 z-[1000] h-9 overflow-hidden flex items-center border-t ${hasSevere
                ? "bg-red-950/70 border-red-500/30"
                : "bg-slate-900/70 border-white/10"
                } backdrop-blur-lg`}
        >
            {/* LIVE indicator */}
            <div
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 border-r h-full ${hasSevere ? "border-red-500/30" : "border-white/10"
                    }`}
            >
                <div
                    className={`w-1.5 h-1.5 rounded-full ${hasSevere ? "bg-red-400 pulse-red" : "bg-emerald-400 animate-pulse"
                        }`}
                />
                <span
                    className={`text-[10px] font-bold tracking-wider ${hasSevere ? "text-red-400" : "text-emerald-400"
                        }`}
                >
                    {hasSevere ? "ALERT" : "LIVE"}
                </span>
            </div>

            {/* Scrolling Ticker */}
            <div className="flex-1 overflow-hidden relative">
                <div className="ticker-content text-[11px] font-medium text-slate-200 whitespace-nowrap">
                    {tickerText}
                    <span className="mx-8 text-slate-600">—</span>
                    {tickerText}
                </div>
            </div>

            {/* Right: timestamp */}
            <div className="flex-shrink-0 px-3 border-l border-white/10 h-full flex items-center">
                <span className="text-[10px] font-mono text-slate-500">
                    {timeStr}
                </span>
            </div>
        </div>
    );
}
