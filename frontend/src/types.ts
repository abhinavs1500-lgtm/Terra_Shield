export type ThemeName = 'holocore' | 'orbital-command' | 'satellite-intel' | 'neo-cyber' | 'clarity-analytics';

export type UserRole = 'Citizen' | 'Urban Planner' | 'Emergency Director' | 'Environmental Researcher' | 'System Admin';

export type NavigationModule = 
  | 'landing'
  | 'overview'
  | 'map'
  | 'digital-twin'
  | 'land'
  | 'hazard'
  | 'simulator'
  | 'infrastructure'
  | 'damage'
  | 'recovery'
  | 'environmental'
  | 'research-lab'
  | 'reports'
  | 'data-sources'
  | 'settings';

export interface Parcel {
  id: string;
  name: string;
  zone_type: string;
  coordinates: number[][]; // [[lat, lng], ...]
  area_hectares: number;
  mean_elevation_m: number;
  mean_slope_deg: number;
  soil_type: string;
  groundwater_depth_m: number;
  flood_zone: string;
  distance_to_highway_m: number;
  distance_to_hospital_m: number;
  distance_to_waterway_m: number;
  impervious_surface_ratio: number;
  ndvi_green_index: number;
  land_price_estimate_sqm: number;
  owner_class: string;
  status: string;
}

export interface FactorScore {
  factor_name: string;
  raw_value: string | number;
  unit: string;
  normalized_score: number;
  weight: number;
  weighted_score: number;
  assessment: string;
  recommendation: string;
  data_source: string;
  confidence: number;
}

export interface CriteriaWeights {
  slope_weight: number;
  flood_risk_weight: number;
  soil_quality_weight: number;
  road_accessibility_weight: number;
  water_proximity_weight: number;
  hospital_proximity_weight: number;
}

export interface SuitabilityAssessmentResponse {
  parcel_id: string;
  parcel_name: string;
  profile: string;
  overall_suitability_score: number;
  suitability_class: string;
  factors: FactorScore[];
  development_constraints: string[];
  mitigation_recommendations: string[];
  sensitivity_analysis: Record<string, number>;
  radar_metrics: Record<string, number>;
  legal_disclaimer: string;
}

export interface HazardExposureMetric {
  hazard_type: string;
  risk_level: string;
  score: number;
  primary_driver: string;
  historical_frequency: string;
  return_period_years?: number;
  data_source: string;
  observation_date: string;
  uncertainty_margin: number;
  mitigation_strategy: string;
}

export interface MultiHazardReport {
  location_name: string;
  coordinates: number[];
  composite_hazard_index: number;
  overall_threat_level: string;
  hazards: HazardExposureMetric[];
  overlapping_hazards: string[];
  historical_events_nearby: any[];
  evacuation_route_status: string;
  radar_data: { hazard: string; score: number; benchmark: number }[];
  timestamp: string;
  is_hypothetical: boolean;
}

export interface ScenarioParameters {
  scenario_id: string;
  name: string;
  hazard_type: string;
  rainfall_intensity_mm_hr: number;
  duration_hours: number;
  surge_height_m: number;
  tide_level_m: number;
  soil_saturation_pct: number;
  drainage_efficiency_pct: number;
  disrupted_bridges_roads: string[];
}

export interface TimeStepResult {
  step_hour: number;
  flood_extent_sqkm: number;
  max_water_depth_m: number;
  mean_water_depth_m: number;
  inundated_buildings_count: number;
  inundated_road_km: number;
  isolated_facilities: string[];
  population_impacted: number;
  active_inundation_contours: any[];
}

export interface SimulationRunResult {
  scenario_id: string;
  scenario_name: string;
  hazard_type: string;
  status: string;
  total_timesteps: number;
  peak_hour: number;
  peak_flood_extent_sqkm: number;
  peak_impacted_population: number;
  submerged_critical_nodes: any[];
  disrupted_road_segments: any[];
  timesteps: TimeStepResult[];
  execution_time_ms: number;
}

export interface InfraNode {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  elevation_m: number;
  capacity: number;
  population_served: number;
  criticality_tier: number;
  status: string;
  backup_power_hrs: number;
  flood_threshold_m: number;
  dependencies: string[];
}

export interface InfraEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  capacity_mw_or_flow: number;
  length_km: number;
  status: string;
  is_bottleneck?: boolean;
}

export interface InfrastructureGraphData {
  nodes: InfraNode[];
  edges: InfraEdge[];
  total_nodes: number;
  total_edges: number;
  network_health_pct: number;
  isolated_node_ids: string[];
  critical_path_bottlenecks: string[];
}

export interface DisruptionSimulationResponse {
  initial_failures: string[];
  cascading_failures: any[];
  total_offline_nodes: number;
  total_population_lost_power: number;
  total_population_lost_water: number;
  hospitals_at_risk: any[];
  alternative_detours: any[];
  recommended_reinforcements: string[];
}

export interface DamageReportItem {
  id: string;
  title: string;
  asset_type: string;
  lat: number;
  lng: number;
  address: string;
  severity_grade: string;
  confidence_score: number;
  verification_status: string;
  detection_method: string;
  image_before_url?: string;
  image_after_url?: string;
  structural_damage_pct: number;
  reported_at: string;
  verified_by?: string | null;
  notes: string;
}

export interface RecoveryTask {
  id: string;
  name: string;
  target_asset_id: string;
  target_asset_name: string;
  category: string;
  cost_usd: number;
  duration_days: number;
  crews_required: number;
  population_restored: number;
  criticality_weight: number;
  prerequisites: string[];
  priority_score?: number;
  status: string;
}

export interface ScheduledTask {
  task: RecoveryTask;
  start_day: number;
  end_day: number;
  crew_assigned: number;
  cumulative_cost: number;
  cumulative_population_restored: number;
  why_prioritized: string;
}

export interface RecoveryPlanResponse {
  plan_id: string;
  strategy: string;
  total_cost_usd: number;
  budget_utilized_pct: number;
  total_population_restored: number;
  total_duration_days: number;
  crews_used: number;
  selected_tasks_count: number;
  unfunded_tasks_count: number;
  schedule: ScheduledTask[];
  unfunded_tasks: RecoveryTask[];
  pareto_tradeoffs: any[];
}

export interface MLModelBenchmark {
  model_name: string;
  model_family: string;
  accuracy: number;
  precision_macro: number;
  recall_macro: number;
  f1_score: number;
  roc_auc: number;
  inference_latency_ms: number;
  training_sample_count: number;
  validation_strategy: string;
}

export interface MLResearchLabReport {
  benchmark_timestamp: string;
  target_task: string;
  models: MLModelBenchmark[];
  confusion_matrix: number[][];
  classes: string[];
  feature_importances: { feature: string; importance: number; percentage: number }[];
  dataset_quality_score: number;
  missing_data_pct: number;
  spatial_autocorrelation_moran_i: number;
  recommendation: string;
}

export interface SourceCitation {
  dataset_name: string;
  provider: string;
  observation_date: string;
  is_real_data: boolean;
  citation_url?: string;
  relevance_note: string;
}

export interface AssistantQueryResponse {
  answer: string;
  sources: SourceCitation[];
  suggested_actions: { label: string; action: string }[];
  confidence_score: number;
  data_freshness_warning?: string | null;
  is_hypothetical_context: boolean;
}
