# Path OS — Climate-Aware Command Center

Path OS is a full-stack, climate-aware urban navigation system designed to empower travelers by orchestrating real-time and mock ecological datasets, including Air Quality Index (AQI), weather patterns, building shadow footprints, noise levels, and emergency shelter locations.

The platform provides a state-of-the-art command-center HUD that dynamically routes commuters using two specialized modes: **Fastest (Pulse)** (raw speed optimization via OSRM) and **Haven** (safe, hazard-avoiding routing via OpenRouteService).

---

## 🌟 Key Feature Modules

1. **Secure Operator Access Control**
   * **HUD Login Gate**: A glassmorphic authorization overlay securing dashboard operations. Simulates authentication checks and uplink establishment.
   * **Profile & Identity**: Displays operator session metadata and supports clean session logout controls.

2. **Left-Aligned HUD Panel & Swapped Header**
   * Stretched full-height sidebar layout (`top-4` to `bottom-16`) positioned on the left for optimal data display density.
   * Transpositioned top header bar keeping navigation/weather indicators in focus and pushing brand identification to the right.

3. Global Architecture & Delhi NCR MVP Configuration
   * Centered default viewport on the **Delhi NCR region** (`lat: 28.52, lng: 77.20`) with zoom level `10` as a configure-gated demonstration zone.
   * Structurally built on open protocols (OSM, OSRM, ORS, Open-Meteo) allowing seamless scaling to global coordinates simply by shifting center defaults and routing polygon queries.

4. **Geocoded Autocomplete Location Engine**
   * Replaced static dropdown lists with interactive origin/destination input bars.
   * Queries the free **OpenStreetMap Nominatim Geocoding API** as you type to fetch matching coordinates.
   * Embedded fallback index containing 20+ prominent Delhi landmark stations (Red Fort, Qutub Minar, India Gate, Lotus Temple, Saket Metro Station, etc.) for instant key-free autocompletion.

5. **Consolidated Climate Options Panel**
   * Aggregates previously scattered modules into a single, cohesive **Climate** tab:
     * **Air (AirGuard)**: Smog boundary overlays, AQI parameters, and health advisory guidelines.
     * **Flood (Monsoon Matrix)**: Rain intensity gauges and flood zone overlay toggles.
     * **Shade (ShadeSeeker)**: Dynamic solar azimuth shadow simulator with responsive timeline sliders.
     * **Noise (NavQuiet)**: Decibel mapping and quiet serene walkway toggles.
   * **Live API Accuracy**: Re-queries real-time weather (Open-Meteo) and AQI (OpenAQ) endpoints for your route's exact destination when calculation completes instead of maintaining static default coordinates.

6. **Interactive Alert Ticker & Clock Feeds**
   * Scroll marquee at the bottom moves at a comfortable speed (`120s`) and pauses instantly on cursor hover so operators can easily read long advisories.
   * Active digital clocks ticking dynamically in real time across the header and ticker status bar.

---

## 🛠️ Technology Stack

* **Frontend**:
  * React 18 & Vite
  * Tailwind CSS (Frosted glass panels, cyber-neon accents, fluid layout)
  * Leaflet & React Leaflet (Map canvas, polygon overlays, and route rendering)
  * LocalForage (Offline client-side state/persistence)
* **Backend**:
  * Node.js & Express
  * Axios (Orchestrating upstream mapping, routing, and environmental APIs)
  * Upstream APIs (Key-free public tiers): OpenAQ API v3, Open-Meteo, OSRM API, OpenRouteService API, OpenStreetMap Overpass

---

## 📂 Project Structure

```text
Path OS/
├── backend/
│   ├── data/                 # Mock PostGIS layers (flood, noise, serene, smog)
│   ├── routes/
│   │   ├── aqi.js            # Air Quality API wrappers
│   │   ├── overpass.js       # OSM building shadow footprints query
│   │   ├── routing.js        # Pulse (OSRM) vs Haven (ORS + avoid_polygons)
│   │   └── weather.js        # Weather metrics
│   ├── server.js             # Express app entry point (port 3001)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/       # UI modules: AirGuard, ShadeSeeker, NavQuiet, ClimatePanel, Login
    │   ├── hooks/            # Network status check hook (online/offline status)
    │   ├── services/         # Axios API connection endpoints
    │   ├── App.jsx           # Global state orchestrator
    │   ├── index.css         # Tailwind directives & custom CSS animations
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Getting Started

To run Path OS locally, you need to start both the backend orchestrator and the frontend dev server.

### 📋 Prerequisites
- **Node.js**: v16.x or newer
- **npm**: v8.x or newer

### 1. Run the Orchestration Backend
Open a terminal, navigate to the `backend/` directory, and run the following commands:
```bash
cd backend
npm install
npm run dev
```
The server will start at `http://localhost:3001`. You can test if it is running correctly via the health-check route: [http://localhost:3001/api/health](http://localhost:3001/api/health).

### 2. Run the React Frontend
Open a new terminal session, navigate to the `frontend/` directory, and run:
```bash
cd frontend
npm install
npm run dev
```
The client app will launch at [http://localhost:5173](http://localhost:5173). Open this URL in your web browser to access the Climate Navigation dashboard.
