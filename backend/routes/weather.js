/**
 * weather.js — GET /api/weather
 * Proxies Open-Meteo API (completely free, no API key required).
 * Fetches current weather for a given lat/lon.
 *
 * Query params: lat, lon
 * Returns: { temp, feelsLike, precipitation, windspeed, weatherCode, condition, isRaining }
 */

const express = require("express");
const axios = require("axios");
const router = express.Router();

// Open-Meteo weather code → human-readable condition mapping
const WEATHER_CONDITIONS = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Icy Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    71: "Slight Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    80: "Slight Showers",
    81: "Moderate Showers",
    82: "Violent Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Hail",
    99: "Heavy Thunderstorm",
};

const RAIN_CODES = new Set([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99]);

router.get("/", async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: "lat and lon query parameters are required" });
    }

    try {
        const url = "https://api.open-meteo.com/v1/forecast";
        const params = {
            latitude: lat,
            longitude: lon,
            current: [
                "temperature_2m",
                "apparent_temperature",
                "precipitation",
                "rain",
                "windspeed_10m",
                "weathercode",
            ].join(","),
            timezone: "Asia/Kolkata",
            forecast_days: 1,
        };

        const { data } = await axios.get(url, { params, timeout: 6000 });
        const curr = data.current;

        const weatherCode = curr.weathercode ?? 0;
        const condition = WEATHER_CONDITIONS[weatherCode] || "Unknown";
        const isRaining = RAIN_CODES.has(weatherCode) || (curr.rain ?? 0) > 0;

        return res.json({
            success: true,
            lat: parseFloat(lat),
            lon: parseFloat(lon),
            temp: curr.temperature_2m,
            feelsLike: curr.apparent_temperature,
            precipitation: curr.precipitation,
            rain: curr.rain,
            windspeed: curr.windspeed_10m,
            weatherCode,
            condition,
            isRaining,
            unit: data.current_units,
        });
    } catch (err) {
        console.error("[weather] Open-Meteo error:", err.message);
        // Return a graceful mock fallback so UI doesn't break
        return res.status(200).json({
            success: false,
            fallback: true,
            temp: 34,
            feelsLike: 38,
            precipitation: 0,
            rain: 0,
            windspeed: 12,
            weatherCode: 2,
            condition: "Partly Cloudy (Fallback)",
            isRaining: false,
        });
    }
});

module.exports = router;
