# Path OS — Climate-Aware Navigation Command Center

Path OS is a full-stack, climate-aware web navigation system designed to empower urban travelers by visualizing real-time and mock ecological datasets, including Air Quality Index (AQI), weather patterns, building shadow footprints, noise levels, and emergency shelter locations.

With two primary route calculation mechanisms (**Pulse** and **Haven**), it offers users the choice between the fastest conventional route and a maximally protected, climate-hazard-avoiding trajectory.

---

## 🌟 Key Feature Modules

1. **AirGuard (Ecology Shield & Compass)**
   * **Online Dashboard**: A HUD panel displaying live Air Quality Index (AQI) scores, PM2.5 details, and a dynamic safety indicator.
   * **Offline Compass**: Under network loss, AirGuard automatically takes over the full viewport, transitioning into a fallback compass that points towards the nearest emergency shelter using local spatial indices.

2. **NavQuiet (Serene vs. Noise Layers)**
   * Displays acoustic mappings, marking high-decibel corridors and quiet serene zones.
   * Haven routing automatically steers clear of high-noise corridors to ensure a quiet, peaceful walk.

3. **ShadeSeeker (Pedestrian Shadow Simulator)**
   * Leverages building footprints retrieved dynamically from the OpenStreetMap Overpass API and computes simulated shadow projections based on a responsive time-of-day slider. Perfect for finding shaded paths during peak summer heat.

4. **AlertTicker (Crisis News Ticker)**
   * A scrolling news banner pinned to the bottom of the interface, providing real-time hazard warnings, immediate AQI exposure updates, and major weather warnings.

5. **Empathy Scores & Dual Routing Mode**
   * **Pulse Route**: Optimizes for raw speed and driving duration, fetching standard geometries from the public OSRM (Open Source Routing Machine) API.
   * **Haven Route**: Optimizes for safety and peace, querying OpenRouteService (ORS) with specialized hazard polygons (avoiding severe floods and noise corridors) to construct a protected pedestrian path. Falls back gracefully to OSRM if ORS is rate-limited.
   * **Empathy Score Panel**: Dynamically evaluates routes on factors like shaded cover, noise avoidance, flooding immunity, and clean air exposure.

---

## 🛠️ Technology Stack

* **Frontend**:
  * React 18 & Vite
  * Tailwind CSS (Fluid grid layouts, custom floating glassmorphic windows, and clean typography)
  * Leaflet & React Leaflet (Map canvas, polygon overlays, and route rendering)
  * LocalForage (Offline client-side state/persistence)
* **Backend**:
  * Node.js & Express
  * Axios (Orchestrating upstream mapping, routing, and environmental APIs)
  * Upstream APIs: OSRM API, OpenRouteService API, OpenWeatherMap, Open-Meteo, and OpenStreetMap Overpass (No paid API keys required)

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
    │   ├── components/       # UI modules: AirGuard, ShadeSeeker, NavQuiet, etc.
    │   ├── hooks/            # Network status check hook (online/offline status)
    │   ├── services/         # Axios API connection endpoints
    │   ├── App.jsx           # Global state orchestrator
    │   ├── index.css         # Tailwind directives & glassmorphic custom classes
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
The client app will launch at [http://localhost:5173](http://localhost:5173). Open this URL in your web browser to access the Crisis Command Center dashboard.
