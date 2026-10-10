# TerraShield AI
### AI-Powered Geospatial Intelligence, Disaster Simulation & Holographic Digital Twin Platform

**Core Tagline:** *Understand the Land. Anticipate the Risk. Protect the Future.*

---

## 🌍 Product Overview

**TerraShield AI** is an enterprise-grade geospatial intelligence and disaster resilience platform designed to bridge the critical divide between pre-development land suitability assessment, real-time natural hazard modeling, dynamic disaster scenario simulation, and resource-constrained recovery optimization.

Built for **Urban Planners**, **Emergency Response Directors**, **Environmental Researchers**, **Citizens**, and **System Administrators**, TerraShield AI unifies multi-spectral satellite observations, physical topography models, topological infrastructure graphs, and deterministic optimization algorithms into an explainable, source-grounded decision support ecosystem.

---

## 🎨 5 Distinct Visual Themes

TerraShield AI features a **live theme switcher** that re-skins design tokens, color variables, borders, glassmorphism filters, and map overlays across the entire workspace without losing state:

1. **Theme A — HOLOCORE (Default):** Deep midnight atmosphere, electric cyan (`#00f0ff`), ice-blue, and violet holographic glass with laser scanlines and glowing digital-twin boundaries.
2. **Theme B — ORBITAL COMMAND:** Dark navy operations-center visual hierarchy with radar telemetry and tactical amber/cyan status alerts.
3. **Theme C — SATELLITE INTELLIGENCE:** Topographic GIS earth tones, emerald hazard contours, and high-contrast scientific map legends.
4. **Theme D — NEO CYBER:** Charcoal cyberpunk environment with high-voltage neon green (`#00ff9d`), magenta (`#ff007f`), and technical network grid lines.
5. **Theme E — CLARITY ANALYTICS:** Crisp high-legibility light interface with neutral surfaces, accessible contrast ratios, and clear presentation charts.

---

## 🚀 Key Functional Modules (14 Integrated Systems)

| Module | Engine / Method | Core Capabilities |
| :--- | :--- | :--- |
| **1. Overview Mission Command** | Real-time Telemetry & KPI Aggregator | Executive resilience scorecards, active hazard alerts, parcel carousels, and quick AI workflow launchers. |
| **2. Interactive 2D Geospatial Map** | Leaflet GIS Pipeline | Base tile switcher (Carto Dark, Esri Satellite, Topo, Light), FEMA 100-Yr/500-Yr flood layers, custom polygon drawing tool with real-time area/perimeter calculation, and coordinate inspector. |
| **3. Holographic 3D Digital Twin** | Three.js WebGL Engine | Procedural DEM terrain mesh, wireframe buildings, animated water plane with rising inundation height slider, glowing infrastructure pipes, 3D pulsing asset beacons, and camera presets (Orbital, Tactical, Ground, Estuary). |
| **4. Land Intelligence** | AHP Multi-Criteria Decision Analysis (MCDA) | Evaluates slope stability, flood risk, soil load capacity, and highway/hospital proximity across Residential, Commercial, Agricultural, and Industrial profiles with criteria weight tuning. |
| **5. Multi-Hazard Intelligence** | Unified Threat Indexing | Multi-hazard exposure cards (Coastal Surge, Pluvial Ponding, Landslide, Seismic Liquefaction, Wildfire), composite risk gauge, and historical disaster archives. |
| **6. Disaster Scenario Simulator** | Hydrological Accumulation Engine | Dynamic time-step simulation (Hour 1 to 18) with rainfall sliders, levee breach triggers, interactive timeline scrubber, hydrograph charts, and asset submergence tracking. |
| **7. Infrastructure Graph** | NetworkX Dependency Engine | Cross-sector topological dependency graph (Power, Water, Hospitals, Bridges, Telecom, Shelters), click-to-fail cascade simulation, bottleneck detection, and Dijkstra detour routing. |
| **8. Damage Assessment & Triage** | Optical Change Detection & Drone AI | Geotagged damage incident feed, before-and-after split comparison slider, AI photo triage (Grade 1-4 severity), and certified PE verification workflows. |
| **9. Recovery Optimizer** | Integer Knapsack & DAG Solver | Deterministic resource-constrained solver optimizing budget allocation ($400k-$2.2M) and crew capacity to maximize citizens restored, day-by-day Gantt timeline, and Pareto trade-off curves. |
| **10. Environmental & SVI** | CDC/ATSDR Social Vulnerability Index | Census tract vulnerability scoring, Sentinel-2 NDVI tree canopy cover, urban heat island thermal gradients, and 15-minute emergency medical travel isochrones. |
| **11. AI Research & ML Lab** | Scikit-Learn Validation Suite | Real Random Forest, Gradient Boosted Trees, and Logistic Regression model training on multi-spectral features, ROC-AUC curves, confusion matrix heatmaps, and Gini feature importances. |
| **12. Reports & Documents** | Automated Dossier Engine & jsPDF | Generates comprehensive executive resilience dossiers with full methodology disclosures and instant 1-click PDF download. |
| **13. Data Sources & Feeds** | Live REST Connectors | Live real-time Open-Meteo weather integration and USGS earthquake feed monitoring with automatic offline fallback caching. |
| **14. AI Copilot Assistant** | Grounded Context-Aware RAG | Floating AI assistant citing official public sources (FEMA, NASA SRTM, NOAA, USGS), distinguishing facts from synthetic simulations, and executing suggested map actions. |

---

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Three.js, Leaflet, Recharts, Lucide Icons, jsPDF.
- **Backend:** Python 3.13, FastAPI, Uvicorn, NetworkX, Scikit-Learn, SciPy, NumPy, Shapely, Pydantic v2, Requests.
- **Geospatial & Data:** SRTM 30m DEM, FEMA NFHL, NOAA Inundation Models, Open-Meteo API, USGS Seismic Feeds.

---

## 💻 Setup & Run Instructions

### Prerequisites
- **Node.js**: v18+ (Tested on v24.20)
- **Python**: v3.10+ (Tested on v3.13)

### 1. Launch FastAPI Backend
```bash
# From project root directory
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at `http://127.0.0.1:8000/docs`.

### 2. Launch Vite Frontend
```bash
cd frontend
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Run Automated Backend Test Suite
```bash
# Validates all 10 analytical, simulation, graph, optimization, and AI engines
python test_backend.py
```

---

## 🔬 Deterministic Algorithms & Mathematical Models

1. **Land Suitability (AHP / MCDA):**
   $$\text{Score} = \sum_{i=1}^n w_i \cdot S_i(\mathbf{x})$$
   Subject to $\sum w_i = 1.0$, evaluating normalized sub-scores for slope gradient, flood zone return period, soil shear capacity, and arterial transit radius.

2. **Hydrological Inundation Accumulation:**
   $$\text{WaterLevel}(t) = \text{Surge} \cdot \sin\left(\frac{\pi t}{2 t_{\text{peak}}}\right) + (I_{\text{rain}} \cdot t) \cdot S_{\text{sat}} \cdot (1 - 0.4 \cdot E_{\text{drain}}) + \Delta_{\text{tide}}(t)$$

3. **Infrastructure Graph Centrality & Detour Routing:**
   - Betweenness centrality: $C_B(v) = \sum_{s \neq v \neq t} \frac{\sigma_{st}(v)}{\sigma_{st}}$
   - Shortest emergency detour: Dijkstra pathfinding over dynamic edge weights $W(e) = \text{length}(e) \cdot (1 + \text{congestion})$.

4. **Resource-Constrained Recovery Knapsack Optimization:**
   $$\max \sum_{j \in T} P_j \cdot x_j \quad \text{s.t.} \quad \sum_{j \in T} C_j \cdot x_j \le B, \quad x_j \le x_{\text{prereq}(j)}$$
   Scheduled across crew pools using topological dependency ordering.

---

## 🔒 Security & Data Transparency

- **Explicit Labeling:** All hypothetical simulations, demonstration parcels, and calibrated network models are labeled.
- **No Secret Exposure:** All external APIs use public endpoints or server-side environment variables without frontend credential leakage.
- **Resilient Fallback:** When offline or disconnected, all connectors fall back to cached telemetry.

---

*TerraShield AI — Built for next-generation planetary intelligence and disaster resilience.*
