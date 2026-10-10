import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { ScenarioParameters, SimulationRunResult } from '../../types';
import { FALLBACK_SIMULATION_PRESETS, FALLBACK_SIMULATION_RESULT } from '../../services/fallbackData';
import {
  Waves,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  TrendingUp,
  AlertTriangle,
  Building,
  Users,
  Compass,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldAlert,
  Box,
  FastForward
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const DisasterSimulatorView: React.FC = () => {
  const {
    activeScenarioResult,
    setActiveScenarioResult,
    currentSimulationHour,
    setCurrentSimulationHour,
    setActive3DWaterHeight,
    sendCopilotQuery,
    setCurrentView,
    isBackendConnected
  } = useApp();

  const [presets, setPresets] = useState<ScenarioParameters[]>(FALLBACK_SIMULATION_PRESETS);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('PRESET-100YR-DELUGE');

  // Simulation Parameters
  const [params, setParams] = useState<ScenarioParameters>(FALLBACK_SIMULATION_PRESETS[0]);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [compareMode, setCompareMode] = useState<boolean>(false);

  useEffect(() => {
    api.getSimulationPresets().then(data => {
      if (data && data.length > 0) {
        setPresets(data);
      }
    }).catch(() => {});
  }, []);

  // Animation playback loop
  useEffect(() => {
    let interval: any;
    const totalSteps = activeScenarioResult?.total_timesteps || 18;
    if (isPlaying && activeScenarioResult) {
      interval = setInterval(() => {
        setCurrentSimulationHour(prev => {
          if (prev >= totalSteps) {
            setIsPlaying(false);
            return 1;
          }
          const nextH = prev + 1;
          const step = activeScenarioResult.timesteps?.[nextH - 1];
          if (step) {
            setActive3DWaterHeight(step.max_water_depth_m);
          }
          return nextH;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, activeScenarioResult]);

  const runSimulation = async (simParams: ScenarioParameters) => {
    setLoading(true);
    try {
      const res = await api.runSimulation(simParams);
      const safeRes = res || FALLBACK_SIMULATION_RESULT;
      setActiveScenarioResult(safeRes);
      setCurrentSimulationHour(safeRes.peak_hour || 12);
      if (safeRes.timesteps?.[(safeRes.peak_hour || 12) - 1]) {
        setActive3DWaterHeight(safeRes.timesteps[(safeRes.peak_hour || 12) - 1].max_water_depth_m);
      }
    } catch (e) {
      console.warn('Simulation execution fallback:', e);
      setActiveScenarioResult(FALLBACK_SIMULATION_RESULT);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = presets.find(x => x.scenario_id === presetId) || FALLBACK_SIMULATION_PRESETS[0];
    if (p) {
      setParams(p);
      runSimulation(p);
    }
  };

  const effectiveResult = activeScenarioResult || FALLBACK_SIMULATION_RESULT;
  const currentStep = effectiveResult.timesteps?.[currentSimulationHour - 1] || effectiveResult.timesteps?.[0] || {
    step_hour: 12,
    flood_extent_sqkm: 10.4,
    max_water_depth_m: 2.85,
    mean_water_depth_m: 1.35,
    inundated_buildings_count: 1820,
    inundated_road_km: 18.7,
    isolated_facilities: ['Bayside Substation', 'Wastewater Station'],
    population_impacted: 34500,
    active_inundation_contours: []
  };

  const chartData = (effectiveResult.timesteps && effectiveResult.timesteps.length > 0)
    ? effectiveResult.timesteps.map(t => ({
        hour: `H${t.step_hour}`,
        extent: t.flood_extent_sqkm,
        depth: t.max_water_depth_m,
        population: t.population_impacted,
        buildings: t.inundated_buildings_count
      }))
    : FALLBACK_SIMULATION_RESULT.timesteps.map(t => ({
        hour: `H${t.step_hour}`,
        extent: t.flood_extent_sqkm,
        depth: t.max_water_depth_m,
        population: t.population_impacted,
        buildings: t.inundated_buildings_count
      }));

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-ts-text select-text">
      {/* Header & Scenario Presets */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-panel rounded-2xl p-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-ts-primary font-semibold mb-1">
            <Waves className="w-3.5 h-3.5" />
            <span>HYDROLOGICAL DISASTER SCENARIO ENGINE</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-ts-primary/10 text-ts-primary border border-ts-primary/30">
              {isBackendConnected ? '● REAL-TIME COMPUTATION' : '● DETERMINISTIC PHYSICS SIMULATION'}
            </span>
          </div>
          <h1 className="text-xl font-extrabold font-mono text-ts-text">
            Interactive Disaster Simulation & Inundation Propagation
          </h1>
          <p className="text-xs text-ts-muted">
            Time-stepped hydrological accumulation, surge propagation, and infrastructure vulnerability modeling.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedPresetId}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="bg-ts-bg border border-ts-card-border rounded-xl px-3 py-2 text-xs font-mono font-semibold text-ts-text focus:border-ts-primary outline-none"
          >
            {presets.map(p => (
              <option key={p.scenario_id} value={p.scenario_id}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => sendCopilotQuery(`Explain the inundation propagation and peak damages for scenario ${params.name}`)}
            className="px-3 py-2 rounded-xl bg-ts-primary/15 hover:bg-ts-primary/25 border border-ts-primary/40 text-ts-primary text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI COPILOT</span>
          </button>
        </div>
      </div>

      {/* Simulator Control Bar */}
      <div className="glass-panel-glow rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-3 rounded-xl flex items-center justify-center font-bold text-slate-950 transition-all ${
              isPlaying ? 'bg-ts-warning' : 'bg-ts-primary shadow-lg shadow-ts-primary/30'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentSimulationHour(1);
              if (effectiveResult.timesteps?.[0]) {
                setActive3DWaterHeight(effectiveResult.timesteps[0].max_water_depth_m);
              }
            }}
            className="p-3 rounded-xl bg-ts-bg border border-ts-card-border hover:border-ts-primary text-ts-muted hover:text-ts-text transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="flex bg-ts-bg border border-ts-card-border rounded-xl p-1 text-xs font-mono">
            {[1, 2, 4].map(s => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-2 py-1 rounded-lg font-bold ${playbackSpeed === s ? 'bg-ts-primary text-slate-950' : 'text-ts-muted'}`}
              >
                {s}x
              </button>
            ))}
          </div>

          <div className="text-xs font-mono">
            <span className="text-ts-muted">TIMESTEP: </span>
            <span className="text-ts-primary font-bold text-sm">HOUR {currentSimulationHour}</span>
            <span className="text-ts-muted"> / {effectiveResult.total_timesteps || 18}</span>
          </div>
        </div>

        {/* Time Scrubber Slider */}
        <div className="flex-1 max-w-xl flex items-center space-x-3">
          <span className="text-[10px] font-mono text-ts-muted">H1</span>
          <input
            type="range"
            min="1"
            max={effectiveResult.total_timesteps || 18}
            step="1"
            value={currentSimulationHour}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setCurrentSimulationHour(val);
              const step = effectiveResult.timesteps?.[val - 1];
              if (step) setActive3DWaterHeight(step.max_water_depth_m);
            }}
            className="w-full accent-cyan-400 h-2 bg-ts-bg rounded cursor-pointer"
          />
          <span className="text-[10px] font-mono text-ts-muted">H{effectiveResult.total_timesteps || 18}</span>
        </div>

        <button
          onClick={() => runSimulation(params)}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-ts-primary to-ts-secondary text-slate-950 text-xs font-mono font-bold flex items-center space-x-2 shadow-md hover:scale-102 transition-transform disabled:opacity-50"
        >
          <Sliders className="w-4 h-4" />
          <span>{loading ? 'CALCULATING...' : 'RE-RUN ENGINE'}</span>
        </button>
      </div>

      {/* Parameter Sliders Grid */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-ts-card-border pb-2">
          <div className="font-mono text-xs font-bold text-ts-text flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-ts-primary" />
            <span>CUSTOM HYDRO-METEOROLOGICAL SCENARIO DRIVERS</span>
          </div>
          <span className="text-[10px] font-mono text-ts-muted">Dynamic Parameter Override</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs font-mono">
          {/* Rainfall Intensity */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-ts-muted">Precipitation Rate</span>
              <span className="text-ts-primary font-bold">{params.rainfall_intensity_mm_hr} mm/hr</span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              step="5"
              value={params.rainfall_intensity_mm_hr}
              onChange={(e) => setParams({ ...params, rainfall_intensity_mm_hr: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 h-1.5 bg-ts-bg rounded"
            />
            <div className="flex justify-between text-[9px] text-ts-muted">
              <span>Moderate (20)</span>
              <span>Cloudburst (150)</span>
            </div>
          </div>

          {/* Storm Surge Height */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-ts-muted">Coastal Storm Surge</span>
              <span className="text-ts-danger font-bold">+{params.surge_height_m}m MSL</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="6.0"
              step="0.2"
              value={params.surge_height_m}
              onChange={(e) => setParams({ ...params, surge_height_m: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 h-1.5 bg-ts-bg rounded"
            />
            <div className="flex justify-between text-[9px] text-ts-muted">
              <span>Minor (0.5m)</span>
              <span>Catastrophic (6.0m)</span>
            </div>
          </div>

          {/* Soil Saturation */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-ts-muted">Soil Antecedent Wetness</span>
              <span className="text-ts-warning font-bold">{params.soil_saturation_pct}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              step="5"
              value={params.soil_saturation_pct}
              onChange={(e) => setParams({ ...params, soil_saturation_pct: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 h-1.5 bg-ts-bg rounded"
            />
            <div className="flex justify-between text-[9px] text-ts-muted">
              <span>Dry Soil (30%)</span>
              <span>Waterlogged (100%)</span>
            </div>
          </div>

          {/* Drainage Efficiency */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-ts-muted">Drainage Capacity</span>
              <span className="text-ts-success font-bold">{params.drainage_efficiency_pct}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={params.drainage_efficiency_pct}
              onChange={(e) => setParams({ ...params, drainage_efficiency_pct: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 h-1.5 bg-ts-bg rounded"
            />
            <div className="flex justify-between text-[9px] text-ts-muted">
              <span>Silted/Choked (10%)</span>
              <span>Engineered (90%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Hour Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">FLOOD EXTENT (SQ KM)</div>
          <div className="text-xl font-bold font-mono text-ts-primary mt-1">
            {(currentStep?.flood_extent_sqkm ?? 10.4).toFixed(1)} km²
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">Peak: {effectiveResult.peak_flood_extent_sqkm || 10.4} km²</div>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">MAX WATER DEPTH</div>
          <div className="text-xl font-bold font-mono text-ts-danger mt-1">
            {(currentStep?.max_water_depth_m ?? 2.85).toFixed(2)} m
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">Mean Depth: {(currentStep?.mean_water_depth_m ?? 1.35).toFixed(2)}m</div>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">INUNDATED BUILDINGS</div>
          <div className="text-xl font-bold font-mono text-ts-warning mt-1">
            {(currentStep?.inundated_buildings_count ?? 1820).toLocaleString()}
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">Commercial & Residential</div>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">IMPACTED POPULATION</div>
          <div className="text-xl font-bold font-mono text-ts-accent mt-1">
            {(currentStep?.population_impacted ?? 34500).toLocaleString()}
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">Direct & Secondary Loss</div>
        </div>
      </div>

      {/* Propagation Chart + Submerged Assets List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Inundation Evolution Curve */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 space-y-3 min-h-[340px]">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono font-bold text-ts-text flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-ts-primary" />
              <span>HYDROGRAPH INUNDATION PROPAGATION CURVE</span>
            </div>
            <span className="text-[10px] font-mono text-ts-muted">Extent vs Impacted Depth</span>
          </div>

          <div className="h-64 w-full min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="floodColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--ts-primary)" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="var(--ts-primary)" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="depthColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--ts-danger)" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="var(--ts-danger)" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ts-card-border)" />
                <XAxis
                  dataKey="hour"
                  stroke="var(--ts-muted)"
                  tick={{ fontSize: 9, fill: 'var(--ts-muted)' }}
                  label={{ value: 'Hour (UTC)', position: 'insideBottom', offset: -12, fontSize: 9, fill: 'var(--ts-muted)' }}
                />
                <YAxis
                  stroke="var(--ts-muted)"
                  tick={{ fontSize: 9, fill: 'var(--ts-muted)' }}
                  label={{ value: 'km² / meters', angle: -90, position: 'insideLeft', offset: 10, fontSize: 9, fill: 'var(--ts-muted)' }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--ts-card)', borderColor: 'var(--ts-card-border)', fontSize: 11 }}
                  labelFormatter={(label) => `Simulation Hour: ${label}`}
                  formatter={(value: number, name: string) => [
                    name.includes('Extent') ? `${value.toFixed(1)} km²` : `${value.toFixed(2)} m`,
                    name
                  ]}
                />
                <Area type="monotone" dataKey="extent" name="Flood Extent (km²)" stroke="var(--ts-primary)" strokeWidth={2} fillOpacity={1} fill="url(#floodColor)" />
                <Area type="monotone" dataKey="depth" name="Max Water Depth (m)" stroke="var(--ts-danger)" strokeWidth={2} fillOpacity={1} fill="url(#depthColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center space-x-4 text-[10px] font-mono mt-1 text-ts-muted">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--ts-primary)] inline-block"></span>
              <span>Flood Inundation Extent (km²)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--ts-danger)] inline-block"></span>
              <span>Max Water Depth (m MSL)</span>
            </span>
          </div>
        </div>

        {/* Right Col: Submerged Facilities List */}
        <div className="glass-panel rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-ts-card-border pb-1.5">
            <div className="font-mono text-xs font-bold text-ts-danger flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>SUBMERGED CRITICAL ASSETS</span>
            </div>
            <span className="text-[10px] font-mono text-ts-muted">{(effectiveResult.submerged_critical_nodes || []).length} Assets</span>
          </div>

          <div className="space-y-2 text-xs">
            {(effectiveResult.submerged_critical_nodes || FALLBACK_SIMULATION_RESULT.submerged_critical_nodes).map((node, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-ts-bg/60 border border-ts-danger/40 space-y-1">
                <div className="flex items-center justify-between font-bold text-ts-text">
                  <span className="truncate">{node.name}</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-ts-danger/20 text-ts-danger shrink-0 ml-1">
                    {node.type}
                  </span>
                </div>
                <div className="text-[10px] text-ts-muted font-mono flex justify-between">
                  <span>Elev: {node.elev_m}m MSL</span>
                  <span className="text-ts-warning">Pop: {(node.pop || 25000).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentView('digital-twin')}
            className="w-full py-2 rounded-xl bg-ts-primary/15 hover:bg-ts-primary/25 border border-ts-primary/40 text-ts-primary text-xs font-mono font-bold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Box className="w-3.5 h-3.5" />
            <span>VIEW IN 3D DIGITAL TWIN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
