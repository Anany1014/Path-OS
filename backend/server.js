/**
 * server.js — Path OS Backend Entry Point
 * Node.js / Express orchestration layer.
 * All routes are free, open-source, no paid API keys required.
 *
 * Port: 3001 (frontend dev server runs on 5173)
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
    origin: [
        "http://localhost:5173",                          // Vite dev server
        "http://localhost:3000",                          // CRA fallback
        /^https?:\/\/[a-zA-Z0-9-]+\.vercel\.app$/,      // Vercel (anchored, no spoofing)
        /^https?:\/\/[a-zA-Z0-9-]+\.netlify\.app$/,     // Netlify (anchored, no spoofing)
    ],
    methods: ["GET", "POST"],
    credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Request Logging (dev) ────────────────────────────────────────────────────
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/route", require("./routes/routing"));
app.use("/api/weather", require("./routes/weather"));
app.use("/api/aqi", require("./routes/aqi"));
app.use("/api/overpass", require("./routes/overpass"));

// ─── Spatial Data (mock PostGIS layer) ───────────────────────────────────────
// Returns the full mock spatial dataset for client-side rendering.
const spatialData = require("./data/spatialData");

app.get("/api/spatial", (_req, res) => {
    res.json({
        success: true,
        floodZones: spatialData.floodZones,
        noiseCorridors: spatialData.noiseCorridors,
        sereneZones: spatialData.sereneZones,
        smogZones: spatialData.smogZones,
        emergencyShelters: spatialData.emergencyShelters,
    });
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "Path OS Backend",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
    });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error("[server] Unhandled error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🛡️  Path OS backend running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   Routes: /api/route | /api/weather | /api/aqi | /api/overpass | /api/spatial\n`);
});

module.exports = app;
