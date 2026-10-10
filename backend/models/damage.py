from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class DamageReportItem(BaseModel):
    id: str
    title: str
    asset_type: str # bridge, building, road, power_pole, levee
    lat: float
    lng: float
    address: str
    severity_grade: str # Minor (Grade 1), Moderate (Grade 2), Severe (Grade 3), Total Collapse (Grade 4)
    confidence_score: float # 0.0 to 1.0
    verification_status: str # unverified, suspected, verified_by_engineer, rejected
    detection_method: str # Sentinel-2 Change Detection, Drone AI Triage, Citizen Report
    image_before_url: Optional[str] = None
    image_after_url: Optional[str] = None
    structural_damage_pct: float
    reported_at: str
    verified_by: Optional[str] = None
    notes: str

class ImageTriageRequest(BaseModel):
    image_name: str
    incident_type: str
    lat: float
    lng: float
    notes: Optional[str] = None

class ImageTriageResponse(BaseModel):
    report_id: str
    severity_grade: str
    confidence_score: float
    detected_features: List[Dict[str, Any]]
    preliminary_loss_range_usd: str
    recommended_action: str
    disclaimer: str = "PRELIMINARY AI TRIAGE: Does not substitute certified structural engineering inspection."
