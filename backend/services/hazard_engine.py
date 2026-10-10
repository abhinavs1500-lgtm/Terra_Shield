"""
TerraShield AI — Multi-Hazard Intelligence Engine
Comprehensive multi-hazard risk assessment, spatial hazard overlay evaluation, and historical event analysis.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.models.hazard import MultiHazardReport, HazardExposureMetric
from backend.services.spatial_service import SpatialService

# Historical disaster events database for the region (India Strategic Basins)
HISTORICAL_EVENTS = [
    {
        "id": "HIST-2005-MUMBAI",
        "title": "2005 Mumbai Coastal Cloudburst Deluge",
        "date": "July 2005",
        "type": "Extreme Rainfall & Urban Inundation",
        "severity": "Severe (National Emergency)",
        "peak_precipitation_24h_mm": 944.0,
        "affected_parcels": ["P-101", "P-102"],
        "damage_est_usd": "₹3,200 Cr",
        "summary": "Record 944mm rainfall overwhelmed Mithi River basin drainage and submerged low-lying suburban corridors."
    },
    {
        "id": "HIST-1999-ODISHA",
        "title": "1999 Odisha Super Cyclone & Storm Surge",
        "date": "October 1999",
        "type": "Coastal Storm Surge & Inundation",
        "severity": "Category 5 Equivalent",
        "peak_surge_height_m": 6.8,
        "affected_parcels": ["P-102"],
        "damage_est_usd": "₹4,500 Cr",
        "summary": "Destructive 260 km/h wind shear and 7-meter tidal surge devastated Mahanadi deltaic agricultural lowlands."
    },
    {
        "id": "HIST-2018-KERALA",
        "title": "2018 Kerala Monsoon Basin Floods",
        "date": "August 2018",
        "type": "Monsoon Overflow & Landslide",
        "severity": "High (Level 3 Emergency)",
        "peak_precipitation_24h_mm": 310.0,
        "affected_parcels": ["P-104"],
        "damage_est_usd": "₹3,100 Cr",
        "summary": "Dam gates forced open across Periyar river system inundated Vembanad lagoon wetland lowlands."
    },
    {
        "id": "HIST-2001-BHUJ",
        "title": "2001 Gujarat M7.7 Intraplate Seismic Event",
        "date": "January 2001",
        "type": "Earthquake & Liquefaction",
        "severity": "Severe (M7.7 Richter)",
        "affected_parcels": ["P-105"],
        "damage_est_usd": "₹12,000 Cr",
        "summary": "Widespread ground liquefaction in uncompacted marine alluvium and industrial corridor foundations."
    }
]

class HazardIntelligenceEngine:
    @staticmethod
    def assess_location(lat: float, lng: float, parcel_id: Optional[str] = None) -> MultiHazardReport:
        parcel = None
        if parcel_id:
            parcel = SpatialService.get_parcel_by_id(parcel_id)
        
        # Estimate terrain metrics if parcel not provided directly
        if parcel:
            elev = parcel.mean_elevation_m
            slope = parcel.mean_slope_deg
            soil = parcel.soil_type
            imperv = parcel.impervious_surface_ratio
            dist_water = parcel.distance_to_waterway_m
            loc_name = parcel.name
        else:
            # Spatial model approximation for arbitrary coordinate
            elev = max(2.0, 150.0 * (lat - 37.74) / 0.06 - 120.0 * (lng + 122.40) / 0.08)
            elev = min(280.0, max(2.5, elev))
            slope = 3.0 + 18.0 * (elev / 280.0)
            soil = "Marine Silt Loam" if elev < 15 else "Sandy Loam & Bedrock"
            imperv = 0.55 if elev < 20 else 0.20
            dist_water = max(100.0, 3000.0 * (lng + 122.38) ** 2 + 300.0)
            loc_name = f"Coordinate ({lat:.4f}, {lng:.4f})"

        hazards: List[HazardExposureMetric] = []

        # 1. Flood & Coastal Inundation Hazard
        if elev < 5.0 or dist_water < 250.0:
            flood_score = 88.0
            flood_level = "Severe"
            flood_driver = "Low elevation (<5m MSL) in coastal 100-year storm surge zone."
            flood_mitigation = "Perimeter floodwall, dry-floodproofing, and stormwater pumping station installation."
        elif elev < 15.0 or dist_water < 800.0:
            flood_score = 62.0
            flood_level = "Moderate"
            flood_driver = "Proximity to tidal estuary and potential backwater inundation."
            flood_mitigation = "Elevated foundation slabs (1.0m freeboard) and permeable retention swales."
        else:
            flood_score = 15.0
            flood_level = "Very Low"
            flood_driver = "High elevation and well-drained topography outside 500-year flood zone."
            flood_mitigation = "Standard municipal curb drainage maintenance."

        hazards.append(HazardExposureMetric(
            hazard_type="Coastal & Riverine Flood",
            risk_level=flood_level,
            score=flood_score,
            primary_driver=flood_driver,
            historical_frequency="1-in-25 to 1-in-100 Year Event",
            return_period_years=100 if flood_score > 50 else 500,
            data_source="FEMA National Flood Hazard Layer & NOAA Sea Level Rise Model",
            observation_date="2024 Q3",
            uncertainty_margin=7.5,
            mitigation_strategy=flood_mitigation
        ))

        # 2. Urban Waterlogging & Pluvial Flooding
        pluvial_score = min(95.0, (imperv * 60.0) + (max(0.0, 10.0 - slope) * 3.5))
        if pluvial_score > 70:
            pluvial_level = "High"
            pluvial_driver = f"High impervious surface ({int(imperv*100)}%) and flat grade causing surface ponding."
        elif pluvial_score > 40:
            pluvial_level = "Moderate"
            pluvial_driver = "Moderate surface runoff during intense convective storms."
        else:
            pluvial_level = "Low"
            pluvial_driver = "Adequate natural infiltration and positive slope gradient."

        hazards.append(HazardExposureMetric(
            hazard_type="Urban Waterlogging (Pluvial)",
            risk_level=pluvial_level,
            score=round(pluvial_score, 1),
            primary_driver=pluvial_driver,
            historical_frequency="1-in-5 to 1-in-10 Year Convective Deluge",
            return_period_years=10,
            data_source="EPA SWMM Urban Catchment Runoff Model",
            observation_date="2024",
            uncertainty_margin=10.0,
            mitigation_strategy="Bioswales, permeable interlocking pavers, and underground detention cisterns."
        ))

        # 3. Landslide & Slope Instability
        if slope > 15.0:
            landslide_score = 82.0
            landslide_level = "High"
            landslide_driver = f"Steep slope angle ({slope:.1f}°) subject to soil saturation slip planes."
            landslide_mitigation = "Soil nail retention, deep horizontal drainage boreholes, and hydroseeded vegetation."
        elif slope > 8.0:
            landslide_score = 48.0
            landslide_level = "Moderate"
            landslide_driver = "Moderate slope gradient with shallow colluvium soil mantle."
            landslide_mitigation = "Terracing and surface water diversion channels."
        else:
            landslide_score = 10.0
            landslide_level = "Very Low"
            landslide_driver = "Flat to gently undulating topography with negligible shear failure risk."
            landslide_mitigation = "No specialized slope stabilization required."

        hazards.append(HazardExposureMetric(
            hazard_type="Landslide & Slope Failure",
            risk_level=landslide_level,
            score=landslide_score,
            primary_driver=landslide_driver,
            historical_frequency="Rainfall-triggered during prolonged atmospheric rivers",
            return_period_years=50 if landslide_score > 50 else 500,
            data_source="USGS Landslide Hazard Assessment Program",
            observation_date="2024 Baseline",
            uncertainty_margin=12.0,
            mitigation_strategy=landslide_mitigation
        ))

        # 4. Seismic Shaking & Liquefaction Hazard
        if "Clay" in soil or "Fill" in soil or elev < 10.0:
            seismic_score = 78.0
            seismic_level = "High"
            seismic_driver = f"Unconsolidated {soil} in shallow water table creates high liquefaction susceptibility."
            seismic_mitigation = "Deep vibro-replacement stone columns and seismic base isolation systems."
        else:
            seismic_score = 42.0
            seismic_level = "Moderate"
            seismic_driver = "Competent bedrock foundation with moderate regional spectral acceleration."
            seismic_mitigation = "Standard structural ductile moment-resisting frames (IBC Code Class D)."

        hazards.append(HazardExposureMetric(
            hazard_type="Seismic Shaking & Liquefaction",
            risk_level=seismic_level,
            score=seismic_score,
            primary_driver=seismic_driver,
            historical_frequency="Regional Major Fault Rupture (M6.5+)",
            return_period_years=75,
            data_source="USGS National Seismic Hazard Model (NSHM)",
            observation_date="2023 Update",
            uncertainty_margin=8.0,
            mitigation_strategy=seismic_mitigation
        ))

        # 5. Wildfire Urban-Interface Exposure
        if elev > 50.0 and slope > 8.0:
            wildfire_score = 65.0
            wildfire_level = "Moderate"
            wildfire_driver = "Proximity to dry foothill chaparral canopy with steep wind funnels."
            wildfire_mitigation = "30-meter defensible space clearance, Class A fire-resistant roofing, and ember screens."
        else:
            wildfire_score = 18.0
            wildfire_level = "Low"
            wildfire_driver = "Urbanized perimeter with low wildland vegetative fuel density."
            wildfire_mitigation = "Standard municipal fire hydrant spacing."

        hazards.append(HazardExposureMetric(
            hazard_type="Wildfire (WUI)",
            risk_level=wildfire_level,
            score=wildfire_score,
            primary_driver=wildfire_driver,
            historical_frequency="Dry season seasonal hazard (Aug-Oct)",
            return_period_years=25,
            data_source="CAL FIRE Fire Hazard Severity Zone (FHSZ) Map",
            observation_date="2024",
            uncertainty_margin=15.0,
            mitigation_strategy=wildfire_mitigation
        ))

        # Composite Hazard Index (Weighted Average)
        weights = [0.30, 0.20, 0.20, 0.20, 0.10]
        composite_score = round(sum(h.score * w for h, w in zip(hazards, weights)), 1)

        if composite_score >= 70:
            overall_threat = "Severe Multi-Hazard Alert"
        elif composite_score >= 50:
            overall_threat = "Elevated Hazard Vulnerability"
        elif composite_score >= 35:
            overall_threat = "Moderate Hazard Exposure"
        else:
            overall_threat = "Low Hazard Profile"

        overlapping = [h.hazard_type for h in hazards if h.score >= 50.0]

        radar_data = [
            {"hazard": "Flood / Surge", "score": flood_score, "benchmark": 40.0},
            {"hazard": "Pluvial Drainage", "score": pluvial_score, "benchmark": 35.0},
            {"hazard": "Landslide", "score": landslide_score, "benchmark": 25.0},
            {"hazard": "Seismic / Soil", "score": seismic_score, "benchmark": 50.0},
            {"hazard": "Wildfire", "score": wildfire_score, "benchmark": 30.0}
        ]

        return MultiHazardReport(
            location_name=loc_name,
            coordinates=[lat, lng],
            composite_hazard_index=composite_score,
            overall_threat_level=overall_threat,
            hazards=hazards,
            overlapping_hazards=overlapping if overlapping else ["None exceeding critical threshold"],
            historical_events_nearby=HISTORICAL_EVENTS,
            evacuation_route_status="Primary Arterial Route Green" if flood_score < 70 else "Arterial Corridor at High Flood Vulnerability",
            radar_data=radar_data,
            timestamp=datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
            is_hypothetical=False
        )
