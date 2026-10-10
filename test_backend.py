"""
TerraShield AI — Backend Integration Test Suite
Validates all analytical calculations, spatial queries, simulations, optimization solvers, and AI assistant routines.
"""
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from backend.services.spatial_service import SpatialService
from backend.services.land_suitability import LandSuitabilityEngine, SuitabilityAssessmentRequest
from backend.services.hazard_engine import HazardIntelligenceEngine
from backend.services.simulation_engine import DisasterSimulationEngine, ScenarioParameters
from backend.services.infrastructure_engine import InfrastructureEngine, DisruptionSimulationRequest
from backend.services.damage_engine import DamageAssessmentEngine, ImageTriageRequest
from backend.services.recovery_optimizer import RecoveryOptimizationEngine, RecoveryOptimizationRequest
from backend.services.ml_lab_service import MLLabService
from backend.services.ai_assistant_service import AIAssistantService, AssistantQueryRequest
from backend.services.live_data_service import LiveDataService
from backend.services.report_service import ReportService

def run_tests():
    print(">>> 1. Testing Spatial Service...")
    parcels = SpatialService.get_all_parcels()
    assert len(parcels) >= 5, "Expected at least 5 demo parcels"
    poly_metrics = SpatialService.calculate_polygon_metrics(parcels[0].coordinates)
    assert poly_metrics["area_hectares"] > 0, "Calculated area must be positive"
    print(f"  [PASS] Spatial Service: {len(parcels)} parcels loaded, polygon calc OK.")

    print(">>> 2. Testing Land Suitability Engine...")
    suit = LandSuitabilityEngine.evaluate(SuitabilityAssessmentRequest(
        parcel_id="P-101",
        development_profile="residential"
    ))
    assert 0 <= suit.overall_suitability_score <= 100, "Suitability score must be in [0, 100]"
    assert len(suit.factors) == 6, "Expected 6 factor scores"
    print(f"  [PASS] Land Suitability: P-101 Score={suit.overall_suitability_score} ({suit.suitability_class}).")

    print(">>> 3. Testing Hazard Intelligence Engine...")
    hazard = HazardIntelligenceEngine.assess_location(lat=20.5937, lng=78.9629, parcel_id="P-102")
    assert len(hazard.hazards) >= 4, "Expected at least 4 hazard assessments"
    print(f"  [PASS] Hazard Engine: Composite Index={hazard.composite_hazard_index} ({hazard.overall_threat_level}).")

    print(">>> 4. Testing Disaster Simulator Engine...")
    sim = DisasterSimulationEngine.run_simulation(ScenarioParameters(
        scenario_id="TEST-01",
        name="Test Storm",
        rainfall_intensity_mm_hr=60.0,
        duration_hours=12,
        surge_height_m=2.0
    ))
    assert sim.status == "completed"
    assert len(sim.timesteps) == 12
    print(f"  [PASS] Disaster Simulator: 12 timesteps completed, Peak Inundation={sim.peak_flood_extent_sqkm} sq km.")

    print(">>> 5. Testing Infrastructure Engine...")
    infra_graph = InfrastructureEngine.get_base_graph()
    assert infra_graph.total_nodes >= 8
    disrupt = InfrastructureEngine.simulate_disruption(DisruptionSimulationRequest(
        disabled_node_ids=["ELEC-01", "BRG-01"]
    ))
    assert disrupt.total_offline_nodes >= 2
    print(f"  [PASS] Infrastructure Engine: {disrupt.total_offline_nodes} offline nodes traced.")

    print(">>> 6. Testing Recovery Optimizer Engine...")
    recovery = RecoveryOptimizationEngine.solve_plan(RecoveryOptimizationRequest(
        available_budget_usd=1200000.0,
        available_crews=15,
        strategy="criticality_first"
    ))
    assert recovery.selected_tasks_count > 0
    assert recovery.total_cost_usd <= 1200000.0
    print(f"  [PASS] Recovery Optimizer: {recovery.selected_tasks_count} tasks scheduled, ₹{recovery.total_cost_usd:,.0f} used.")

    print(">>> 7. Testing AI Research & ML Lab...")
    ml_report = MLLabService.run_benchmark_suite()
    assert len(ml_report.models) >= 2
    assert ml_report.models[0].accuracy > 0.85
    print(f"  [PASS] ML Lab: Random Forest Accuracy={ml_report.models[0].accuracy*100:.1f}%, F1={ml_report.models[0].f1_score:.3f}.")

    print(">>> 8. Testing AI Assistant Copilot...")
    ai_resp = AIAssistantService.answer_query(AssistantQueryRequest(
        query="Analyze plot P-101 for flood exposure",
        context={"selected_parcel_id": "P-101"}
    ))
    assert len(ai_resp.sources) > 0
    print(f"  [PASS] AI Assistant: Sourced response generated with {len(ai_resp.sources)} citations.")

    print(">>> 9. Testing Live Data Connectors...")
    weather = LiveDataService.fetch_live_weather()
    assert "temperature_c" in weather
    print(f"  [PASS] Live Telemetry: Temp={weather['temperature_c']}°C, Status={weather['status']}.")

    print(">>> 10. Testing Executive Dossier Report Generator...")
    dossier = ReportService.generate_comprehensive_dossier("P-101")
    assert "target_location" in dossier
    print(f"  [PASS] Report Service: Generated dossier {dossier['dossier_id']}.")

    print("\nALL 10 BACKEND TEST MODULES PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
