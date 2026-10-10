import {
  Parcel,
  SuitabilityAssessmentResponse,
  MultiHazardReport,
  ScenarioParameters,
  SimulationRunResult,
  InfrastructureGraphData,
  DisruptionSimulationResponse,
  DamageReportItem,
  RecoveryTask,
  RecoveryPlanResponse,
  MLResearchLabReport,
  AssistantQueryResponse
} from '../types';

const API_BASE = '/api';

export const api = {
  // Region & Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Spatial & Parcels
  async getParcels(): Promise<Parcel[]> {
    try {
      const res = await fetch(`${API_BASE}/spatial/parcels`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch {
      return [];
    }
  },

  async calculatePolygonMetrics(coordinates: number[][]): Promise<any> {
    const res = await fetch(`${API_BASE}/spatial/calculate-polygon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'CALC', coordinates })
    });
    return res.json();
  },

  async synthesizeCustomParcel(coordinates: number[][], name?: string): Promise<Parcel> {
    const res = await fetch(`${API_BASE}/spatial/synthesize-parcel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'CUSTOM', name: name || 'Custom Area', coordinates })
    });
    return res.json();
  },

  // Land Suitability
  async evaluateSuitability(params: {
    parcel_id?: string;
    custom_polygon?: number[][];
    development_profile?: string;
    custom_weights?: any;
  }): Promise<SuitabilityAssessmentResponse> {
    const res = await fetch(`${API_BASE}/land/suitability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parcel_id: params.parcel_id,
        custom_polygon: params.custom_polygon,
        development_profile: params.development_profile || 'residential',
        custom_weights: params.custom_weights
      })
    });
    return res.json();
  },

  // Hazard Intelligence
  async getHazardReport(lat: number, lng: number, parcel_id?: string): Promise<MultiHazardReport> {
    const url = new URL(`${window.location.origin}${API_BASE}/hazard/assess`);
    url.searchParams.append('lat', lat.toString());
    url.searchParams.append('lng', lng.toString());
    if (parcel_id) url.searchParams.append('parcel_id', parcel_id);
    const res = await fetch(url.toString());
    return res.json();
  },

  async getHistoricalEvents(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/hazard/historical-events`);
    return res.json();
  },

  // Disaster Simulator
  async runSimulation(params: ScenarioParameters): Promise<SimulationRunResult> {
    const res = await fetch(`${API_BASE}/simulation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  async getSimulationPresets(): Promise<ScenarioParameters[]> {
    const res = await fetch(`${API_BASE}/simulation/presets`);
    return res.json();
  },

  // Infrastructure Graph
  async getInfraGraph(): Promise<InfrastructureGraphData> {
    const res = await fetch(`${API_BASE}/infrastructure/graph`);
    return res.json();
  },

  async simulateInfraDisruption(disabled_node_ids: string[], disabled_edge_ids: string[] = []): Promise<DisruptionSimulationResponse> {
    const res = await fetch(`${API_BASE}/infrastructure/simulate-disruption`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disabled_node_ids, disabled_edge_ids })
    });
    return res.json();
  },

  // Damage Assessment
  async getDamageReports(): Promise<DamageReportItem[]> {
    const res = await fetch(`${API_BASE}/damage/reports`);
    return res.json();
  },

  async updateDamageStatus(report_id: string, status: string, verified_by?: string): Promise<DamageReportItem> {
    const url = new URL(`${window.location.origin}${API_BASE}/damage/reports/${report_id}`);
    url.searchParams.append('status', status);
    if (verified_by) url.searchParams.append('verified_by', verified_by);
    const res = await fetch(url.toString(), { method: 'PATCH' });
    return res.json();
  },

  async runDamageImageTriage(params: { image_name: string; incident_type: string; lat: number; lng: number; notes?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/damage/triage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  // Recovery Optimization
  async getRecoveryTasks(): Promise<RecoveryTask[]> {
    const res = await fetch(`${API_BASE}/recovery/tasks`);
    return res.json();
  },

  async optimizeRecovery(params: {
    available_budget_usd: number;
    available_crews: number;
    max_timeline_days?: number;
    strategy: string;
    manual_overrides?: Record<string, boolean>;
  }): Promise<RecoveryPlanResponse> {
    const res = await fetch(`${API_BASE}/recovery/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        available_budget_usd: params.available_budget_usd,
        available_crews: params.available_crews,
        max_timeline_days: params.max_timeline_days || 30,
        strategy: params.strategy,
        manual_overrides: params.manual_overrides
      })
    });
    return res.json();
  },

  // Environmental
  async getEnvironmentalSummary(): Promise<any> {
    const res = await fetch(`${API_BASE}/environmental/community`);
    return res.json();
  },

  // AI Research Lab
  async getMLBenchmarks(): Promise<MLResearchLabReport> {
    const res = await fetch(`${API_BASE}/research/benchmarks`);
    return res.json();
  },

  // AI Assistant Copilot
  async queryAssistant(query: string, context?: any): Promise<AssistantQueryResponse> {
    const res = await fetch(`${API_BASE}/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context })
    });
    return res.json();
  },

  // Live Telemetry & Feeds
  async getDataSources(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/live/data-sources`);
    return res.json();
  },

  async getLiveWeather(lat: number = 37.7749, lng: number = -122.4194): Promise<any> {
    const res = await fetch(`${API_BASE}/live/weather?lat=${lat}&lng=${lng}`);
    return res.json();
  },

  async getLiveEarthquakes(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/live/earthquakes`);
    return res.json();
  },

  // Reports
  async getResilienceDossier(parcel_id: string = 'P-101', profile: string = 'residential'): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/dossier?parcel_id=${parcel_id}&profile=${profile}`);
    return res.json();
  }
};
