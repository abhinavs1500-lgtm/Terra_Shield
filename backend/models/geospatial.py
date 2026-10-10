from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class Coordinates(BaseModel):
    lat: float
    lng: float
    elevation: Optional[float] = None

class BoundingBox(BaseModel):
    min_lat: float
    min_lng: float
    max_lat: float
    max_lng: float

class GeoPolygon(BaseModel):
    id: str
    name: Optional[str] = "Unnamed Polygon"
    coordinates: List[List[float]] # [[lat, lng], ...]
    area_sqm: Optional[float] = None
    area_hectares: Optional[float] = None
    perimeter_m: Optional[float] = None

class Parcel(BaseModel):
    id: str
    name: str
    zone_type: str # Residential, Commercial, Industrial, Agricultural, Conservation
    coordinates: List[List[float]]
    area_hectares: float
    mean_elevation_m: float
    mean_slope_deg: float
    soil_type: str
    groundwater_depth_m: float
    flood_zone: str # X (Low), A (High 100-yr), AE (100-yr base), VE (Coastal)
    distance_to_highway_m: float
    distance_to_hospital_m: float
    distance_to_waterway_m: float
    impervious_surface_ratio: float
    ndvi_green_index: float
    land_price_estimate_sqm: float
    owner_class: str
    status: str

class MapLayerMetadata(BaseModel):
    id: str
    name: str
    category: str
    description: str
    source: str
    freshness: str
    opacity: float = 0.8
    visible: bool = True
    color_scale: Optional[List[Dict[str, Any]]] = None
