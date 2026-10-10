import {
  Parcel,
  SuitabilityAssessmentResponse,
  MultiHazardReport,
  ScenarioParameters,
  SimulationRunResult,
  InfrastructureGraphData,
  DisruptionSimulationResponse,
  DamageReportItem,
  RecoveryPlanResponse,
  RecoveryTask,
  MLResearchLabReport
} from '../types';

// ============================================================================
// 1. STRATEGIC MONITORED PARCELS (INDIA BASIN)
// ============================================================================
export const FALLBACK_PARCELS: Parcel[] = [
  {
    id: 'P-101',
    name: 'Mumbai Coastal & Mithi Basin Sector A',
    zone_type: 'Residential',
    coordinates: [
      [19.0760, 72.8777],
      [19.0880, 72.8777],
      [19.0880, 72.8920],
      [19.0760, 72.8920]
    ],
    area_hectares: 48.2,
    mean_elevation_m: 14.5,
    mean_slope_deg: 2.2,
    soil_type: 'Coastal Alluvial Sand with Basaltic Base',
    groundwater_depth_m: 4.2,
    flood_zone: 'X',
    distance_to_highway_m: 420.0,
    distance_to_hospital_m: 1100.0,
    distance_to_waterway_m: 1400.0,
    impervious_surface_ratio: 0.38,
    ndvi_green_index: 0.48,
    land_price_estimate_sqm: 35000.0,
    owner_class: 'Municipal Corporation of Greater Mumbai',
    status: 'Available for Evaluation'
  },
  {
    id: 'P-102',
    name: 'Mahanadi Delta Lowlands Sector B',
    zone_type: 'Agricultural / Conservation',
    coordinates: [
      [20.2960, 85.8240],
      [20.3120, 85.8240],
      [20.3120, 85.8450],
      [20.2960, 85.8450]
    ],
    area_hectares: 92.6,
    mean_elevation_m: 4.1,
    mean_slope_deg: 0.8,
    soil_type: 'Alluvial Silt & Heavy Marine Clay',
    groundwater_depth_m: 1.8,
    flood_zone: 'AE',
    distance_to_highway_m: 1800.0,
    distance_to_hospital_m: 3400.0,
    distance_to_waterway_m: 120.0,
    impervious_surface_ratio: 0.06,
    ndvi_green_index: 0.79,
    land_price_estimate_sqm: 12500.0,
    owner_class: 'Odisha Water Resources Department',
    status: 'Ecological Buffer'
  },
  {
    id: 'P-103',
    name: 'Godavari Riverine Commercial Hub',
    zone_type: 'Commercial',
    coordinates: [
      [16.9890, 81.7800],
      [17.0050, 81.7800],
      [17.0050, 81.8010],
      [16.9890, 81.8010]
    ],
    area_hectares: 64.0,
    mean_elevation_m: 12.8,
    mean_slope_deg: 1.9,
    soil_type: 'Compacted Riverine Silt & Clay',
    groundwater_depth_m: 3.5,
    flood_zone: 'A',
    distance_to_highway_m: 150.0,
    distance_to_hospital_m: 1450.0,
    distance_to_waterway_m: 380.0,
    impervious_surface_ratio: 0.62,
    ndvi_green_index: 0.22,
    land_price_estimate_sqm: 28000.0,
    owner_class: 'Andhra Pradesh Maritime & Port Authority',
    status: 'Redevelopment Zone'
  },
  {
    id: 'P-104',
    name: 'Kochi Vembanad Estuary Buffer',
    zone_type: 'Residential',
    coordinates: [
      [9.9312, 76.2673],
      [9.9480, 76.2673],
      [9.9480, 76.2890],
      [9.9312, 76.2890]
    ],
    area_hectares: 55.4,
    mean_elevation_m: 8.0,
    mean_slope_deg: 3.4,
    soil_type: 'Hydromorphic Coastal Saline Loam',
    groundwater_depth_m: 2.0,
    flood_zone: 'X',
    distance_to_highway_m: 950.0,
    distance_to_hospital_m: 2100.0,
    distance_to_waterway_m: 280.0,
    impervious_surface_ratio: 0.22,
    ndvi_green_index: 0.71,
    land_price_estimate_sqm: 22000.0,
    owner_class: 'Kochi Municipal Authority Trust',
    status: 'Under Coastal Regulation Review'
  },
  {
    id: 'P-105',
    name: 'Gulf of Khambhat Industrial Corridor',
    zone_type: 'Industrial',
    coordinates: [
      [21.7050, 72.9950],
      [21.7220, 72.9950],
      [21.7220, 73.0180],
      [21.7050, 73.0180]
    ],
    area_hectares: 78.5,
    mean_elevation_m: 7.2,
    mean_slope_deg: 1.1,
    soil_type: 'Saline Marine Silt Loam & Sand',
    groundwater_depth_m: 2.9,
    flood_zone: 'AE',
    distance_to_highway_m: 300.0,
    distance_to_hospital_m: 2800.0,
    distance_to_waterway_m: 210.0,
    impervious_surface_ratio: 0.74,
    ndvi_green_index: 0.15,
    land_price_estimate_sqm: 18500.0,
    owner_class: 'Gujarat Industrial Development Corporation',
    status: 'Active Logistics Corridor'
  }
];

// ============================================================================
// 2. LAND SUITABILITY EVALUATION (MCDA AHP)
// ============================================================================
export const FALLBACK_SUITABILITY: SuitabilityAssessmentResponse = {
  parcel_id: 'P-101',
  parcel_name: 'Mumbai Coastal & Mithi Basin Sector A',
  profile: 'residential',
  overall_suitability_score: 82.0,
  suitability_class: 'Highly Suitable',
  factors: [
    {
      factor_name: 'Topographical Slope Stability',
      raw_value: '2.2° gradient',
      unit: 'degrees',
      normalized_score: 95.0,
      weight: 0.20,
      weighted_score: 19.0,
      assessment: 'Gentle gradient well within the optimal 0-5° threshold for low-cost construction and standard foundation stability.',
      recommendation: 'Standard slab foundation; no deep terracing or retention piles required.',
      data_source: 'SRTM 30m Digital Elevation Model',
      confidence: 0.94
    },
    {
      factor_name: 'Hydrological Flood Exposure',
      raw_value: 'Zone X (Minimal)',
      unit: 'FEMA designation',
      normalized_score: 85.0,
      weight: 0.25,
      weighted_score: 21.25,
      assessment: 'Located in unshaded Zone X, outside the 100-year and 500-year base flood elevations.',
      recommendation: 'Incorporate on-site bio-swales and standard 0.5m plinth elevation.',
      data_source: 'FEMA National Flood Hazard Layer (NFHL)',
      confidence: 0.96
    },
    {
      factor_name: 'Soil Structural Load Integrity',
      raw_value: 'Coastal Alluvial Sand with Basaltic Base',
      unit: 'geotechnical class',
      normalized_score: 75.0,
      weight: 0.15,
      weighted_score: 11.25,
      assessment: 'Adequate load-bearing strength at 3m depth; minor groundwater saturation during peak monsoon.',
      recommendation: 'Geotechnical core borings recommended prior to structural engineering sign-off.',
      data_source: 'Geological Survey of India Lithology Dataset',
      confidence: 0.88
    },
    {
      factor_name: 'Arterial Road Accessibility',
      raw_value: '420 meters to SH Corridor',
      unit: 'meters',
      normalized_score: 90.0,
      weight: 0.15,
      weighted_score: 13.5,
      assessment: 'Direct connectivity to State Highway corridor via two multi-lane ingress connectors.',
      recommendation: 'Dedicate dedicated turning lanes and emergency vehicle passing zones.',
      data_source: 'OpenStreetMap Road Topology & Highway Authority',
      confidence: 0.98
    },
    {
      factor_name: 'Potable Water Network Proximity',
      raw_value: '1400 meters to Municipal Main',
      unit: 'meters',
      normalized_score: 70.0,
      weight: 0.10,
      weighted_score: 7.0,
      assessment: 'Requires secondary municipal trunk water line extension along eastern boundary.',
      recommendation: 'Coordinate extension with local water utility during Phase 1 site prep.',
      data_source: 'Municipal Water Works Infrastructure Map',
      confidence: 0.91
    },
    {
      factor_name: 'Emergency Medical Care Proximity',
      raw_value: '1100 meters (5 min transit)',
      unit: 'meters',
      normalized_score: 88.0,
      weight: 0.15,
      weighted_score: 13.2,
      assessment: 'Direct corridor to District Trauma Center and secondary medical clinics.',
      recommendation: 'Maintain unobstructed secondary egress onto north arterial corridor.',
      data_source: 'Health Department Geospatial Registry',
      confidence: 0.95
    }
  ],
  development_constraints: [
    'Seasonal water table rise to 2.4m depth during peak monsoon months (July-August).',
    '30-meter buffer strip required along south boundary bordering municipal utility right-of-way.',
    'Maximum building height restricted to 45m due to coastal approach radar clearance.'
  ],
  mitigation_recommendations: [
    'Install perimeter perforated subsoil drainage tiles routed to municipal stormwater retention.',
    'Elevate ground floor finished floor level (FFL) 600mm above finished street grade.',
    'Permeable interlocking concrete pavers across parking surfaces to facilitate infiltration.'
  ],
  sensitivity_analysis: {
    slope_variation_impact: 0.08,
    flood_risk_variation_impact: 0.18,
    soil_quality_variation_impact: 0.11,
    road_accessibility_variation_impact: 0.09,
    water_proximity_variation_impact: 0.06,
    hospital_proximity_variation_impact: 0.08
  },
  radar_metrics: {
    'Topography & Slope': 95.0,
    'Flood Safety': 85.0,
    'Soil Integrity': 75.0,
    'Road Access': 90.0,
    'Water Grid Reach': 70.0,
    'Medical Proximity': 88.0
  },
  legal_disclaimer: 'Preliminary decision support assessment generated with AHP MCDA modeling. Not a formal geotechnical or legal land certification.'
};

// ============================================================================
// 3. MULTI-HAZARD INTELLIGENCE REPORT
// ============================================================================
export const FALLBACK_HAZARD: MultiHazardReport = {
  location_name: 'Mumbai Coastal & Mithi Basin Sector A (P-101)',
  coordinates: [19.0760, 72.8777],
  composite_hazard_index: 53.0,
  overall_threat_level: 'Elevated Hazard Vulnerability',
  hazards: [
    {
      hazard_type: 'Flood & Coastal Surge',
      risk_level: 'Moderate',
      score: 52.0,
      primary_driver: 'Proximity to tidal estuarine channel and high tide stormwater backflow potential.',
      historical_frequency: '100-Year Event (1% annual chance)',
      return_period_years: 100,
      data_source: 'FEMA NFHL & NOAA Sea Level Rise Inundation Models',
      observation_date: '2024 Q3',
      uncertainty_margin: 12.0,
      mitigation_strategy: 'Plinth elevation and backflow flap gates on stormwater discharge conduits.'
    },
    {
      hazard_type: 'Pluvial Drainage Overload',
      risk_level: 'High',
      score: 68.0,
      primary_driver: 'High soil saturation index coupled with urban runoff coefficient from surrounding density.',
      historical_frequency: 'Occurs every 2-3 years during cloudburst monsoon events',
      return_period_years: 5,
      data_source: 'Indian Meteorological Department 24h Precipitation Maximums',
      observation_date: '2024 Q3',
      uncertainty_margin: 10.0,
      mitigation_strategy: 'Dual underground retention cisterns with automatic submersible de-watering pumps.'
    },
    {
      hazard_type: 'Slope Failure & Landslide',
      risk_level: 'Very Low',
      score: 14.0,
      primary_driver: 'Flat coastal alluvial topography with average slope < 2.5°.',
      historical_frequency: 'No historical slope failures recorded in district registry',
      return_period_years: 500,
      data_source: 'USGS Landslide Hazard Susceptibility Database',
      observation_date: '2024',
      uncertainty_margin: 5.0,
      mitigation_strategy: 'Standard slope toe turf reinforcement.'
    },
    {
      hazard_type: 'Seismic Liquefaction',
      risk_level: 'Moderate',
      score: 48.0,
      primary_driver: 'Seismic Zone III (Moderate Damage Risk) with unconsolidated sand lenses.',
      historical_frequency: 'Peak Ground Acceleration (PGA) 0.16g for 475-year return period',
      return_period_years: 475,
      data_source: 'National Disaster Management Authority (NDMA) Seismic Zoning',
      observation_date: '2024',
      uncertainty_margin: 8.0,
      mitigation_strategy: 'Deep compaction grouting or pile foundations anchored to basalt bedrock.'
    },
    {
      hazard_type: 'Wildfire (WUI)',
      risk_level: 'Very Low',
      score: 16.0,
      primary_driver: 'Urbanized perimeter with low wildland vegetative fuel density.',
      historical_frequency: 'Minimal wildfire exposure',
      return_period_years: 100,
      data_source: 'State Fire Service Spatial Hazard Registry',
      observation_date: '2024',
      uncertainty_margin: 6.0,
      mitigation_strategy: 'Standard municipal fire hydrant spacing.'
    }
  ],
  overlapping_hazards: ['Flood & Coastal Surge', 'Pluvial Drainage Overload'],
  historical_events_nearby: [
    {
      id: 'HIST-2005-MUMBAI',
      title: '2005 Mumbai Coastal Cloudburst Deluge',
      date: 'July 2005',
      type: 'Extreme Rainfall & Urban Inundation',
      severity: 'Severe (National Emergency)',
      peak_precipitation_24h_mm: 944.0,
      damage_est_usd: '₹3,200 Cr',
      summary: 'Record 944mm rainfall overwhelmed Mithi River basin drainage and submerged low-lying suburban corridors.'
    },
    {
      id: 'HIST-1999-ODISHA',
      title: '1999 Odisha Super Cyclone & Storm Surge',
      date: 'October 1999',
      type: 'Coastal Storm Surge & Inundation',
      severity: 'Category 5 Equivalent',
      peak_surge_height_m: 6.8,
      damage_est_usd: '₹4,500 Cr',
      summary: 'Destructive 260 km/h wind shear and 7-meter tidal surge devastated deltaic agricultural lowlands.'
    }
  ],
  evacuation_route_status: 'Clear: Eastern Expressway (Hwy 101 Link) Unimpeded',
  radar_data: [
    { hazard: 'Flood / Surge', score: 52.0, benchmark: 40.0 },
    { hazard: 'Pluvial Drainage', score: 68.0, benchmark: 35.0 },
    { hazard: 'Landslide', score: 14.0, benchmark: 25.0 },
    { hazard: 'Seismic / Soil', score: 48.0, benchmark: 50.0 },
    { hazard: 'Wildfire', score: 16.0, benchmark: 30.0 }
  ],
  timestamp: new Date().toISOString(),
  is_hypothetical: false
};

// ============================================================================
// 4. DISASTER SCENARIO SIMULATOR (18-HOUR HYDROGRAPH)
// ============================================================================
export const FALLBACK_SIMULATION_PRESETS: ScenarioParameters[] = [
  {
    scenario_id: 'PRESET-100YR-DELUGE',
    name: '100-Year Monsoon Cloudburst (75mm/hr)',
    description: 'Extreme monsoon deluge with 90% soil saturation and saturated storm drains.',
    hazard_type: 'flood',
    rainfall_intensity_mm_hr: 75.0,
    duration_hours: 18,
    surge_height_m: 2.8,
    tide_level_m: 1.4,
    soil_saturation_pct: 90.0,
    drainage_efficiency_pct: 50.0,
    disrupted_bridges_roads: ['BRG-01', 'RD-01']
  },
  {
    scenario_id: 'PRESET-CYCLONE-SURGE',
    name: 'Category 3 Cyclone Michaung Storm Surge (3.8m)',
    description: 'Tidal storm surge combined with gale-force coastal backflow overtopping sea walls.',
    hazard_type: 'storm_surge',
    rainfall_intensity_mm_hr: 45.0,
    duration_hours: 12,
    surge_height_m: 3.8,
    tide_level_m: 1.9,
    soil_saturation_pct: 85.0,
    drainage_efficiency_pct: 35.0,
    disrupted_bridges_roads: ['BRG-01', 'BRG-02', 'RD-04']
  },
  {
    scenario_id: 'PRESET-FLASH-FLOOD',
    name: 'Rapid Urban Flash Inundation (110mm/hr)',
    description: 'Intense short-duration cloudburst overtopping drainage infrastructure within 3 hours.',
    hazard_type: 'flood',
    rainfall_intensity_mm_hr: 110.0,
    duration_hours: 8,
    surge_height_m: 1.2,
    tide_level_m: 0.8,
    soil_saturation_pct: 95.0,
    drainage_efficiency_pct: 20.0,
    disrupted_bridges_roads: ['RD-02']
  }
];

export const FALLBACK_SIMULATION_RESULT: SimulationRunResult = {
  scenario_id: 'SIM-RUN-DEFAULT',
  scenario_name: '100-Year Monsoon Cloudburst Simulation',
  hazard_type: 'flood',
  status: 'completed',
  total_timesteps: 18,
  peak_hour: 12,
  peak_flood_extent_sqkm: 10.4,
  peak_impacted_population: 34500,
  submerged_critical_nodes: [
    { id: 'ELEC-01', name: 'Bandra-Kurla 400kV Primary Substation', type: 'Power Substation', elev_m: 4.2, pop: 120000 },
    { id: 'WAT-01', name: 'Bhandup Water Works & Master Pumping', type: 'Water Facility', elev_m: 8.5, pop: 180000 },
    { id: 'BRG-01', name: 'Bandra-Worli Coastal Sea Link (Marine Causeway)', type: 'Bridge', elev_m: 6.5, pop: 65000 }
  ],
  disrupted_road_segments: [
    { id: 'RD-01', name: 'Coastal Expressway (Mile 14.2)', elev_m: 3.2, length_km: 6.4 },
    { id: 'RD-02', name: 'Delta Harbor Arterial Boulevard', elev_m: 4.1, length_km: 4.2 }
  ],
  execution_time_ms: 420,
  timesteps: Array.from({ length: 18 }, (_, idx) => {
    const h = idx + 1;
    const factor = h <= 12 ? Math.sin((h / 12) * (Math.PI / 2)) : Math.cos(((h - 12) / 6) * (Math.PI / 2));
    const normalizedFactor = Math.max(0.18, factor);
    const extent = parseFloat((1.4 + normalizedFactor * 9.0).toFixed(2));
    const maxDepth = parseFloat((normalizedFactor * 2.85).toFixed(2));
    const meanDepth = parseFloat((maxDepth * 0.48).toFixed(2));
    const bldgs = Math.round(extent * 175);
    const pop = Math.round(bldgs * 19);

    return {
      step_hour: h,
      flood_extent_sqkm: extent,
      max_water_depth_m: maxDepth,
      mean_water_depth_m: meanDepth,
      inundated_buildings_count: bldgs,
      inundated_road_km: parseFloat((extent * 1.8).toFixed(1)),
      population_impacted: pop,
      isolated_facilities: h >= 8 ? ['Bayside Substation', 'Wastewater Station'] : [],
      active_inundation_contours: []
    };
  })
};

// ============================================================================
// 5. CRITICAL INFRASTRUCTURE GRAPH (NETWORKX TOPOLOGY)
// ============================================================================
export const FALLBACK_INFRASTRUCTURE_GRAPH: InfrastructureGraphData = {
  total_nodes: 10,
  total_edges: 15,
  network_health_pct: 100.0,
  isolated_node_ids: [],
  critical_path_bottlenecks: ['ELEC-01', 'WAT-01', 'BRG-01'],
  nodes: [
    {
      id: 'ELEC-01',
      name: 'Bandra-Kurla 400kV Primary Substation',
      type: 'power_substation',
      lat: 19.0650,
      lng: 72.8680,
      elevation_m: 4.2,
      capacity: 450,
      population_served: 120000,
      criticality_tier: 1,
      status: 'operational',
      backup_power_hrs: 0.0,
      flood_threshold_m: 1.2,
      dependencies: []
    },
    {
      id: 'ELEC-02',
      name: 'North Mumbai Grid Secondary Hub',
      type: 'power_substation',
      lat: 19.1850,
      lng: 72.9550,
      elevation_m: 42.0,
      capacity: 250,
      population_served: 45000,
      criticality_tier: 2,
      status: 'operational',
      backup_power_hrs: 0.0,
      flood_threshold_m: 5.0,
      dependencies: ['ELEC-01']
    },
    {
      id: 'WAT-01',
      name: 'Bhandup Water Works & Master Pumping',
      type: 'water_treatment',
      lat: 19.1550,
      lng: 72.9350,
      elevation_m: 8.5,
      capacity: 80,
      population_served: 180000,
      criticality_tier: 1,
      status: 'operational',
      backup_power_hrs: 8.0,
      flood_threshold_m: 0.8,
      dependencies: ['ELEC-01']
    },
    {
      id: 'WAT-02',
      name: 'Powai Potable Water Reservoir Hub',
      type: 'water_treatment',
      lat: 19.1200,
      lng: 72.9100,
      elevation_m: 65.0,
      capacity: 120,
      population_served: 90000,
      criticality_tier: 2,
      status: 'operational',
      backup_power_hrs: 24.0,
      flood_threshold_m: 8.0,
      dependencies: ['ELEC-02']
    },
    {
      id: 'HOSP-01',
      name: 'Tata Memorial Hospital & Trauma Center',
      type: 'hospital',
      lat: 19.0050,
      lng: 72.8420,
      elevation_m: 16.5,
      capacity: 650,
      population_served: 85000,
      criticality_tier: 1,
      status: 'operational',
      backup_power_hrs: 48.0,
      flood_threshold_m: 2.5,
      dependencies: ['ELEC-01', 'WAT-01', 'BRG-01']
    },
    {
      id: 'HOSP-02',
      name: 'Apollo Coastal Emergency Center',
      type: 'hospital',
      lat: 19.0150,
      lng: 72.8350,
      elevation_m: 5.8,
      capacity: 120,
      population_served: 25000,
      criticality_tier: 2,
      status: 'operational',
      backup_power_hrs: 12.0,
      flood_threshold_m: 1.0,
      dependencies: ['ELEC-01', 'WAT-01', 'BRG-02']
    },
    {
      id: 'BRG-01',
      name: 'Bandra-Worli Coastal Sea Link',
      type: 'bridge',
      lat: 19.0350,
      lng: 72.8180,
      elevation_m: 6.5,
      capacity: 4500,
      population_served: 65000,
      criticality_tier: 1,
      status: 'operational',
      backup_power_hrs: 0.0,
      flood_threshold_m: 1.5,
      dependencies: []
    },
    {
      id: 'BRG-02',
      name: 'Eastern Freeway Coastal Elevated Viaduct',
      type: 'bridge',
      lat: 19.0200,
      lng: 72.8600,
      elevation_m: 7.8,
      capacity: 3200,
      population_served: 40000,
      criticality_tier: 2,
      status: 'operational',
      backup_power_hrs: 0.0,
      flood_threshold_m: 1.8,
      dependencies: []
    },
    {
      id: 'TEL-01',
      name: 'Central Telecommunications & 5G Hub',
      type: 'telecom_tower',
      lat: 19.0720,
      lng: 72.8750,
      elevation_m: 25.0,
      capacity: 50000,
      population_served: 150000,
      criticality_tier: 1,
      status: 'operational',
      backup_power_hrs: 36.0,
      flood_threshold_m: 4.0,
      dependencies: ['ELEC-01']
    },
    {
      id: 'SHLT-01',
      name: 'Bandra Reclamation Multi-Purpose Relief Shelter',
      type: 'emergency_shelter',
      lat: 19.0450,
      lng: 72.8250,
      elevation_m: 12.0,
      capacity: 1500,
      population_served: 8000,
      criticality_tier: 2,
      status: 'operational',
      backup_power_hrs: 18.0,
      flood_threshold_m: 3.0,
      dependencies: ['ELEC-01', 'WAT-01']
    }
  ],
  edges: [
    { id: 'E-01', source: 'ELEC-01', target: 'ELEC-02', type: 'electrical_grid', capacity_mw_or_flow: 180.0, length_km: 3.2, status: 'open', is_bottleneck: false },
    { id: 'E-02', source: 'ELEC-01', target: 'WAT-01', type: 'electrical_grid', capacity_mw_or_flow: 25.0, length_km: 2.8, status: 'open', is_bottleneck: true },
    { id: 'E-03', source: 'ELEC-01', target: 'HOSP-01', type: 'electrical_grid', capacity_mw_or_flow: 40.0, length_km: 1.8, status: 'open', is_bottleneck: false },
    { id: 'E-04', source: 'ELEC-01', target: 'HOSP-02', type: 'electrical_grid', capacity_mw_or_flow: 15.0, length_km: 1.2, status: 'open', is_bottleneck: true },
    { id: 'E-05', source: 'ELEC-01', target: 'TEL-01', type: 'electrical_grid', capacity_mw_or_flow: 12.0, length_km: 2.0, status: 'open', is_bottleneck: false },
    { id: 'E-06', source: 'ELEC-01', target: 'SHLT-01', type: 'electrical_grid', capacity_mw_or_flow: 8.0, length_km: 1.9, status: 'open', is_bottleneck: false },
    { id: 'E-07', source: 'WAT-01', target: 'HOSP-01', type: 'water_pipeline', capacity_mw_or_flow: 15.0, length_km: 2.4, status: 'open', is_bottleneck: false },
    { id: 'E-08', source: 'WAT-01', target: 'HOSP-02', type: 'water_pipeline', capacity_mw_or_flow: 8.0, length_km: 3.1, status: 'open', is_bottleneck: false },
    { id: 'E-09', source: 'WAT-01', target: 'SHLT-01', type: 'water_pipeline', capacity_mw_or_flow: 5.0, length_km: 2.1, status: 'open', is_bottleneck: false },
    { id: 'E-10', source: 'WAT-02', target: 'HOSP-01', type: 'water_pipeline', capacity_mw_or_flow: 20.0, length_km: 5.2, status: 'open', is_bottleneck: false },
    { id: 'E-11', source: 'BRG-01', target: 'HOSP-01', type: 'road', capacity_mw_or_flow: 2500.0, length_km: 2.6, status: 'open', is_bottleneck: true },
    { id: 'E-12', source: 'BRG-01', target: 'WAT-01', type: 'road', capacity_mw_or_flow: 1500.0, length_km: 1.4, status: 'open', is_bottleneck: false },
    { id: 'E-13', source: 'BRG-02', target: 'HOSP-02', type: 'road', capacity_mw_or_flow: 1800.0, length_km: 0.9, status: 'open', is_bottleneck: false },
    { id: 'E-14', source: 'TEL-01', target: 'HOSP-01', type: 'telecom_fiber', capacity_mw_or_flow: 100.0, length_km: 1.5, status: 'open', is_bottleneck: false },
    { id: 'E-15', source: 'TEL-01', target: 'SHLT-01', type: 'telecom_fiber', capacity_mw_or_flow: 50.0, length_km: 0.8, status: 'open', is_bottleneck: false }
  ]
};

export const FALLBACK_DISRUPTION: DisruptionSimulationResponse = {
  initial_failures: ['ELEC-01', 'BRG-01'],
  primary_failures_count: 2,
  cascading_failures_count: 3,
  isolated_nodes_count: 2,
  total_offline_nodes: 5,
  total_population_lost_power: 120000,
  total_population_lost_water: 180000,
  total_population_unserved: 235000,
  hospitals_at_risk: [
    { id: 'HOSP-02', name: 'Apollo Coastal Emergency Center', risk: 'Secondary water and access isolation' }
  ],
  alternative_detours: [
    {
      route: 'HOSP-01 to SHLT-01',
      detour: 'Eastern Elevated Freeway (BRG-02)',
      extra_km: 5.4,
      delay_min: 14.5
    }
  ],
  recommended_reinforcements: [
    'Install dual flood walls around Bandra-Kurla 400kV Substation',
    'Deploy auxiliary diesel booster pump for Bhandup Water Works'
  ],
  cascading_failures: [
    {
      step: 1,
      node_id: 'WAT-01',
      node_name: 'Bhandup Water Works & Master Pumping',
      node_type: 'water_treatment',
      trigger: 'Lost upstream power from Bandra-Kurla Substation (ELEC-01)',
      impact_population: 180000,
      mitigation: 'Emergency backup generator active (8.0h fuel remaining).'
    },
    {
      step: 1,
      node_id: 'TEL-01',
      node_name: 'Central Telecommunications & 5G Hub',
      node_type: 'telecom_tower',
      trigger: 'Primary grid loss from ELEC-01',
      impact_population: 150000,
      mitigation: 'Battery UPS online (36.0h battery buffer).'
    },
    {
      step: 2,
      node_id: 'HOSP-02',
      node_name: 'Apollo Coastal Emergency Center',
      node_type: 'hospital',
      trigger: 'Loss of municipal water pressure from WAT-01 and access bridge BRG-01',
      impact_population: 25000,
      mitigation: 'Water tanker dispatch requested; emergency detour via Eastern Freeway.'
    }
  ],
  alternative_routes: [
    {
      origin: 'HOSP-01',
      destination: 'SHLT-01',
      original_route_blocked: true,
      detour_summary: 'Divert via Eastern Elevated Freeway (BRG-02) to bypass inundated sea link span.',
      detour_length_km: 5.4,
      travel_time_delay_min: 14.5
    }
  ],
  system_resilience_score: 52.0
};

// ============================================================================
// 6. ENVIRONMENTAL EQUITY & CDC SOCIAL VULNERABILITY (SVI)
// ============================================================================
export const FALLBACK_ENVIRONMENTAL = {
  census_tracts: [
    {
      tract_id: 'WARD-MH-01',
      name: 'Mithi River Corridor & Dharavi Periphery',
      svi_score: 0.84,
      population: 18450,
      median_household_income: 425000,
      elderly_pop_pct: 21.4,
      vehicle_access_pct: 48.0,
      hospital_access_min: 14.5,
      tree_canopy_pct: 6.2,
      heat_island_anomaly_c: 3.8
    },
    {
      tract_id: 'WARD-MH-02',
      name: 'Bandra West Coastal Heights',
      svi_score: 0.22,
      population: 24100,
      median_household_income: 1180000,
      elderly_pop_pct: 14.8,
      vehicle_access_pct: 89.0,
      hospital_access_min: 6.0,
      tree_canopy_pct: 34.5,
      heat_island_anomaly_c: 0.4
    },
    {
      tract_id: 'WARD-OD-03',
      name: 'Mahanadi Deltaic Mixed Rural Basin',
      svi_score: 0.68,
      population: 31200,
      median_household_income: 580000,
      elderly_pop_pct: 18.2,
      vehicle_access_pct: 62.0,
      hospital_access_min: 11.2,
      tree_canopy_pct: 14.0,
      heat_island_anomaly_c: 2.6
    },
    {
      tract_id: 'WARD-KL-04',
      name: 'Vembanad Estuary Green Eco-Corridor',
      svi_score: 0.15,
      population: 19800,
      median_household_income: 1350000,
      elderly_pop_pct: 16.1,
      vehicle_access_pct: 94.0,
      hospital_access_min: 8.5,
      tree_canopy_pct: 48.0,
      heat_island_anomaly_c: -1.2
    }
  ],
  regional_average_svi: 0.47,
  total_monitored_population: 93550,
  high_vulnerability_population: 49650,
  high_vulnerability_pct: 53.1,
  air_quality_index_pm25: 28.5,
  mean_ndvi_vegetation_index: 0.46,
  urban_heat_mitigation_target: 'Expand urban tree canopy by 15% in Ward 01 and 03 to eliminate 3.8°C thermal differential.'
};

// ============================================================================
// 7. RECOVERY PLAN & PARETO FRONTIER CURVE
// ============================================================================
export const FALLBACK_RECOVERY_TASKS: RecoveryTask[] = [
  {
    id: 'TASK-01',
    name: 'Emergency Substation De-watering & 400kV Busbar Re-energization',
    target_asset_id: 'ELEC-01',
    target_asset_name: 'Bandra-Kurla Primary Substation',
    category: 'Power',
    cost_usd: 280000.0,
    duration_days: 4,
    crews_required: 4,
    population_restored: 120000,
    criticality_weight: 1.00,
    prerequisites: [],
    status: 'pending'
  },
  {
    id: 'TASK-02',
    name: 'Master Water Treatment Motor Drying & Scour Armor Repair',
    target_asset_id: 'WAT-01',
    target_asset_name: 'Bhandup Water Works Hub',
    category: 'Water',
    cost_usd: 190000.0,
    duration_days: 3,
    crews_required: 3,
    population_restored: 180000,
    criticality_weight: 0.95,
    prerequisites: ['TASK-01'],
    status: 'pending'
  },
  {
    id: 'TASK-03',
    name: 'Coastal Sea Link Marine Pier Debris Clearance & Underpinning',
    target_asset_id: 'BRG-01',
    target_asset_name: 'Bandra-Worli Coastal Sea Link',
    category: 'Bridge/Road',
    cost_usd: 320000.0,
    duration_days: 6,
    crews_required: 5,
    population_restored: 65000,
    criticality_weight: 0.90,
    prerequisites: [],
    status: 'pending'
  },
  {
    id: 'TASK-04',
    name: 'District Trauma Center Dedicated Feeder Line & Dual Transformer',
    target_asset_id: 'HOSP-01',
    target_asset_name: 'Tata Memorial Hospital Hub',
    category: 'Medical',
    cost_usd: 140000.0,
    duration_days: 2,
    crews_required: 3,
    population_restored: 85000,
    criticality_weight: 0.88,
    prerequisites: ['TASK-01', 'TASK-02'],
    status: 'pending'
  },
  {
    id: 'TASK-05',
    name: 'Cellular 5G Gateway Antenna Array Alignment & Battery Swap',
    target_asset_id: 'TEL-01',
    target_asset_name: 'Central Telecommunications Gateway',
    category: 'Telecom',
    cost_usd: 75000.0,
    duration_days: 2,
    crews_required: 2,
    population_restored: 150000,
    criticality_weight: 0.85,
    prerequisites: ['TASK-01'],
    status: 'pending'
  },
  {
    id: 'TASK-06',
    name: 'Civic Center Evacuation Relief Shelter Emergency Generator Rig',
    target_asset_id: 'SHLT-01',
    target_asset_name: 'Bandra Reclamation Relief Shelter',
    category: 'Shelter',
    cost_usd: 85000.0,
    duration_days: 2,
    crews_required: 2,
    population_restored: 8000,
    criticality_weight: 0.80,
    prerequisites: ['TASK-01', 'TASK-02'],
    status: 'pending'
  }
];

export const FALLBACK_RECOVERY_PLAN: RecoveryPlanResponse = {
  plan_id: 'REC-PLAN-OPT-01',
  strategy: 'criticality_first',
  budget_cap_usd: 1200000.0,
  total_cost_usd: 1090000.0,
  budget_utilized_pct: 90.8,
  crews_cap: 15,
  crews_used: 12,
  peak_crews_utilized: 12,
  total_population_restored: 608000,
  total_duration_days: 11,
  selected_tasks_count: 6,
  unfunded_tasks_count: 1,
  schedule: [
    {
      task: FALLBACK_RECOVERY_TASKS[0],
      start_day: 1,
      end_day: 4,
      crew_assigned: 4,
      assigned_crews: 4,
      cumulative_cost: 280000.0,
      daily_cost: 70000.0,
      cumulative_population_restored: 120000,
      cumulative_restored_pop: 120000,
      why_prioritized: 'Tier-1 electrical grid backbone restores downstream water pumps.'
    },
    {
      task: FALLBACK_RECOVERY_TASKS[2],
      start_day: 1,
      end_day: 6,
      crew_assigned: 5,
      assigned_crews: 5,
      cumulative_cost: 600000.0,
      daily_cost: 53333.3,
      cumulative_population_restored: 185000,
      cumulative_restored_pop: 185000,
      why_prioritized: 'Clears critical coastal transit artery for relief convoys.'
    },
    {
      task: FALLBACK_RECOVERY_TASKS[1],
      start_day: 5,
      end_day: 7,
      crew_assigned: 3,
      assigned_crews: 3,
      cumulative_cost: 790000.0,
      daily_cost: 63333.3,
      cumulative_population_restored: 365000,
      cumulative_restored_pop: 365000,
      why_prioritized: 'Restores potable water distribution to 180,000 residents.'
    },
    {
      task: FALLBACK_RECOVERY_TASKS[4],
      start_day: 5,
      end_day: 6,
      crew_assigned: 2,
      assigned_crews: 2,
      cumulative_cost: 865000.0,
      daily_cost: 37500.0,
      cumulative_population_restored: 515000,
      cumulative_restored_pop: 515000,
      why_prioritized: 'Restores emergency cellular broadcast and SCADA telemetry.'
    },
    {
      task: FALLBACK_RECOVERY_TASKS[3],
      start_day: 8,
      end_day: 9,
      crew_assigned: 3,
      assigned_crews: 3,
      cumulative_cost: 1005000.0,
      daily_cost: 70000.0,
      cumulative_population_restored: 600000,
      cumulative_restored_pop: 600000,
      why_prioritized: 'Guarantees uncompromised power for regional trauma hospital.'
    },
    {
      task: FALLBACK_RECOVERY_TASKS[5],
      start_day: 8,
      end_day: 9,
      crew_assigned: 2,
      assigned_crews: 2,
      cumulative_cost: 1090000.0,
      daily_cost: 42500.0,
      cumulative_population_restored: 608000,
      cumulative_restored_pop: 608000,
      why_prioritized: 'Activates power and sanitation for central refugee evacuation camp.'
    }
  ],
  unfunded_tasks: [
    {
      id: 'TASK-07',
      name: 'Secondary Coastal Elevated Viaduct Concrete Spall Sealing',
      target_asset_id: 'BRG-02',
      target_asset_name: 'Eastern Freeway Elevated Viaduct',
      category: 'Bridge/Road',
      cost_usd: 180000.0,
      duration_days: 5,
      crews_required: 3,
      population_restored: 40000,
      criticality_weight: 0.65,
      prerequisites: [],
      status: 'deferred'
    }
  ],
  pareto_tradeoffs: [
    { budget_level: 400000, population_restored: 120000, days_needed: 4, tasks_count: 1 },
    { budget_level: 600000, population_restored: 300000, days_needed: 7, tasks_count: 2 },
    { budget_level: 800000, population_restored: 450000, days_needed: 8, tasks_count: 4 },
    { budget_level: 1000000, population_restored: 580000, days_needed: 10, tasks_count: 5 },
    { budget_level: 1200000, population_restored: 608000, days_needed: 11, tasks_count: 6 },
    { budget_level: 1500000, population_restored: 648000, days_needed: 12, tasks_count: 7 }
  ]
};

// ============================================================================
// 8. SCIKIT-LEARN ML RESEARCH BENCHMARKS
// ============================================================================
export const FALLBACK_ML_BENCHMARKS: MLResearchLabReport = {
  benchmark_timestamp: new Date().toISOString(),
  timestamp: new Date().toISOString(),
  target_task: 'Multi-Class Land Cover & Inundation Semantic Segmentation',
  dataset_quality_score: 95.0,
  missing_data_pct: 0.0,
  recommendation: 'Random Forest (100 Trees) recommended for production deployment due to lowest latency (1.4ms) and highest spatial F1-score (0.985).',
  classes: ['Water / Flood', 'Dense Forest', 'Built-up Urban', 'Bare Alluvium'],
  class_labels: ['Water / Flood', 'Dense Forest', 'Built-up Urban', 'Bare Alluvium'],
  test_dataset_size: 800,
  models: [
    {
      model_name: 'Random Forest (100 Trees)',
      model_family: 'Ensemble Bagging',
      accuracy: 0.985,
      precision_macro: 0.986,
      recall_macro: 0.985,
      f1_score: 0.985,
      roc_auc: 0.998,
      inference_latency_ms: 1.4,
      training_sample_count: 800,
      validation_strategy: '5-Fold Spatial CV',
      cross_val_folds: 5,
      cross_val_score_mean: 0.981
    },
    {
      model_name: 'Gradient Boosting (XGB-style)',
      model_family: 'Ensemble Boosting',
      accuracy: 0.980,
      precision_macro: 0.981,
      recall_macro: 0.980,
      f1_score: 0.980,
      roc_auc: 0.996,
      inference_latency_ms: 2.1,
      training_sample_count: 800,
      validation_strategy: '5-Fold Spatial CV',
      cross_val_folds: 5,
      cross_val_score_mean: 0.976
    },
    {
      model_name: 'Logistic Regression (L2 Regularized)',
      model_family: 'Linear Generalized',
      accuracy: 0.965,
      precision_macro: 0.966,
      recall_macro: 0.965,
      f1_score: 0.965,
      roc_auc: 0.991,
      inference_latency_ms: 0.3,
      training_sample_count: 800,
      validation_strategy: '5-Fold Spatial CV',
      cross_val_folds: 5,
      cross_val_score_mean: 0.962
    }
  ],
  feature_importances: [
    { feature: 'Sentinel-2 MNDWI (Water Index)', importance: 0.385, percentage: 38.5 },
    { feature: 'Sentinel-2 NDVI (Vegetation Index)', importance: 0.264, percentage: 26.4 },
    { feature: 'SRTM Elevation MSL (m)', importance: 0.168, percentage: 16.8 },
    { feature: 'SAR Backscatter VV/VH (dB)', importance: 0.095, percentage: 9.5 },
    { feature: 'Digital Terrain Slope (deg)', importance: 0.056, percentage: 5.6 },
    { feature: 'Landsat Thermal Band (K)', importance: 0.032, percentage: 3.2 }
  ],
  confusion_matrix: [
    [50, 0, 0, 0],
    [0, 49, 1, 0],
    [0, 1, 49, 0],
    [0, 0, 1, 49]
  ],
  spatial_autocorrelation_moran_i: 0.42
};

// ============================================================================
// 9. DAMAGE ASSESSMENT & FIELD TRIAGE REGISTRY
// ============================================================================
export const FALLBACK_DAMAGE_REPORTS: DamageReportItem[] = [
  {
    id: 'DMG-101',
    title: 'Mahanadi Delta Embankment Breach & Agricultural Inundation',
    asset_type: 'levee',
    lat: 20.3540,
    lng: 86.1240,
    address: 'Mahanadi-Devi River Bifurcation Berm (Chainage 14+200, Kendrapara Sector, Odisha)',
    severity_grade: 'Severe (Grade 3)',
    confidence_score: 0.96,
    verification_status: 'verified_by_engineer',
    detection_method: 'Cartosat-3 Optical & Sentinel-2 MNDWI Change Detection',
    image_before_url: '/assets/disaster/mahanadi_flood_baseline.jpg',
    image_after_url: '/assets/disaster/mahanadi_flood_aftermath.jpg',
    structural_damage_pct: 78.0,
    reported_at: '2024-10-08T09:30:00Z',
    verified_by: 'Odisha Disaster Rapid Action Force (ODRAF) Lead Surveyor',
    notes: 'Catastrophic 55-meter embankment failure along southern levee collar; uncontrolled turbid inundation across 42.6 km² of delta paddies and State Highway 12 approach washout.'
  },
  {
    id: 'DMG-102',
    title: 'Cyclone Michaung Coastal Arterial Highway & Canal Surge',
    asset_type: 'road',
    lat: 13.0827,
    lng: 80.2707,
    address: 'Buckingham Canal / Ennore Coastal Highway Corridor (Tamil Nadu)',
    severity_grade: 'Severe (Grade 3)',
    confidence_score: 0.94,
    verification_status: 'verified_by_engineer',
    detection_method: 'Drone Aerial Computer Vision & Micro-SAR Telemetry',
    image_before_url: '/assets/disaster/michaung_cyclone_baseline.jpg',
    image_after_url: '/assets/disaster/michaung_cyclone_aftermath.jpg',
    structural_damage_pct: 65.0,
    reported_at: '2024-10-08T11:15:00Z',
    verified_by: 'Greater Chennai Corporation Emergency Engineering Cell',
    notes: 'Severe 1.4m tidal storm surge overtopped canal retaining walls; multi-lane express underpasses submerged; 230kV substation yard isolated due to floodwater ingress.'
  },
  {
    id: 'DMG-103',
    title: 'Bandra-Worli Coastal Sea Link Marine Pier Scour',
    asset_type: 'bridge',
    lat: 19.0350,
    lng: 72.8180,
    address: 'Bandra-Worli Coastal Sea Link (Marine Pylons 4-6, Mumbai)',
    severity_grade: 'Moderate (Grade 2)',
    confidence_score: 0.91,
    verification_status: 'verified_by_engineer',
    detection_method: 'Sub-surface Multibeam Sonar & Drone LiDAR Triage',
    image_before_url: '/assets/disaster/michaung_cyclone_baseline.jpg',
    image_after_url: '/assets/disaster/michaung_cyclone_aftermath.jpg',
    structural_damage_pct: 42.0,
    reported_at: '2024-10-08T13:40:00Z',
    verified_by: 'Maharashtra State Road Development Corporation (MSRDC)',
    notes: 'Extreme cyclonic tidal riprap displacement around south pylon collar; 1.8m foundation scour pocket detected; main bridge span remains structurally stable.'
  },
  {
    id: 'DMG-104',
    title: 'Bandra-Kurla 400kV Substation Switchyard Flood Ingress',
    asset_type: 'power_pole',
    lat: 19.0650,
    lng: 72.8680,
    address: 'BKC Power Grid Hub, Mithi River Basin Perimeter (Mumbai)',
    severity_grade: 'Total Collapse (Grade 4)',
    confidence_score: 0.97,
    verification_status: 'verified_by_engineer',
    detection_method: 'Thermal Infrared UAV & SCADA Telemetry',
    image_before_url: '/assets/disaster/mahanadi_flood_baseline.jpg',
    image_after_url: '/assets/disaster/mahanadi_flood_aftermath.jpg',
    structural_damage_pct: 85.0,
    reported_at: '2024-10-08T08:10:00Z',
    verified_by: 'Maharashtra State Electricity Transmission Co. (MSETCL)',
    notes: 'Mithi River flood surcharge overtopped protection berm; 1.1m sediment-laden water in high-voltage transformer yard; automated emergency isolation triggered.'
  },
  {
    id: 'DMG-105',
    title: 'Western Ghats Highway Slope Failure & Colluvium Slump',
    asset_type: 'road',
    lat: 18.7500,
    lng: 73.4200,
    address: 'NH-48 Western Ghats Escarpment (Milepost 78.4, Maharashtra)',
    severity_grade: 'Minor (Grade 1)',
    confidence_score: 0.88,
    verification_status: 'suspected',
    detection_method: 'Sentinel-1 InSAR Slope Displacement Analysis',
    image_before_url: '/assets/disaster/mahanadi_flood_baseline.jpg',
    image_after_url: '/assets/disaster/mahanadi_flood_aftermath.jpg',
    structural_damage_pct: 25.0,
    reported_at: '2024-10-08T15:00:00Z',
    verified_by: null,
    notes: 'Monsoon saturated regolith slope failure; shoulder gravel displacement and asphalt shear across northbound lane; single-lane traffic diversion active.'
  }
];

// ============================================================================
// 10. EXECUTIVE RESILIENCE DOSSIER
// ============================================================================
export const FALLBACK_DOSSIER = {
  dossier_id: 'TS-DOSSIER-P-101-20261010-0501',
  generated_at: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
  author_system: 'TerraShield AI Autonomous Planning Intelligence Suite v1.4',
  title: 'Executive Geospatial Resilience & Land Suitability Dossier',
  target_location: {
    parcel_id: 'P-101',
    parcel_name: 'Mumbai Coastal & Mithi Basin Sector A',
    zone_type: 'Residential',
    area_hectares: 48.2,
    mean_elevation_m: 14.5,
    flood_zone: 'X',
    center_coordinates: [19.0760, 72.8777]
  },
  land_suitability: {
    score: 82.0,
    rating: 'Highly Suitable',
    evaluated_profile: 'residential',
    top_factors: [
      { name: 'Slope Stability', score: 95.0, weight: 0.20, assessment: 'Optimal 2.2° gradient' },
      { name: 'Flood Exposure', score: 85.0, weight: 0.25, assessment: 'Minimal risk in Zone X' },
      { name: 'Road Accessibility', score: 90.0, weight: 0.15, assessment: '420m to State Highway Corridor' }
    ],
    identified_constraints: [
      'Seasonal monsoon water table elevation at 2.4m depth.',
      '30-meter utility right-of-way buffer along southern sector.'
    ],
    recommended_mitigations: [
      'Elevate ground floor level 600mm above finished street grade.',
      'Install subsoil perimeter drainage pipes with dual discharge backflow preventers.'
    ]
  },
  multi_hazard_matrix: {
    composite_hazard_index: 53.0,
    threat_level: 'Elevated Hazard Vulnerability',
    hazards: [
      { type: 'Pluvial Drainage Overload', level: 'High', index: 68.0, driver: 'Rapid surface runoff during 100mm/hr monsoon peaks' },
      { type: 'Flood & Coastal Surge', level: 'Moderate', index: 52.0, driver: 'Tidal backflow in low-lying stormwater culverts' },
      { type: 'Seismic Liquefaction', level: 'Moderate', index: 48.0, driver: 'Zone III seismic acceleration with sandy marine lenses' }
    ]
  },
  critical_infrastructure_vulnerability: {
    closest_substation: 'Bandra-Kurla 400kV Primary Substation (1.2 km)',
    water_pumping_status: 'Bhandup Water Works (2.8 km, 8.0h backup fuel)',
    evacuation_arterial: 'Eastern Elevated Freeway (Unobstructed)',
    network_bottlenecks_flagged: 2
  },
  recommended_recovery_schedule: {
    budget_allocated_inr: '₹1.09 Cr',
    citizens_restored: 608000,
    duration_days: 11,
    prioritized_tasks: [
      { task_name: 'Emergency Substation De-watering & Busbar Re-energization', timeline: 'Day 1–4', cost: '₹28 Lakh', rationale: 'Restores primary grid power to 120,000 citizens and hospital substations' },
      { task_name: 'Master Water Treatment Motor Drying & Scour Armor', timeline: 'Day 5–7', cost: '₹19 Lakh', rationale: 'Guarantees potable water pressurization for 180,000 residents' },
      { task_name: 'Coastal Sea Link Marine Pier Debris Clearance', timeline: 'Day 1–6', cost: '₹32 Lakh', rationale: 'Reopens critical arterial transit route for emergency response teams' }
    ]
  },
  compliance_and_governance: {
    data_sources_cited: [
      'FEMA National Flood Hazard Layer (NFHL) 2024',
      'SRTM 30m Digital Elevation Model',
      'Sentinel-2 Multi-Spectral Surface Reflectance (ESA Cop-Hub)',
      'OpenStreetMap Topological Road Network'
    ],
    confidence_score_overall: 0.94,
    disclaimer: 'This dossier is an AI-assisted planning advisory document. It does not replace on-site geotechnical core drilling or statutory municipal approvals.'
  }
};
