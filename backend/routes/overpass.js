/**
 * overpass.js — GET /api/overpass
 * Proxies the Overpass API to fetch building footprints (with height tags)
 * and tree nodes for the ShadeSeeker shadow engine.
 *
 * Query params: bbox  (south,west,north,east — e.g., "28.61,77.20,28.65,77.24")
 * Returns: { buildings: [...], trees: [...] }
 */

const express = require("express");
const axios = require("axios");
const router = express.Router();
const { demoBuildings } = require("../data/spatialData");

// ─── Build Overpass QL query ──────────────────────────────────────────────────
function buildQuery(bbox) {
    return `
    [out:json][timeout:25];
    (
      way["building"]["height"](${bbox});
      way["building"]["building:levels"](${bbox});
      node["natural"="tree"](${bbox});
    );
    out body;
    >;
    out skel qt;
  `;
}

// ─── Convert Overpass JSON elements to a simplified structure ─────────────────
function parseOverpassResponse(data) {
    const nodes = {};
    const buildings = [];
    const trees = [];

    // First pass: index all nodes for coordinate resolution
    data.elements.forEach((el) => {
        if (el.type === "node") {
            nodes[el.id] = { lat: el.lat, lon: el.lon };
            if (el.tags?.natural === "tree") {
                trees.push({ id: el.id, lat: el.lat, lon: el.lon });
            }
        }
    });

    // Second pass: resolve building way coordinates
    data.elements.forEach((el) => {
        if (el.type === "way" && el.tags?.building) {
            const height =
                parseFloat(el.tags.height) ||
                (parseInt(el.tags["building:levels"] || 3) * 3.5); // assume 3.5m per floor

            const footprint = el.nodes
                .map((nid) => nodes[nid])
                .filter(Boolean)
                .map((n) => [n.lon, n.lat]); // GeoJSON order: [lng, lat]

            if (footprint.length >= 3) {
                buildings.push({
                    id: el.id,
                    name: el.tags.name || el.tags["addr:street"] || `Building ${el.id}`,
                    height,
                    footprint,
                });
            }
        }
    });

    return { buildings, trees };
}

router.get("/", async (req, res) => {
    const { bbox } = req.query;

    if (!bbox) {
        return res.status(400).json({ error: "bbox query parameter required (south,west,north,east)" });
    }

    try {
        const query = buildQuery(bbox);
        const { data } = await axios.post(
            "https://overpass-api.de/api/interpreter",
            `data=${encodeURIComponent(query)}`,
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                timeout: 20000,
            }
        );

        const { buildings, trees } = parseOverpassResponse(data);

        return res.json({
            success: true,
            source: "overpass",
            buildingCount: buildings.length,
            treeCount: trees.length,
            buildings,
            trees,
        });
    } catch (err) {
        console.warn("[overpass] Overpass API error, returning demo buildings:", err.message);
        // Return static demo buildings so ShadeSeeker still works
        return res.status(200).json({
            success: false,
            fallback: true,
            source: "demo",
            buildingCount: demoBuildings.length,
            treeCount: 0,
            buildings: demoBuildings,
            trees: [],
        });
    }
});

module.exports = router;
