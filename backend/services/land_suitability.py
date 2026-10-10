"""
TerraShield AI — Land Intelligence Engine
Deterministic Multi-Criteria Decision Analysis (MCDA / AHP) for Land Suitability Scoring.
"""
from typing import Dict, Any, List, Optional
from backend.models.geospatial import Parcel
from backend.models.land import (
    SuitabilityAssessmentRequest,
    SuitabilityAssessmentResponse,
    FactorScore,
    CriteriaWeights
)
from backend.services.spatial_service import SpatialService

PROFILE_DEFAULT_WEIGHTS: Dict[str, CriteriaWeights] = {
    "residential": CriteriaWeights(
        slope_weight=0.20,
        flood_risk_weight=0.25,
        soil_quality_weight=0.15,
        road_accessibility_weight=0.15,
        water_proximity_weight=0.10,
        hospital_proximity_weight=0.15
    ),
    "agricultural": CriteriaWeights(
        slope_weight=0.15,
        flood_risk_weight=0.15,
        soil_quality_weight=0.35,
        road_accessibility_weight=0.10,
        water_proximity_weight=0.20,
        hospital_proximity_weight=0.05
    ),
    "commercial": CriteriaWeights(
        slope_weight=0.15,
        flood_risk_weight=0.25,
        soil_quality_weight=0.10,
        road_accessibility_weight=0.30,
        water_proximity_weight=0.05,
        hospital_proximity_weight=0.15
    ),
    "industrial": CriteriaWeights(
        slope_weight=0.20,
        flood_risk_weight=0.25,
        soil_quality_weight=0.15,
        road_accessibility_weight=0.25,
        water_proximity_weight=0.05,
        hospital_proximity_weight=0.10
    )
}

class LandSuitabilityEngine:
    @staticmethod
    def evaluate(request: SuitabilityAssessmentRequest) -> SuitabilityAssessmentResponse:
        # 1. Resolve Parcel
        parcel: Optional[Parcel] = None
        if request.parcel_id:
            parcel = SpatialService.get_parcel_by_id(request.parcel_id)
        
        if not parcel and request.custom_polygon:
            parcel = SpatialService.synthesize_custom_polygon_parcel(request.custom_polygon)
            
        if not parcel:
            # Fallback to default first parcel
            parcel = SpatialService.get_all_parcels()[0]

        profile = request.development_profile.lower()
        weights = request.custom_weights or PROFILE_DEFAULT_WEIGHTS.get(profile, PROFILE_DEFAULT_WEIGHTS["residential"])

        # Normalize weights to sum to 1.0
        total_w = (
            weights.slope_weight +
            weights.flood_risk_weight +
            weights.soil_quality_weight +
            weights.road_accessibility_weight +
            weights.water_proximity_weight +
            weights.hospital_proximity_weight
        )
        if total_w <= 0:
            total_w = 1.0

        w_slope = weights.slope_weight / total_w
        w_flood = weights.flood_risk_weight / total_w
        w_soil = weights.soil_quality_weight / total_w
        w_road = weights.road_accessibility_weight / total_w
        w_water = weights.water_proximity_weight / total_w
        w_hosp = weights.hospital_proximity_weight / total_w

        factors: List[FactorScore] = []
        constraints: List[str] = []
        mitigations: List[str] = []

        # 1. Slope & Topography Score
        # For building, 0-5 deg is ideal (100), 5-10 (80), 10-15 (50), >15 (<30)
        slope = parcel.mean_slope_deg
        if slope <= 4.0:
            slope_score = 95.0
            slope_assess = "Gentle slope ideal for low-cost foundation grading and zero mass-movement hazard."
            slope_rec = "Standard slab or crawlspace foundations recommended."
        elif slope <= 9.0:
            slope_score = 80.0
            slope_assess = "Moderate slope requiring standard terracing and site drainage controls."
            slope_rec = "Grade stabilization and retaining walls along cut boundaries."
        elif slope <= 15.0:
            slope_score = 55.0
            slope_assess = "Steep terrain with elevated earthwork costs and moderate erosion potential."
            slope_rec = "Engineered geotechnical pier foundations and tiered retaining structures required."
            constraints.append(f"Slope exceeds 10° ({slope}°): Substantial grading and retaining walls required.")
            mitigations.append("Implement deep pile footings and bioengineered slope anchoring.")
        else:
            slope_score = 25.0
            slope_assess = "Very steep grade subject to severe slope stability and landslide hazards."
            slope_rec = "Steep slope zone. Structural development severely discouraged without heavy stabilization."
            constraints.append(f"Severe slope hazard ({slope}°): High landslide susceptibility.")
            mitigations.append("Mandate comprehensive geotechnical core boring and slope reinforcement.")

        factors.append(FactorScore(
            factor_name="Terrain Slope & Stability",
            raw_value=f"{slope}°",
            unit="degrees",
            normalized_score=slope_score,
            weight=round(w_slope, 3),
            weighted_score=round(slope_score * w_slope, 2),
            assessment=slope_assess,
            recommendation=slope_rec,
            data_source="NASA SRTM 30m DEM",
            confidence=0.94
        ))

        # 2. Flood Hazard Exposure Score
        fz = parcel.flood_zone
        if fz == "X":
            flood_score = 95.0
            flood_assess = "Minimal flood risk (outside 500-year floodplain)."
            flood_rec = "Standard stormwater retention basins."
        elif fz == "A":
            flood_score = 45.0
            flood_assess = "High flood risk (100-year floodplain without base flood elevation)."
            flood_rec = "Elevate ground floor 1.5m above datum; dry floodproofing."
            constraints.append("FEMA Flood Zone A: Subject to 1% annual chance inundation.")
            mitigations.append("Elevate first finished floor minimum 1.5m above baseline and install backflow valves.")
        elif fz == "AE":
            flood_score = 30.0
            flood_assess = "Severe flood risk (100-year regulatory floodway with base flood elevation established)."
            flood_rec = "Mandatory elevation on pilings, wet-floodproofing on non-habitable lower enclosures."
            constraints.append("FEMA Flood Zone AE: Regulatory 100-year flood zone.")
            mitigations.append("Construct structural levees, permeable pavements, and elevated pile-supported floor slabs.")
        else: # VE
            flood_score = 15.0
            flood_assess = "Critical coastal high hazard velocity wave action zone."
            flood_rec = "Breakaway wall construction with elevated reinforced concrete columns."
            constraints.append("FEMA Flood Zone VE: Coastal velocity wave hazard zone.")
            mitigations.append("Armored sea wall and deep steel reinforced caissons.")

        factors.append(FactorScore(
            factor_name="Flood & Inundation Risk",
            raw_value=f"FEMA Zone {fz}",
            unit="zone category",
            normalized_score=flood_score,
            weight=round(w_flood, 3),
            weighted_score=round(flood_score * w_flood, 2),
            assessment=flood_assess,
            recommendation=flood_rec,
            data_source="FEMA National Flood Hazard Layer (NFHL)",
            confidence=0.91
        ))

        # 3. Soil Suitability & Load Bearing Score
        soil = parcel.soil_type
        if "Bedrock" in soil or "Sandy Loam" in soil:
            soil_score = 90.0
            soil_assess = "High load-bearing capacity (>250 kPa) with good permeability and low shrink-swell."
            soil_rec = "Standard shallow spread footings suitable."
        elif "Silt Loam" in soil:
            soil_score = 75.0
            soil_assess = "Moderate load bearing (150-200 kPa) with good agricultural fertility."
            soil_rec = "Reinforced mat foundations or deep strip footings."
        else: # Marine Clay / Compacted Urban Fill
            soil_score = 40.0
            soil_assess = "Low shear strength, moderate liquefaction susceptibility, and high plasticity index."
            soil_rec = "Soil stabilization with lime/cement injection and geopier aggregate columns."
            constraints.append(f"Challenging soil profile: {soil} has elevated liquefaction and settlement risk.")
            mitigations.append("Perform dynamic cone penetration tests and ground improvement before loading.")

        factors.append(FactorScore(
            factor_name="Soil Mechanics & Bearing Capacity",
            raw_value=soil,
            unit="soil classification",
            normalized_score=soil_score,
            weight=round(w_soil, 3),
            weighted_score=round(soil_score * w_soil, 2),
            assessment=soil_assess,
            recommendation=soil_rec,
            data_source="USDA NRCS Web Soil Survey / USGS Geotech",
            confidence=0.88
        ))

        # 4. Road & Highway Accessibility Score
        dist_road = parcel.distance_to_highway_m
        if dist_road <= 300.0:
            road_score = 95.0
            road_assess = f"Optimal arterial road connectivity ({int(dist_road)}m). Rapid logistics ingress."
            road_rec = "Direct dual-access driveway planning."
        elif dist_road <= 1000.0:
            road_score = 80.0
            road_assess = f"Good road access ({int(dist_road)}m) via secondary collector roads."
            road_rec = "Standard right-of-way easement extension."
        elif dist_road <= 2500.0:
            road_score = 55.0
            road_assess = f"Moderate road distance ({int(dist_road)}m). Feeder road paving needed."
            road_rec = "Budget $180k for access road paving and intersection signaling."
        else:
            road_score = 30.0
            road_assess = f"Poor road connectivity ({int(dist_road)}m). Isolated parcel."
            road_rec = "Requires extensive capital investment for primary access corridor."
            constraints.append(f"Remote road access ({int(dist_road)}m): Requires dedicated infrastructure funding.")

        factors.append(FactorScore(
            factor_name="Transportation Accessibility",
            raw_value=f"{int(dist_road)}m",
            unit="meters to arterial",
            normalized_score=road_score,
            weight=round(w_road, 3),
            weighted_score=round(road_score * w_road, 2),
            assessment=road_assess,
            recommendation=road_rec,
            data_source="OpenStreetMap Highway Topology",
            confidence=0.96
        ))

        # 5. Water Body Proximity Score
        dist_water = parcel.distance_to_waterway_m
        if profile == "agricultural":
            # Proximity to water is beneficial for agriculture
            water_score = 95.0 if dist_water < 500 else (75.0 if dist_water < 1500 else 40.0)
        else:
            # For residential/commercial, too close (<100m) is flood/setback risk, 300-1000m is aesthetic
            if dist_water < 150.0:
                water_score = 40.0
                constraints.append(f"Riparian corridor setback constraint: Parcel is {int(dist_water)}m from water body.")
                mitigations.append("Maintain 50m mandatory vegetated riparian conservation buffer.")
            elif dist_water < 600.0:
                water_score = 85.0
            else:
                water_score = 70.0

        factors.append(FactorScore(
            factor_name="Hydrological Buffer & Proximity",
            raw_value=f"{int(dist_water)}m",
            unit="meters to waterway",
            normalized_score=water_score,
            weight=round(w_water, 3),
            weighted_score=round(water_score * w_water, 2),
            assessment=f"Located {int(dist_water)}m from primary drainage / estuary line.",
            recommendation="Observe standard 30m environmental buffer." if dist_water >= 150 else "Maintain wetland conservation easement.",
            data_source="USGS National Hydrography Dataset (NHD)",
            confidence=0.92
        ))

        # 6. Emergency & Hospital Proximity Score
        dist_hosp = parcel.distance_to_hospital_m
        if dist_hosp <= 1500.0:
            hosp_score = 95.0
            hosp_assess = f"Under 5-minute emergency medical response time ({int(dist_hosp)}m)."
        elif dist_hosp <= 3500.0:
            hosp_score = 75.0
            hosp_assess = f"8-12 minute standard ambulance transit corridor ({int(dist_hosp)}m)."
        else:
            hosp_score = 45.0
            hosp_assess = f"Extended emergency response window (>15 min, {int(dist_hosp)}m)."
            if profile == "residential":
                constraints.append(f"Extended emergency medical radius: {int(dist_hosp)}m to closest level-1 trauma center.")

        factors.append(FactorScore(
            factor_name="Emergency Healthcare Radius",
            raw_value=f"{int(dist_hosp)}m",
            unit="meters to hospital",
            normalized_score=hosp_score,
            weight=round(w_hosp, 3),
            weighted_score=round(hosp_score * w_hosp, 2),
            assessment=hosp_assess,
            recommendation="Coordinate with regional EMS dispatch on primary routing." if hosp_score < 60 else "Excellent emergency coverage.",
            data_source="Homeland Infrastructure Foundation-Level Data (HIFLD)",
            confidence=0.97
        ))

        # Compute Overall Score
        overall_score = round(sum(f.weighted_score for f in factors), 1)

        if overall_score >= 80.0:
            suitability_class = "Highly Suitable"
        elif overall_score >= 65.0:
            suitability_class = "Moderately Suitable"
        elif overall_score >= 50.0:
            suitability_class = "Marginally Suitable"
        else:
            suitability_class = "Restricted / High Constraint"

        # Sensitivity Analysis: Effect on overall score if individual criteria weight is +15%
        sensitivity = {
            "slope_variation_impact": round((slope_score - overall_score) * 0.15, 2),
            "flood_variation_impact": round((flood_score - overall_score) * 0.15, 2),
            "soil_variation_impact": round((soil_score - overall_score) * 0.15, 2),
            "road_variation_impact": round((road_score - overall_score) * 0.15, 2),
            "water_variation_impact": round((water_score - overall_score) * 0.15, 2),
            "hosp_variation_impact": round((hosp_score - overall_score) * 0.15, 2)
        }

        radar_metrics = {
            "Topography": slope_score,
            "Flood Resilience": flood_score,
            "Soil Integrity": soil_score,
            "Road Access": road_score,
            "Water Buffer": water_score,
            "Emergency Reach": hosp_score
        }

        return SuitabilityAssessmentResponse(
            parcel_id=parcel.id,
            parcel_name=parcel.name,
            profile=profile.capitalize(),
            overall_suitability_score=overall_score,
            suitability_class=suitability_class,
            factors=factors,
            development_constraints=constraints if constraints else ["No prohibitive physical constraints identified for preliminary screening."],
            mitigation_recommendations=mitigations if mitigations else ["Standard municipal building permits and standard site drainage plan."],
            sensitivity_analysis=sensitivity,
            radar_metrics=radar_metrics,
            legal_disclaimer="PRELIMINARY GEOSPATIAL SCREENING: TerraShield AI evaluations are decision-support estimates and do not constitute legal title verification, licensed civil engineering sign-off, or certified geotechnical survey approvals."
        )
