"""
TerraShield AI — Damage Assessment & Triage Engine
Post-disaster change detection, drone imagery triage, and verified damage registry.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.models.damage import DamageReportItem, ImageTriageRequest, ImageTriageResponse

# Initial Seed Damage Reports for the Demonstration Area
SEED_DAMAGE_REPORTS: List[DamageReportItem] = [
    DamageReportItem(
        id="DMG-101",
        title="Mahanadi Delta Embankment Breach & Agricultural Inundation",
        asset_type="levee",
        lat=20.3540,
        lng=86.1240,
        address="Mahanadi-Devi River Bifurcation Berm (Chainage 14+200, Kendrapara Sector, Odisha)",
        severity_grade="Severe (Grade 3)",
        confidence_score=0.96,
        verification_status="verified_by_engineer",
        detection_method="Cartosat-3 Optical & Sentinel-2 MNDWI Change Detection",
        image_before_url="/assets/disaster/mahanadi_flood_baseline.jpg",
        image_after_url="/assets/disaster/mahanadi_flood_aftermath.jpg",
        structural_damage_pct=78.0,
        reported_at="2024-10-08T09:30:00Z",
        verified_by="Odisha Disaster Rapid Action Force (ODRAF) Lead Surveyor",
        notes="Catastrophic 55-meter embankment failure along southern levee collar; uncontrolled turbid inundation across 42.6 km² of delta paddies and State Highway 12 approach washout."
    ),
    DamageReportItem(
        id="DMG-102",
        title="Cyclone Michaung Coastal Arterial Highway & Canal Surge",
        asset_type="road",
        lat=13.0827,
        lng=80.2707,
        address="Buckingham Canal / Ennore Coastal Highway Corridor (Tamil Nadu)",
        severity_grade="Severe (Grade 3)",
        confidence_score=0.94,
        verification_status="verified_by_engineer",
        detection_method="Drone Aerial Computer Vision & Micro-SAR Telemetry",
        image_before_url="/assets/disaster/michaung_cyclone_baseline.jpg",
        image_after_url="/assets/disaster/michaung_cyclone_aftermath.jpg",
        structural_damage_pct=65.0,
        reported_at="2024-10-08T11:15:00Z",
        verified_by="Greater Chennai Corporation Emergency Engineering Cell",
        notes="Severe 1.4m tidal storm surge overtopped canal retaining walls; multi-lane express underpasses submerged; 230kV substation yard isolated due to floodwater ingress."
    ),
    DamageReportItem(
        id="DMG-103",
        title="Bandra-Worli Coastal Sea Link Marine Pier Scour",
        asset_type="bridge",
        lat=19.0350,
        lng=72.8180,
        address="Bandra-Worli Coastal Sea Link (Marine Pylons 4-6, Mumbai)",
        severity_grade="Moderate (Grade 2)",
        confidence_score=0.91,
        verification_status="verified_by_engineer",
        detection_method="Sub-surface Multibeam Sonar & Drone LiDAR Triage",
        image_before_url="/assets/disaster/michaung_cyclone_baseline.jpg",
        image_after_url="/assets/disaster/michaung_cyclone_aftermath.jpg",
        structural_damage_pct=42.0,
        reported_at="2024-10-08T13:40:00Z",
        verified_by="Maharashtra State Road Development Corporation (MSRDC)",
        notes="Extreme cyclonic tidal riprap displacement around south pylon collar; 1.8m foundation scour pocket detected; main bridge span remains structurally stable."
    ),
    DamageReportItem(
        id="DMG-104",
        title="Bandra-Kurla 400kV Substation Switchyard Flood Ingress",
        asset_type="power_pole",
        lat=19.0650,
        lng=72.8680,
        address="BKC Power Grid Hub, Mithi River Basin Perimeter (Mumbai)",
        severity_grade="Total Collapse (Grade 4)",
        confidence_score=0.97,
        verification_status="verified_by_engineer",
        detection_method="Thermal Infrared UAV & SCADA Telemetry",
        image_before_url="/assets/disaster/mahanadi_flood_baseline.jpg",
        image_after_url="/assets/disaster/mahanadi_flood_aftermath.jpg",
        structural_damage_pct=85.0,
        reported_at="2024-10-08T08:10:00Z",
        verified_by="Maharashtra State Electricity Transmission Co. (MSETCL)",
        notes="Mithi River flood surcharge overtopped protection berm; 1.1m sediment-laden water in high-voltage transformer yard; automated emergency isolation triggered."
    ),
    DamageReportItem(
        id="DMG-105",
        title="Western Ghats Highway Slope Failure & Colluvium Slump",
        asset_type="road",
        lat=18.7500,
        lng=73.4200,
        address="NH-48 Western Ghats Escarpment (Milepost 78.4, Maharashtra)",
        severity_grade="Minor (Grade 1)",
        confidence_score=0.88,
        verification_status="suspected",
        detection_method="Sentinel-1 InSAR Slope Displacement Analysis",
        image_before_url="/assets/disaster/mahanadi_flood_baseline.jpg",
        image_after_url="/assets/disaster/mahanadi_flood_aftermath.jpg",
        structural_damage_pct=25.0,
        reported_at="2024-10-08T15:00:00Z",
        verified_by=None,
        notes="Monsoon saturated regolith slope failure; shoulder gravel displacement and asphalt shear across northbound lane; single-lane traffic diversion active."
    )
]

class DamageAssessmentEngine:
    _reports: List[DamageReportItem] = list(SEED_DAMAGE_REPORTS)

    @classmethod
    def get_all_reports(cls) -> List[DamageReportItem]:
        return cls._reports

    @classmethod
    def update_report_status(cls, report_id: str, status: str, verified_by: Optional[str] = None) -> Optional[DamageReportItem]:
        for r in cls._reports:
            if r.id == report_id:
                r.verification_status = status
                if verified_by:
                    r.verified_by = verified_by
                return r
        return None

    @classmethod
    def add_damage_report(cls, report: DamageReportItem) -> DamageReportItem:
        cls._reports.insert(0, report)
        return report

    @staticmethod
    def run_image_triage(req: ImageTriageRequest) -> ImageTriageResponse:
        # Heuristic computer vision triage based on incident type and image parameters
        incident = req.incident_type.lower()
        if "collapse" in incident or "breach" in incident:
            sev = "Total Collapse (Grade 4)"
            conf = 0.94
            loss = "$2.5M - $4.0M"
            action = "Immediate structural cordon (100m perimeter) and emergency shoring team dispatch."
            features = [
                {"feature": "Debris field scatter", "confidence": 0.95, "bounding_box": [0.2, 0.3, 0.8, 0.9]},
                {"feature": "Load-bearing failure", "confidence": 0.92, "bounding_box": [0.35, 0.4, 0.7, 0.85]}
            ]
        elif "flood" in incident or "water" in incident or "surge" in incident:
            sev = "Severe (Grade 3)"
            conf = 0.89
            loss = "$400k - $900k"
            action = "High-volume submersible pump deployment and electrical lockout verification."
            features = [
                {"feature": "Standing water line > 1.0m", "confidence": 0.91, "bounding_box": [0.1, 0.5, 0.9, 0.9]},
                {"feature": "Sediment & mud deposition", "confidence": 0.86, "bounding_box": [0.2, 0.6, 0.8, 0.95]}
            ]
        elif "crack" in incident or "road" in incident:
            sev = "Moderate (Grade 2)"
            conf = 0.84
            loss = "$80k - $200k"
            action = "Traffic lane restriction and asphalt patching crew scheduling."
            features = [
                {"feature": "Longitudinal surface fissure", "confidence": 0.88, "bounding_box": [0.3, 0.4, 0.6, 0.7]}
            ]
        else:
            sev = "Minor (Grade 1)"
            conf = 0.78
            loss = "$15k - $50k"
            action = "Non-urgent routine maintenance logging and periodic monitoring."
            features = [
                {"feature": "Cosmetic facade / cladding damage", "confidence": 0.82, "bounding_box": [0.4, 0.3, 0.7, 0.6]}
            ]

        new_id = f"DMG-{len(DamageAssessmentEngine._reports) + 101}"
        new_item = DamageReportItem(
            id=new_id,
            title=f"AI Triaged: {req.incident_type.capitalize()} at ({req.lat:.4f}, {req.lng:.4f})",
            asset_type="infrastructure" if "bridge" in incident else "building",
            lat=req.lat,
            lng=req.lng,
            address=f"Geotagged Site ({req.lat:.4f}, {req.lng:.4f})",
            severity_grade=sev,
            confidence_score=conf,
            verification_status="suspected",
            detection_method="Drone AI Vision Triage v2.1",
            image_before_url="https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&auto=format&fit=crop&q=60",
            image_after_url="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=60",
            structural_damage_pct=60.0 if "Severe" in sev else 30.0,
            reported_at=datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
            verified_by=None,
            notes=req.notes or "Automated optical edge detection and spectral change inference."
        )
        DamageAssessmentEngine.add_damage_report(new_item)

        return ImageTriageResponse(
            report_id=new_id,
            severity_grade=sev,
            confidence_score=conf,
            detected_features=features,
            preliminary_loss_range_usd=loss,
            recommended_action=action
        )
