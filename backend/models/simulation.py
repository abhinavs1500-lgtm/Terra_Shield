from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ScenarioParameters(BaseModel):
    scenario_id: str
    name: str
    hazard_type: str = "flood" # flood, sea_level_surge, dam_breach, earthquake_cascade
    rainfall_intensity_mm_hr: float = 65.0
    duration_hours: int = 12
    surge_height_m: float = 2.4
    tide_level_m: float = 1.2
    soil_saturation_pct: float = 85.0
    drainage_efficiency_pct: float = 60.0
    disrupted_bridges_roads: List[str] = []

class TimeStepResult(BaseModel):
    step_hour: int
    flood_extent_sqkm: float
    max_water_depth_m: float
    mean_water_depth_m: float
    inundated_buildings_count: int
    inundated_road_km: float
    isolated_facilities: List[str]
    population_impacted: int
    active_inundation_contours: List[Dict[str, Any]]

class SimulationRunResult(BaseModel):
    scenario_id: str
    scenario_name: str
    hazard_type: str
    status: str
    total_timesteps: int
    peak_hour: int
    peak_flood_extent_sqkm: float
    peak_impacted_population: int
    submerged_critical_nodes: List[Dict[str, Any]]
    disrupted_road_segments: List[Dict[str, Any]]
    timesteps: List[TimeStepResult]
    hypothetical_disclaimer: str = "HYPOTHETICAL SIMULATION: Results generated for emergency preparedness planning. Not an official real-time evacuation order."
    execution_time_ms: float
