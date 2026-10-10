"""
TerraShield AI — FastAPI Backend Server
Geospatial Intelligence, Disaster Simulation & Holographic Digital Twin Platform
"""
from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional

from backend.config import APP_NAME, VERSION, DEFAULT_REGION
from backend.models.geospatial import Parcel, Coordinates, GeoPolygon
from backend.models.land import SuitabilityAssessmentRequest, SuitabilityAssessmentResponse
from backend.models.hazard import MultiHazardReport
from backend.models.simulation import ScenarioParameters, SimulationRunResult
from backend.models.infrastructure import (
    InfrastructureGraphData,
    DisruptionSimulationRequest,
    DisruptionSimulationResponse
)
from backend.models.damage import DamageReportItem, ImageTriageRequest, ImageTriageResponse
from backend.models.recovery import (
    RecoveryTask,
    RecoveryOptimizationRequest,
    RecoveryPlanResponse
)
from backend.models.research import MLResearchLabReport
from backend.models.ai import AssistantQueryRequest, AssistantQueryResponse

# Services
from backend.services.spatial_service import SpatialService
from backend.services.land_suitability import LandSuitabilityEngine
from backend.services.hazard_engine import HazardIntelligenceEngine, HISTORICAL_EVENTS
from backend.services.simulation_engine import DisasterSimulationEngine
from backend.services.infrastructure_engine import InfrastructureEngine
from backend.services.damage_engine import DamageAssessmentEngine
from backend.services.recovery_optimizer import RecoveryOptimizationEngine
from backend.services.environmental_service import EnvironmentalService
from backend.services.ml_lab_service import MLLabService
from backend.services.ai_assistant_service import AIAssistantService
from backend.services.live_data_service import LiveDataService
from backend.services.report_service import ReportService

app = FastAPI(
    title=APP_NAME,
    version=VERSION,
    description="Unified Geospatial AI Intelligence, Disaster Resilience & 3D Holographic Twin Backend API"
)

# Enable CORS for local Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- SYSTEM & HEALTH -----------------
@app.get("/api/health")
def health_check():
    return {
        "status": "operational",
        "app": APP_NAME,
        "version": VERSION,
        "region": DEFAULT_REGION["name"],
        "demo_mode": True
    }

@app.get("/api/region")
def get_region():
    return DEFAULT_REGION

# ----------------- SPATIAL & PARCELS -----------------
@app.get("/api/spatial/parcels", response_model=List[Parcel])
def get_parcels():
    return SpatialService.get_all_parcels()

@app.get("/api/spatial/parcels/{parcel_id}", response_model=Parcel)
def get_parcel(parcel_id: str):
    p = SpatialService.get_parcel_by_id(parcel_id)
    if not p:
        raise HTTPException(status_code=404, detail=f"Parcel {parcel_id} not found")
    return p

@app.post("/api/spatial/calculate-polygon")
def calculate_polygon(polygon: GeoPolygon):
    metrics = SpatialService.calculate_polygon_metrics(polygon.coordinates)
    return metrics

@app.post("/api/spatial/synthesize-parcel", response_model=Parcel)
def synthesize_parcel(polygon: GeoPolygon):
    p = SpatialService.synthesize_custom_polygon_parcel(polygon.coordinates, polygon.name or "Custom Parcel")
    return p

# ----------------- LAND INTELLIGENCE -----------------
@app.post("/api/land/suitability", response_model=SuitabilityAssessmentResponse)
def evaluate_suitability(request: SuitabilityAssessmentRequest):
    return LandSuitabilityEngine.evaluate(request)

# ----------------- MULTI-HAZARD INTELLIGENCE -----------------
@app.get("/api/hazard/assess", response_model=MultiHazardReport)
def assess_hazards(
    lat: float = Query(20.5937, description="Latitude"),
    lng: float = Query(78.9629, description="Longitude"),
    parcel_id: Optional[str] = Query(None, description="Optional Parcel ID")
):
    return HazardIntelligenceEngine.assess_location(lat=lat, lng=lng, parcel_id=parcel_id)

@app.get("/api/hazard/historical-events")
def get_historical_events():
    return HISTORICAL_EVENTS

# ----------------- DISASTER SIMULATOR -----------------
@app.post("/api/simulation/run", response_model=SimulationRunResult)
def run_simulation(params: ScenarioParameters):
    return DisasterSimulationEngine.run_simulation(params)

@app.get("/api/simulation/presets")
def get_simulation_presets():
    return [
        {
            "id": "SCEN-01",
            "name": "100-Year Atmospheric River & King Tide Inundation",
            "hazard_type": "flood",
            "rainfall_intensity_mm_hr": 75.0,
            "duration_hours": 18,
            "surge_height_m": 2.8,
            "tide_level_m": 1.4,
            "soil_saturation_pct": 90.0,
            "drainage_efficiency_pct": 50.0,
            "disrupted_bridges_roads": ["BRG-01", "RD-01"]
        },
        {
            "id": "SCEN-02",
            "name": "Estuary Levee Breach & Flash Surge",
            "hazard_type": "dam_breach",
            "rainfall_intensity_mm_hr": 45.0,
            "duration_hours": 12,
            "surge_height_m": 3.6,
            "tide_level_m": 1.6,
            "soil_saturation_pct": 95.0,
            "drainage_efficiency_pct": 35.0,
            "disrupted_bridges_roads": ["BRG-01", "BRG-02", "RD-04"]
        },
        {
            "id": "SCEN-03",
            "name": "Moderate 25-Year Coastal Storm",
            "hazard_type": "flood",
            "rainfall_intensity_mm_hr": 35.0,
            "duration_hours": 8,
            "surge_height_m": 1.2,
            "tide_level_m": 0.8,
            "soil_saturation_pct": 65.0,
            "drainage_efficiency_pct": 80.0,
            "disrupted_bridges_roads": []
        }
    ]

# ----------------- INFRASTRUCTURE INTELLIGENCE -----------------
@app.get("/api/infrastructure/graph", response_model=InfrastructureGraphData)
def get_infra_graph():
    return InfrastructureEngine.get_base_graph()

@app.post("/api/infrastructure/simulate-disruption", response_model=DisruptionSimulationResponse)
def simulate_infra_disruption(request: DisruptionSimulationRequest):
    return InfrastructureEngine.simulate_disruption(request)

# ----------------- DAMAGE ASSESSMENT -----------------
@app.get("/api/damage/reports", response_model=List[DamageReportItem])
def get_damage_reports():
    return DamageAssessmentEngine.get_all_reports()

@app.patch("/api/damage/reports/{report_id}")
def update_damage_report_status(
    report_id: str,
    status: str = Query(..., description="verified_by_engineer, rejected, suspected"),
    verified_by: Optional[str] = Query(None)
):
    rep = DamageAssessmentEngine.update_report_status(report_id, status, verified_by)
    if not rep:
        raise HTTPException(status_code=404, detail="Report not found")
    return rep

@app.post("/api/damage/triage", response_model=ImageTriageResponse)
def run_damage_triage(request: ImageTriageRequest):
    return DamageAssessmentEngine.run_image_triage(request)

# ----------------- RECOVERY OPTIMIZATION -----------------
@app.get("/api/recovery/tasks", response_model=List[RecoveryTask])
def get_recovery_tasks():
    return RecoveryOptimizationEngine.get_all_tasks()

@app.post("/api/recovery/optimize", response_model=RecoveryPlanResponse)
def optimize_recovery(request: RecoveryOptimizationRequest):
    return RecoveryOptimizationEngine.solve_plan(request)

# ----------------- ENVIRONMENTAL INTELLIGENCE -----------------
@app.get("/api/environmental/community")
def get_environmental_summary():
    return EnvironmentalService.get_community_vulnerability_summary()

# ----------------- AI RESEARCH & ML LAB -----------------
@app.get("/api/research/benchmarks", response_model=MLResearchLabReport)
def get_ml_benchmarks():
    return MLLabService.run_benchmark_suite()

# ----------------- AI ASSISTANT / COPILOT -----------------
@app.post("/api/assistant/query", response_model=AssistantQueryResponse)
def query_assistant(request: AssistantQueryRequest):
    return AIAssistantService.answer_query(request)

# ----------------- LIVE DATA & TELEMETRY -----------------
@app.get("/api/live/data-sources")
def get_data_sources():
    return LiveDataService.get_data_sources_status()

@app.get("/api/live/weather")
def get_live_weather(lat: float = 20.5937, lng: float = 78.9629):
    return LiveDataService.fetch_live_weather(lat=lat, lng=lng)

@app.get("/api/live/earthquakes")
def get_live_earthquakes():
    return LiveDataService.fetch_live_earthquakes()

# ----------------- REPORTS & DOSSIERS -----------------
@app.get("/api/reports/dossier")
def get_resilience_dossier(
    parcel_id: str = Query("P-101"),
    profile: str = Query("residential")
):
    return ReportService.generate_comprehensive_dossier(parcel_id=parcel_id, development_profile=profile)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
