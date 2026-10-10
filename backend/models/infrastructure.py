from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class InfraNode(BaseModel):
    id: str
    name: str
    type: str # hospital, power_substation, water_treatment, telecom_tower, bridge, emergency_shelter, evacuation_hub
    lat: float
    lng: float
    elevation_m: float
    capacity: int
    population_served: int
    criticality_tier: int # 1 (Critical), 2 (High), 3 (Standard)
    status: str # operational, degraded, offline, isolated
    backup_power_hrs: float
    flood_threshold_m: float
    dependencies: List[str] = [] # list of node IDs it depends on

class InfraEdge(BaseModel):
    id: str
    source: str
    target: str
    type: str # road, electrical_grid, water_pipeline, telecom_fiber
    capacity_mw_or_flow: float
    length_km: float
    status: str # open, flooded, structural_damage, impassable
    is_bottleneck: bool = False

class InfrastructureGraphData(BaseModel):
    nodes: List[InfraNode]
    edges: List[InfraEdge]
    total_nodes: int
    total_edges: int
    network_health_pct: float
    isolated_node_ids: List[str]
    critical_path_bottlenecks: List[str]

class DisruptionSimulationRequest(BaseModel):
    disabled_node_ids: List[str] = []
    disabled_edge_ids: List[str] = []

class DisruptionSimulationResponse(BaseModel):
    initial_failures: List[str]
    cascading_failures: List[Dict[str, Any]]
    total_offline_nodes: int
    total_population_lost_power: int
    total_population_lost_water: int
    hospitals_at_risk: List[Dict[str, Any]]
    alternative_detours: List[Dict[str, Any]]
    recommended_reinforcements: List[str]
