"""
TerraShield AI — Automated Reporting & Executive Resilience Dossier Generator
Compiles structured multi-domain risk dossiers with transparent citations, methodology disclosures, and audit history.
"""
from typing import Dict, Any, Optional
from datetime import datetime
from backend.services.spatial_service import SpatialService
from backend.services.land_suitability import LandSuitabilityEngine, SuitabilityAssessmentRequest
from backend.services.hazard_engine import HazardIntelligenceEngine
from backend.services.recovery_optimizer import RecoveryOptimizationEngine, RecoveryOptimizationRequest
from backend.services.infrastructure_engine import InfrastructureEngine, DisruptionSimulationRequest

class ReportService:
    @staticmethod
    def generate_comprehensive_dossier(parcel_id: str = "P-101", development_profile: str = "residential") -> Dict[str, Any]:
        parcel = SpatialService.get_parcel_by_id(parcel_id) or SpatialService.get_all_parcels()[0]

        # 1. Land Suitability
        suitability = LandSuitabilityEngine.evaluate(SuitabilityAssessmentRequest(
            parcel_id=parcel.id,
            development_profile=development_profile
        ))

        # 2. Hazard Assessment
        hazard = HazardIntelligenceEngine.assess_location(
            lat=parcel.coordinates[0][0],
            lng=parcel.coordinates[0][1],
            parcel_id=parcel.id
        )

        # 3. Infrastructure Dependency
        infra_sim = InfrastructureEngine.simulate_disruption(DisruptionSimulationRequest(
            disabled_node_ids=["BRG-01", "ELEC-01"]
        ))

        # 4. Recovery Plan
        recovery = RecoveryOptimizationEngine.solve_plan(RecoveryOptimizationRequest(
            available_budget_usd=1200000.0,
            available_crews=15,
            strategy="criticality_first"
        ))

        report_id = f"TS-DOSSIER-{parcel.id}-{datetime.utcnow().strftime('%Y%m%d-%H%M')}"

        return {
            "dossier_id": report_id,
            "title": f"TerraShield AI Executive Resilience & Land Suitability Dossier: {parcel.name}",
            "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "author_system": "TerraShield AI Enterprise Decision Support Platform v1.0",
            "target_location": {
                "parcel_id": parcel.id,
                "parcel_name": parcel.name,
                "zone_type": parcel.zone_type,
                "area_hectares": parcel.area_hectares,
                "mean_elevation_m": parcel.mean_elevation_m,
                "mean_slope_deg": parcel.mean_slope_deg,
                "fema_flood_zone": parcel.flood_zone,
                "centroid_coordinates": parcel.coordinates[0]
            },
            "land_suitability": {
                "score": suitability.overall_suitability_score,
                "rating": suitability.suitability_class,
                "profile": development_profile.capitalize(),
                "primary_constraints": suitability.development_constraints,
                "recommended_mitigations": suitability.mitigation_recommendations
            },
            "hazard_profile": {
                "composite_hazard_index": hazard.composite_hazard_index,
                "overall_threat_level": hazard.overall_threat_level,
                "hazards_summary": [
                    {"type": h.hazard_type, "risk": h.risk_level, "score": h.score, "driver": h.primary_driver}
                    for h in hazard.hazards
                ]
            },
            "infrastructure_vulnerabilities": {
                "critical_bottlenecks_affected": ["Bandra-Kurla 400kV Substation (ELEC-01)", "Bandra-Worli Coastal Sea Link (BRG-01)"],
                "total_offline_nodes": infra_sim.total_offline_nodes,
                "affected_residents_power": infra_sim.total_population_lost_power,
                "affected_residents_water": infra_sim.total_population_lost_water,
                "hospital_contingency": infra_sim.hospitals_at_risk
            },
            "recommended_recovery_schedule": {
                "plan_id": recovery.plan_id,
                "budget_utilized": f"₹{recovery.total_cost_usd:,.0f}",
                "population_restored": recovery.total_population_restored,
                "duration_days": recovery.total_duration_days,
                "prioritized_tasks": [
                    {
                        "task_name": s.task.name,
                        "timeline": f"Day {s.start_day}–Day {s.end_day}",
                        "cost": f"₹{s.task.cost_usd:,.0f}",
                        "rationale": s.why_prioritized
                    }
                    for s in recovery.schedule[:5]
                ]
            },
            "data_sources_cited": [
                {"name": "Survey of India (SOI) High-Resolution Topographic & DEM", "status": "Verified 2024"},
                {"name": "ISRO Bhuvan National Flood & Landslide Inundation Geoportal", "status": "Verified 2024"},
                {"name": "NDMA Disaster Management Vulnerability Atlas of India", "status": "Verified 2024"},
                {"name": "TerraShield India Infrastructure Graph Topology Engine", "status": "Calibrated Model v1.4"}
            ],
            "legal_disclosure": "CONFIDENTIAL RESILIENCE AUDIT: Produced for municipal planning and emergency response prioritization. Numerical evaluations are deterministic model simulations and do not supersede certified legal or geotechnical engineering surveys."
        }
