"""
TerraShield AI — Disaster Scenario Simulator Engine
Dynamic hydrological accumulation, storm surge inundation, and time-step propagation simulation.
"""
import time
import math
from typing import List, Dict, Any, Optional
from backend.models.simulation import ScenarioParameters, SimulationRunResult, TimeStepResult

# Infrastructure assets evaluated during simulations
CRITICAL_ASSETS_GEO = [
    {"id": "HOSP-01", "name": "Orion Metro General Trauma Center", "type": "Hospital", "lat": 37.7850, "lng": -122.4100, "elev_m": 16.5, "pop": 85000},
    {"id": "HOSP-02", "name": "Harborfront Emergency Medical Clinic", "type": "Clinic", "lat": 37.7790, "lng": -122.3920, "elev_m": 3.8, "pop": 25000},
    {"id": "ELEC-01", "name": "Bayside 230kV Primary Transmission Substation", "type": "Power Substation", "lat": 37.7710, "lng": -122.3980, "elev_m": 4.2, "pop": 120000},
    {"id": "ELEC-02", "name": "North Hill Secondary Distribution Hub", "type": "Power Substation", "lat": 37.7920, "lng": -122.4150, "elev_m": 88.0, "pop": 45000},
    {"id": "WAT-01", "name": "Estuary Wastewater Treatment & Pumping Station", "type": "Water Facility", "lat": 37.7680, "lng": -122.4250, "elev_m": 2.9, "pop": 180000},
    {"id": "WAT-02", "name": "Ridge Reservoir & Potable Water Distribution", "type": "Water Facility", "lat": 37.7550, "lng": -122.4550, "elev_m": 115.0, "pop": 90000},
    {"id": "BRG-01", "name": "Delta South Causeway & Arterial Bridge", "type": "Bridge", "lat": 37.7660, "lng": -122.4120, "elev_m": 5.5, "pop": 65000},
    {"id": "BRG-02", "name": "North Canal Crossing", "type": "Bridge", "lat": 37.7820, "lng": -122.3880, "elev_m": 4.8, "pop": 40000},
    {"id": "TEL-01", "name": "Central Telecommunications Gateway Tower", "type": "Telecom", "lat": 37.7770, "lng": -122.4180, "elev_m": 45.0, "pop": 150000},
    {"id": "SHLT-01", "name": "Community Civic Center Evacuation Shelter", "type": "Shelter", "lat": 37.7810, "lng": -122.4150, "elev_m": 22.0, "pop": 8000}
]

# Modeled road segments
ROAD_SEGMENTS = [
    {"id": "RD-01", "name": "Bay Coastal Expressway (Hwy 101 Link)", "elev_m": 3.2, "length_km": 6.4, "lanes": 6},
    {"id": "RD-02", "name": "Delta Harbor Arterial Boulevard", "elev_m": 4.1, "length_km": 4.2, "lanes": 4},
    {"id": "RD-03", "name": "Central Ridge Parkway", "elev_m": 65.0, "length_km": 8.1, "lanes": 4},
    {"id": "RD-04", "name": "South Industrial Logistics Corridor", "elev_m": 2.8, "length_km": 5.0, "lanes": 4},
    {"id": "RD-05", "name": "North Hill Access Avenue", "elev_m": 72.0, "length_km": 3.5, "lanes": 2}
]

class DisasterSimulationEngine:
    @staticmethod
    def run_simulation(params: ScenarioParameters) -> SimulationRunResult:
        start_t = time.time()
        hours = max(4, min(48, params.duration_hours))
        rain_rate = params.rainfall_intensity_mm_hr
        surge = params.surge_height_m
        sat = params.soil_saturation_pct / 100.0
        drain_eff = params.drainage_efficiency_pct / 100.0

        timesteps: List[TimeStepResult] = []
        peak_hour = int(hours * 0.65) # Peak occurs past mid-point of storm

        submerged_assets_set = set()
        disrupted_roads_set = set()

        for h in range(1, hours + 1):
            # Hydrograph curve: bell curve rising to peak and draining
            if h <= peak_hour:
                intensity_factor = math.sin((h / peak_hour) * (math.pi / 2))
            else:
                intensity_factor = math.cos(((h - peak_hour) / (hours - peak_hour)) * (math.pi / 2))
                intensity_factor = max(0.15, intensity_factor)

            # Cumulative water level above baseline MSL
            accumulated_precip_m = (rain_rate * h * 0.001) * sat * (1.0 - drain_eff * 0.4)
            tide_oscillation = math.sin(h * 0.5) * (params.tide_level_m * 0.5)
            water_level_m = round(surge * intensity_factor + accumulated_precip_m + tide_oscillation, 2)
            water_level_m = max(0.2, water_level_m)

            # Calculate extent & depth
            extent_sqkm = round(1.2 + (water_level_m ** 1.6) * 2.8, 2)
            max_depth = round(water_level_m * 1.35, 2)
            mean_depth = round(water_level_m * 0.55, 2)

            inundated_bldgs = int(extent_sqkm * 180 * (1.0 if water_level_m > 1.0 else 0.4))
            inundated_rd_km = round(min(27.2, extent_sqkm * 1.9), 1)

            # Check critical assets inundated at this water level
            isolated_facilities = []
            for asset in CRITICAL_ASSETS_GEO:
                if asset["elev_m"] <= water_level_m + 1.0 or asset["id"] in params.disrupted_bridges_roads:
                    isolated_facilities.append(f"{asset['name']} ({asset['type']})")
                    submerged_assets_set.add(asset["id"])

            pop_impact = int(inundated_bldgs * 3.4 + sum(a["pop"] for a in CRITICAL_ASSETS_GEO if a["id"] in submerged_assets_set) * 0.12)

            # Generate synthetic contour polygons for map rendering
            contours = [
                {
                    "level_m": round(water_level_m, 1),
                    "depth_category": "Deep (>1.5m)" if water_level_m > 1.5 else "Shallow (0.3-1.0m)",
                    "color": "#ff0055" if water_level_m > 2.0 else "#00f0ff",
                    "polygon_coords": [
                        [37.7600 + (water_level_m * 0.003), -122.4400],
                        [37.7800 + (water_level_m * 0.003), -122.4400],
                        [37.7800, -122.3850 - (water_level_m * 0.004)],
                        [37.7600, -122.3850 - (water_level_m * 0.004)]
                    ]
                }
            ]

            timesteps.append(TimeStepResult(
                step_hour=h,
                flood_extent_sqkm=extent_sqkm,
                max_water_depth_m=max_depth,
                mean_water_depth_m=mean_depth,
                inundated_buildings_count=inundated_bldgs,
                inundated_road_km=inundated_rd_km,
                isolated_facilities=isolated_facilities,
                population_impacted=pop_impact,
                active_inundation_contours=contours
            ))

        # Compile peak metrics
        peak_step = timesteps[peak_hour - 1]
        submerged_nodes_detail = [a for a in CRITICAL_ASSETS_GEO if a["id"] in submerged_assets_set]
        
        # Check roads
        for rd in ROAD_SEGMENTS:
            if rd["elev_m"] <= peak_step.max_water_depth_m + 0.5 or rd["id"] in params.disrupted_bridges_roads:
                disrupted_roads_set.add(rd["id"])
        disrupted_roads_detail = [r for r in ROAD_SEGMENTS if r["id"] in disrupted_roads_set]

        exec_ms = round((time.time() - start_t) * 1000, 2)

        return SimulationRunResult(
            scenario_id=params.scenario_id,
            scenario_name=params.name,
            hazard_type=params.hazard_type,
            status="completed",
            total_timesteps=hours,
            peak_hour=peak_hour,
            peak_flood_extent_sqkm=peak_step.flood_extent_sqkm,
            peak_impacted_population=peak_step.population_impacted,
            submerged_critical_nodes=submerged_nodes_detail,
            disrupted_road_segments=disrupted_roads_detail,
            timesteps=timesteps,
            execution_time_ms=exec_ms
        )
