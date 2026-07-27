/**
 * api.js — Centralized Axios wrappers for all Path OS backend endpoints.
 * All calls go through the Vite proxy: /api → http://localhost:3001/api
 */

import axios from "axios";

const client = axios.create({
    baseURL: "/api",
    timeout: 12000,
    headers: { "Content-Type": "application/json" },
});

// ─── Health Check ─────────────────────────────────────────────────────────────
export const checkHealth = () => client.get("/health").then((r) => r.data);

// ─── Spatial Data (Mock PostGIS layer) ───────────────────────────────────────
export const fetchSpatialData = () => client.get("/spatial").then((r) => r.data);

// ─── Routing ──────────────────────────────────────────────────────────────────
// mode: 'pulse' | 'haven'
// origin / destination: [lng, lat]
export const fetchRoute = (origin, destination, mode = "pulse") =>
    client.post("/route", { origin, destination, mode }).then((r) => r.data);

// ─── Weather ──────────────────────────────────────────────────────────────────
export const fetchWeather = (lat, lon) =>
    client.get("/weather", { params: { lat, lon } }).then((r) => r.data);

// ─── Air Quality ──────────────────────────────────────────────────────────────
export const fetchAQI = (lat, lon) =>
    client.get("/aqi", { params: { lat, lon } }).then((r) => r.data);

// ─── Overpass (Building footprints for ShadeSeeker) ───────────────────────────
// bbox: "south,west,north,east"
export const fetchOverpass = (bbox) =>
    client.get("/overpass", { params: { bbox } }).then((r) => r.data);
