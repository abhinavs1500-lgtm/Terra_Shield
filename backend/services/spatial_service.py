"""
TerraShield AI — Spatial Service
Manages vector geometries, land parcel inventory, coordinate queries, and spatial calculations.
"""
import math
from typing import List, Dict, Any, Optional
from shapely.geometry import Polygon, Point
from backend.models.geospatial import Parcel, GeoPolygon

# Base Demonstration Land Parcels around Orion Delta / SF Bay Corridor
DEMO_PARCELS: List[Parcel] = [
    Parcel(
        id="P-101",
        name="Mumbai Coastal & Mithi Basin Sector A",
        zone_type="Residential",
        coordinates=[
            [19.0760, 72.8777],
            [19.0880, 72.8777],
            [19.0880, 72.8920],
            [19.0760, 72.8920]
        ],
        area_hectares=48.2,
        mean_elevation_m=14.5,
        mean_slope_deg=2.2,
        soil_type="Coastal Alluvial Sand with Basaltic Base",
        groundwater_depth_m=4.2,
        flood_zone="X", # Minimal flood hazard
        distance_to_highway_m=420.0,
        distance_to_hospital_m=1100.0,
        distance_to_waterway_m=1400.0,
        impervious_surface_ratio=0.38,
        ndvi_green_index=0.48,
        land_price_estimate_sqm=35000.0,
        owner_class="Municipal Corporation of Greater Mumbai",
        status="Available for Evaluation"
    ),
    Parcel(
        id="P-102",
        name="Mahanadi Delta Lowlands Sector B",
        zone_type="Agricultural / Conservation",
        coordinates=[
            [20.2960, 85.8240],
            [20.3120, 85.8240],
            [20.3120, 85.8450],
            [20.2960, 85.8450]
        ],
        area_hectares=92.6,
        mean_elevation_m=4.1,
        mean_slope_deg=0.8,
        soil_type="Alluvial Silt & Heavy Marine Clay",
        groundwater_depth_m=1.8,
        flood_zone="AE", # High risk (100-year base flood elevation)
        distance_to_highway_m=1800.0,
        distance_to_hospital_m=3400.0,
        distance_to_waterway_m=120.0,
        impervious_surface_ratio=0.06,
        ndvi_green_index=0.79,
        land_price_estimate_sqm=12500.0,
        owner_class="Odisha Water Resources Department",
        status="Ecological Buffer"
    ),
    Parcel(
        id="P-103",
        name="Godavari Riverine Commercial Hub",
        zone_type="Commercial",
        coordinates=[
            [16.9890, 81.7800],
            [17.0050, 81.7800],
            [17.0050, 81.8010],
            [16.9890, 81.8010]
        ],
        area_hectares=64.0,
        mean_elevation_m=12.8,
        mean_slope_deg=1.9,
        soil_type="Compacted Riverine Silt & Clay",
        groundwater_depth_m=3.5,
        flood_zone="A", # 100-year flood zone
        distance_to_highway_m=150.0,
        distance_to_hospital_m=1450.0,
        distance_to_waterway_m=380.0,
        impervious_surface_ratio=0.62,
        ndvi_green_index=0.22,
        land_price_estimate_sqm=28000.0,
        owner_class="Andhra Pradesh Maritime & Port Authority",
        status="Redevelopment Zone"
    ),
    Parcel(
        id="P-104",
        name="Kochi Vembanad Estuary Buffer",
        zone_type="Residential",
        coordinates=[
            [9.9312, 76.2673],
            [9.9480, 76.2673],
            [9.9480, 76.2890],
            [9.9312, 76.2890]
        ],
        area_hectares=55.4,
        mean_elevation_m=8.0,
        mean_slope_deg=3.4,
        soil_type="Hydromorphic Coastal Saline Loam",
        groundwater_depth_m=2.0,
        flood_zone="X",
        distance_to_highway_m=950.0,
        distance_to_hospital_m=2100.0,
        distance_to_waterway_m=280.0,
        impervious_surface_ratio=0.22,
        ndvi_green_index=0.71,
        land_price_estimate_sqm=22000.0,
        owner_class="Kochi Municipal Authority Trust",
        status="Under Coastal Regulation Review"
    ),
    Parcel(
        id="P-105",
        name="Gulf of Khambhat Industrial Corridor",
        zone_type="Industrial",
        coordinates=[
            [21.7050, 72.9950],
            [21.7220, 72.9950],
            [21.7220, 73.0180],
            [21.7050, 73.0180]
        ],
        area_hectares=78.5,
        mean_elevation_m=7.2,
        mean_slope_deg=1.1,
        soil_type="Saline Marine Silt Loam & Sand",
        groundwater_depth_m=2.9,
        flood_zone="AE",
        distance_to_highway_m=300.0,
        distance_to_hospital_m=2800.0,
        distance_to_waterway_m=210.0,
        impervious_surface_ratio=0.74,
        ndvi_green_index=0.15,
        land_price_estimate_sqm=18500.0,
        owner_class="Gujarat Industrial Development Corporation",
        status="Active Logistics Corridor"
    )
]

class SpatialService:
    @staticmethod
    def get_all_parcels() -> List[Parcel]:
        return DEMO_PARCELS

    @staticmethod
    def get_parcel_by_id(parcel_id: str) -> Optional[Parcel]:
        for p in DEMO_PARCELS:
            if p.id.lower() == parcel_id.lower():
                return p
        return None

    @staticmethod
    def calculate_polygon_metrics(coords: List[List[float]]) -> Dict[str, float]:
        """
        Calculates area in sq meters, hectares, perimeter in meters, and centroid from [[lat, lng], ...]
        Uses geodesic ellipsoidal approximation.
        """
        if len(coords) < 3:
            return {"area_sqm": 0.0, "area_hectares": 0.0, "perimeter_m": 0.0, "lat": 0.0, "lng": 0.0}

        # Convert lat/lng to approximate meters from reference center
        ref_lat = sum(c[0] for c in coords) / len(coords)
        ref_lng = sum(c[1] for c in coords) / len(coords)

        # 1 deg lat ~ 111,139 m, 1 deg lng ~ 111,139 * cos(lat)
        m_per_lat = 111139.0
        m_per_lng = 111139.0 * math.cos(math.radians(ref_lat))

        poly_pts = [((c[1] - ref_lng) * m_per_lng, (c[0] - ref_lat) * m_per_lat) for c in coords]
        poly = Polygon(poly_pts)

        area_sqm = abs(poly.area)
        perimeter_m = poly.length
        area_ha = area_sqm / 10000.0

        return {
            "area_sqm": round(area_sqm, 2),
            "area_hectares": round(area_ha, 2),
            "perimeter_m": round(perimeter_m, 2),
            "centroid_lat": round(ref_lat, 6),
            "centroid_lng": round(ref_lng, 6)
        }

    @staticmethod
    def synthesize_custom_polygon_parcel(coords: List[List[float]], name: str = "Custom User Polygon") -> Parcel:
        metrics = SpatialService.calculate_polygon_metrics(coords)
        c_lat = metrics["centroid_lat"]
        c_lng = metrics["centroid_lng"]

        # Synthesize realistic environmental attributes from elevation and distance model
        # Higher elevation towards North/West hills, lower near Bay East/South
        elev = max(2.0, 150.0 * (c_lat - 37.74) / 0.06 - 120.0 * (c_lng + 122.40) / 0.08)
        elev = min(280.0, max(2.5, elev))
        slope = 3.0 + 18.0 * (elev / 280.0)

        dist_water = max(80.0, 4000.0 * (c_lng + 122.38) ** 2 + 200.0)
        dist_hosp = max(500.0, math.sqrt((c_lat - 37.78)**2 + (c_lng + 122.41)**2) * 111000)

        f_zone = "AE" if elev < 8.0 else ("A" if elev < 18.0 else "X")

        return Parcel(
            id=f"CUSTOM-{int(abs(c_lat*1000))}",
            name=name,
            zone_type="Custom Study Area",
            coordinates=coords,
            area_hectares=metrics["area_hectares"],
            mean_elevation_m=round(elev, 1),
            mean_slope_deg=round(slope, 1),
            soil_type="Alluvial Loam / Sub-surface Silt" if elev < 20 else "Compacted Sandy Clay with Bedrock",
            groundwater_depth_m=round(max(1.2, elev * 0.18), 1),
            flood_zone=f_zone,
            distance_to_highway_m=round(min(2500.0, max(120.0, (c_lat - 37.77)**2 * 50000 + 350)), 1),
            distance_to_hospital_m=round(dist_hosp, 1),
            distance_to_waterway_m=round(dist_water, 1),
            impervious_surface_ratio=round(0.25 if elev > 30 else 0.45, 2),
            ndvi_green_index=round(0.68 if elev > 40 else 0.35, 2),
            land_price_estimate_sqm=round(420.0 - elev * 0.4, 2),
            owner_class="User Drawn Query",
            status="Custom Simulation Area"
        )
