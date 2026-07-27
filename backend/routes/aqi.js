/**
 * aqi.js — GET /api/aqi
 * Proxies OpenAQ API v3 (completely free, no API key required for public endpoints).
 * Returns air quality measurements for the nearest monitoring station.
 *
 * Query params: lat, lon
 * Returns: { pm25, pm10, no2, o3, aqi, label, color, stationName }
 */

const express = require("express");
const axios = require("axios");
const router = express.Router();

// ─── AQI Index Calculator (US EPA standard) ───────────────────────────────────
function calcAQI(pm25) {
    // Breakpoints: [C_low, C_high, I_low, I_high]
    const breakpoints = [
        [0.0, 12.0, 0, 50],
        [12.1, 35.4, 51, 100],
        [35.5, 55.4, 101, 150],
        [55.5, 150.4, 151, 200],
        [150.5, 250.4, 201, 300],
        [250.5, 500.4, 301, 500],
    ];

    for (const [cLow, cHigh, iLow, iHigh] of breakpoints) {
        if (pm25 >= cLow && pm25 <= cHigh) {
            return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (pm25 - cLow) + iLow);
        }
    }
    return 500;
}

function getAQILabel(aqi) {
    if (aqi <= 50) return { label: "Good", color: "#10b981" };
    if (aqi <= 100) return { label: "Moderate", color: "#f59e0b" };
    if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", color: "#f97316" };
    if (aqi <= 200) return { label: "Unhealthy", color: "#ef4444" };
    if (aqi <= 300) return { label: "Very Unhealthy", color: "#8b5cf6" };
    return { label: "Hazardous", color: "#7f1d1d" };
}

router.get("/", async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: "lat and lon query parameters are required" });
    }

    try {
        // OpenAQ v3: get measurements near a coordinate (radius 25km)
        const url = "https://api.openaq.gov/v3/measurements";
        const params = {
            coordinates: `${lat},${lon}`,
            radius: 25000,
            limit: 10,
            parameters_id: "2", // pm25 parameter id
        };

        const { data } = await axios.get(url, {
            params,
            headers: { "X-API-Key": "" }, // No key needed for public access
            timeout: 8000,
        });

        let pm25 = null;
        let pm10 = null;
        let stationName = "Unknown Station";

        if (data.results && data.results.length > 0) {
            const latest = data.results[0];
            pm25 = latest.value;
            stationName = latest.location?.name || "Nearest Station";
        }

        // Try to also get pm10
        try {
            const pm10Resp = await axios.get(url, {
                params: { ...params, parameters_id: "1" },
                timeout: 5000,
            });
            if (pm10Resp.data.results?.length > 0) {
                pm10 = pm10Resp.data.results[0].value;
            }
        } catch (_) { /* non-critical */ }

        if (pm25 === null) throw new Error("No PM2.5 data available from OpenAQ");

        const aqi = calcAQI(pm25);
        const { label, color } = getAQILabel(aqi);
        const suggestMetro = aqi > 150;

        return res.json({
            success: true,
            stationName,
            pm25: parseFloat(pm25.toFixed(1)),
            pm10: pm10 !== null ? parseFloat(pm10.toFixed(1)) : null,
            aqi,
            label,
            color,
            suggestMetro,
        });
    } catch (err) {
        console.warn("[aqi] OpenAQ error, returning mock data:", err.message);
        // Graceful fallback: realistic Delhi data for demonstration
        const pm25 = 87.4;
        const aqi = calcAQI(pm25);
        const { label, color } = getAQILabel(aqi);
        return res.status(200).json({
            success: false,
            fallback: true,
            stationName: "Anand Vihar (Mock)",
            pm25,
            pm10: 142.2,
            aqi,
            label,
            color,
            suggestMetro: aqi > 150,
        });
    }
});

module.exports = router;
