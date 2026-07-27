/**
 * spatialData.js
 * Mock spatial JSON dataset simulating the Supabase PostGIS layer.
 * Contains flood hazard zones, noise corridors, serene zones, and emergency shelters
 * centered around Delhi, India for demonstration purposes.
 */

// ─── Flood / Monsoon Matrix Zones ────────────────────────────────────────────
// Each polygon represents a known low-lying area prone to waterlogging.
// depth: 'shallow' | 'knee' | 'chest'
const floodZones = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { id: "fz-001", name: "Minto Bridge Underpass", depth: "chest", severity: "red" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.2090, 28.6410],
          [77.2110, 28.6410],
          [77.2110, 28.6390],
          [77.2090, 28.6390],
          [77.2090, 28.6410]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { id: "fz-002", name: "Pul Bangash Depression", depth: "knee", severity: "amber" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.2250, 28.6630],
          [77.2280, 28.6630],
          [77.2280, 28.6600],
          [77.2250, 28.6600],
          [77.2250, 28.6630]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { id: "fz-003", name: "Lado Sarai Low Point", depth: "shallow", severity: "green" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.1980, 28.5270],
          [77.2010, 28.5270],
          [77.2010, 28.5240],
          [77.1980, 28.5240],
          [77.1980, 28.5270]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { id: "fz-004", name: "ITO Roundabout Flood Trap", depth: "knee", severity: "amber" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.2430, 28.6280],
          [77.2460, 28.6280],
          [77.2460, 28.6250],
          [77.2430, 28.6250],
          [77.2430, 28.6280]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { id: "fz-005", name: "Rohini Sector 22 Canal", depth: "chest", severity: "red" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.0630, 28.7360],
          [77.0670, 28.7360],
          [77.0670, 28.7320],
          [77.0630, 28.7320],
          [77.0630, 28.7360]
        ]]
      }
    }
  ]
};

// ─── Noise / Decibel Corridors ────────────────────────────────────────────────
// High-noise stretches — avoided in NavQuiet / Haven mode.
const noiseCorridors = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { id: "nc-001", name: "Ring Road Construction Belt", decibels: 92, severity: "red" },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.2300, 28.5900],
          [77.2350, 28.6000],
          [77.2400, 28.6100]
        ]
      }
    },
    {
      type: "Feature",
      properties: { id: "nc-002", name: "NH-44 Heavy Traffic Corridor", decibels: 85, severity: "amber" },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.2000, 28.6400],
          [77.2100, 28.6500],
          [77.2200, 28.6600]
        ]
      }
    },
    {
      type: "Feature",
      properties: { id: "nc-003", name: "Azadpur Mandi Noise Zone", decibels: 88, severity: "red" },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.1700, 28.6900],
          [77.1750, 28.6950],
          [77.1800, 28.7000]
        ]
      }
    },
    {
      type: "Feature",
      properties: { id: "nc-004", name: "Karol Bagh Market Stretch", decibels: 79, severity: "amber" },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.1860, 28.6500],
          [77.1910, 28.6520],
          [77.1960, 28.6540]
        ]
      }
    }
  ]
};

// ─── Serene / Low-Decibel Zones ───────────────────────────────────────────────
const sereneZones = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { id: "sz-001", name: "Lodhi Garden", decibels: 42, type: "park" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.2280, 28.5930],
          [77.2340, 28.5930],
          [77.2340, 28.5870],
          [77.2280, 28.5870],
          [77.2280, 28.5930]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { id: "sz-002", name: "Sanjay Lake Greenway", decibels: 38, type: "waterfront" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.3100, 28.6230],
          [77.3160, 28.6230],
          [77.3160, 28.6170],
          [77.3100, 28.6170],
          [77.3100, 28.6230]
        ]]
      }
    }
  ]
};

// ─── Smog / AQ Boundary Zones ─────────────────────────────────────────────────
const smogZones = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { id: "sq-001", name: "Anand Vihar Smog Trap", pm25: 210, severity: "hazardous" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.3160, 28.6450],
          [77.3230, 28.6450],
          [77.3230, 28.6380],
          [77.3160, 28.6380],
          [77.3160, 28.6450]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { id: "sq-002", name: "Wazirpur Industrial Belt", pm25: 175, severity: "very_unhealthy" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.1560, 28.7000],
          [77.1640, 28.7000],
          [77.1640, 28.6920],
          [77.1560, 28.6920],
          [77.1560, 28.7000]
        ]]
      }
    }
  ]
};

// ─── Emergency Shelters / Cooling / Hydration Stations ───────────────────────
// Cached locally for AirGuard offline compass fallback.
const emergencyShelters = [
  { id: "es-001", name: "NDMC Cooling Centre – Connaught Place", lat: 28.6315, lon: 77.2167, type: "cooling", phone: "011-23742400" },
  { id: "es-002", name: "AIIMS Trauma Emergency", lat: 28.5672, lon: 77.2100, type: "hospital", phone: "011-26588500" },
  { id: "es-003", name: "Fire Station – Kashmere Gate", lat: 28.6672, lon: 77.2290, type: "emergency", phone: "101" },
  { id: "es-004", name: "India Gate Hydration Kiosk", lat: 28.6129, lon: 77.2295, type: "hydration", phone: null },
  { id: "es-005", name: "Saket Community Shelter", lat: 28.5244, lon: 77.2066, type: "shelter", phone: "011-29561200" }
];

// ─── Sample Buildings for ShadeSeeker Demo ───────────────────────────────────
// Used when Overpass API is slow/unavailable.
const demoBuildings = [
  {
    id: "bld-001", name: "Connaught Place Block A",
    footprint: [[77.2167, 28.6340], [77.2195, 28.6340], [77.2195, 28.6315], [77.2167, 28.6315], [77.2167, 28.6340]],
    height: 18
  },
  {
    id: "bld-002", name: "Barakhamba Tower",
    footprint: [[77.2230, 28.6310], [77.2250, 28.6310], [77.2250, 28.6290], [77.2230, 28.6290], [77.2230, 28.6310]],
    height: 32
  },
  {
    id: "bld-003", name: "Palika Bazaar Block",
    footprint: [[77.2140, 28.6330], [77.2160, 28.6330], [77.2160, 28.6310], [77.2140, 28.6310], [77.2140, 28.6330]],
    height: 12
  }
];

module.exports = {
  floodZones,
  noiseCorridors,
  sereneZones,
  smogZones,
  emergencyShelters,
  demoBuildings
};
