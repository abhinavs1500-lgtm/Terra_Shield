from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class HazardExposureMetric(BaseModel):
    hazard_type: str # Flood, Inundation, Landslide, Earthquake, Wildfire, Urban Waterlogging
    risk_level: str # Very Low, Low, Moderate, High, Severe
    score: float # 0 to 100
    primary_driver: str
    historical_frequency: str
    return_period_years: Optional[int] = None
    data_source: str
    observation_date: str
    uncertainty_margin: float # +/- %
    mitigation_strategy: str

class MultiHazardReport(BaseModel):
    location_name: str
    coordinates: List[float] # [lat, lng]
    composite_hazard_index: float # 0 to 100
    overall_threat_level: str
    hazards: List[HazardExposureMetric]
    overlapping_hazards: List[str]
    historical_events_nearby: List[Dict[str, Any]]
    evacuation_route_status: str
    radar_data: List[Dict[str, Any]]
    timestamp: str
    is_hypothetical: bool = False
