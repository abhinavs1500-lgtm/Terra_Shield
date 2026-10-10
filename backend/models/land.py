from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class CriteriaWeights(BaseModel):
    slope_weight: float = 0.20
    flood_risk_weight: float = 0.25
    soil_quality_weight: float = 0.15
    road_accessibility_weight: float = 0.15
    water_proximity_weight: float = 0.10
    hospital_proximity_weight: float = 0.15

class SuitabilityAssessmentRequest(BaseModel):
    parcel_id: Optional[str] = None
    custom_polygon: Optional[List[List[float]]] = None
    development_profile: str = "residential" # residential, agricultural, commercial, industrial
    custom_weights: Optional[CriteriaWeights] = None

class FactorScore(BaseModel):
    factor_name: str
    raw_value: Any
    unit: str
    normalized_score: float # 0 to 100
    weight: float
    weighted_score: float
    assessment: str
    recommendation: str
    data_source: str
    confidence: float

class SuitabilityAssessmentResponse(BaseModel):
    parcel_id: str
    parcel_name: str
    profile: str
    overall_suitability_score: float # 0 to 100
    suitability_class: str # Highly Suitable, Moderately Suitable, Marginally Suitable, Restricted
    factors: List[FactorScore]
    development_constraints: List[str]
    mitigation_recommendations: List[str]
    sensitivity_analysis: Dict[str, float]
    radar_metrics: Dict[str, float]
    legal_disclaimer: str
