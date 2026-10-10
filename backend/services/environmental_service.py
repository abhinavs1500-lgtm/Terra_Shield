"""
TerraShield AI — Environmental & Community Intelligence Service
NDVI vegetation indices, Urban Heat Island, CDC Social Vulnerability Index (SVI), and isochrone accessibility.
"""
from typing import List, Dict, Any, Optional

CENSUS_TRACT_SVI = [
    {
        "tract_id": "WARD-MH-01",
        "name": "Mithi River Corridor & Dharavi Periphery",
        "svi_score": 0.84, # High vulnerability (0.0 to 1.0)
        "population": 18450,
        "median_household_income": 425000,
        "elderly_pop_pct": 21.4,
        "vehicle_access_pct": 48.0,
        "hospital_access_min": 14.5,
        "tree_canopy_pct": 6.2,
        "heat_island_anomaly_c": 3.8
    },
    {
        "tract_id": "WARD-MH-02",
        "name": "Bandra West Coastal Heights",
        "svi_score": 0.22, # Low vulnerability
        "population": 24100,
        "median_household_income": 1180000,
        "elderly_pop_pct": 14.8,
        "vehicle_access_pct": 89.0,
        "hospital_access_min": 6.0,
        "tree_canopy_pct": 34.5,
        "heat_island_anomaly_c": 0.4
    },
    {
        "tract_id": "WARD-OD-03",
        "name": "Mahanadi Deltaic Mixed Rural Basin",
        "svi_score": 0.68,
        "population": 31200,
        "median_household_income": 580000,
        "elderly_pop_pct": 18.2,
        "vehicle_access_pct": 62.0,
        "hospital_access_min": 11.2,
        "tree_canopy_pct": 14.0,
        "heat_island_anomaly_c": 2.6
    },
    {
        "tract_id": "WARD-KL-04",
        "name": "Vembanad Estuary Green Eco-Corridor",
        "svi_score": 0.15,
        "population": 19800,
        "median_household_income": 1350000,
        "elderly_pop_pct": 16.1,
        "vehicle_access_pct": 94.0,
        "hospital_access_min": 8.5,
        "tree_canopy_pct": 48.0,
        "heat_island_anomaly_c": -1.2
    }
]

class EnvironmentalService:
    @staticmethod
    def get_community_vulnerability_summary() -> Dict[str, Any]:
        avg_svi = sum(t["svi_score"] for t in CENSUS_TRACT_SVI) / len(CENSUS_TRACT_SVI)
        total_pop = sum(t["population"] for t in CENSUS_TRACT_SVI)
        high_svi_pop = sum(t["population"] for t in CENSUS_TRACT_SVI if t["svi_score"] > 0.60)

        return {
            "census_tracts": CENSUS_TRACT_SVI,
            "regional_average_svi": round(avg_svi, 2),
            "total_monitored_population": total_pop,
            "high_vulnerability_population": high_svi_pop,
            "high_vulnerability_pct": round((high_svi_pop / total_pop) * 100, 1),
            "air_quality_index_pm25": 28.5, # AQI Good / Moderate
            "mean_ndvi_vegetation_index": 0.46,
            "urban_heat_mitigation_target": "Expand urban tree canopy by 15% in Tracts 01 and 03 to reduce 3.8°C thermal differential."
        }
