# Path OS

Path OS is a full-stack, climate-aware urban navigation system that orchestrates real-time and environmental datasets to optimize commuter routing. The platform features an interactive command-center interface that calculates routes using two primary modes:
- **Fastest (Pulse)**: Underpinned by OSRM for raw speed optimization.
- **Haven**: Underpinned by OpenRouteService (ORS) for safe, hazard-avoiding navigation incorporating ecological factors.

---

## 🌟 Key Features

1. **Operator Access Control**: A secure login interface with session management and credentials-based authentication.
2. **Climate Navigation HUD**: An interactive, full-height command panel displaying real-time environmental metrics.
3. **Geocoding Engine**: Dynamic location lookup using the OpenStreetMap Nominatim API alongside a pre-indexed landmark fallback for key transportation hubs.
4. **Climate Intelligence**:
   - **Air (AirGuard)**: Local Air Quality Index (AQI) tracking and visual smog boundary overlays.
   - **Flood (Monsoon Matrix)**: Rain intensity gauges and flood zone visualization.
   - **Shade (ShadeSeeker)**: Dynamic solar azimuth shadow simulator.
   - **Noise (NavQuiet)**: Environmental noise level heatmaps and quiet route selection.
   - **Dynamic Meteorological Updating**: Automatically queries real-time weather (Open-Meteo) and air quality (OpenAQ) endpoints for route destinations.
5. **Real-time Status Feed**: A marquee-based alert ticker for weather and ecological advisories, paired with synchronized system clocks.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Leaflet & React Leaflet, LocalForage
- **Backend**: Node.js, Express, Axios
- **Upstream APIs**: OpenAQ (v3), Open-Meteo, OSRM, OpenRouteService, OpenStreetMap (Nominatim & Overpass)

---

## 📂 Project Structure

```text
Path OS/
├── backend/
│   ├── data/                 # Environmental datasets (flood, noise, smog)
│   ├── routes/
│   │   ├── aqi.js            # Air Quality API wrappers
│   │   ├── overpass.js       # OSM building shadow footprints query
│   │   ├── routing.js        # Routing logic (Pulse vs Haven)
│   │   └── weather.js        # Weather metrics
│   ├── server.js             # Express application entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/       # Interface components (AirGuard, ShadeSeeker, NavQuiet, ClimatePanel, Login)
    │   ├── hooks/            # Custom React hooks (online/offline status)
    │   ├── services/         # API connection handlers
    │   ├── App.jsx           # Application entry and orchestration
    │   ├── index.css         # Styling and custom animations
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Getting Started

Follow these steps to run Path OS locally.

### Prerequisites
- **Node.js**: v16.x or newer
- **npm**: v8.x or newer

### Installation & Run

1. **Start the Backend Server**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   The backend server runs at `http://localhost:3001`. You can verify its status at `http://localhost:3001/api/health`.

2. **Start the Frontend Application**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The web application will open at `http://localhost:5173`.
