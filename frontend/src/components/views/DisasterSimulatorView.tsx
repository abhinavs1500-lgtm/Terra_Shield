import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { ScenarioParameters, SimulationRunResult } from '../../types';
import {
  Waves,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ShieldAlert,
  Sparkles,
  Sliders,
  TrendingUp,
  AlertTriangle,
  Building,
  Navigation,
  Box,
  CheckCircle2,
  GitCompare
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';

export const DisasterSimulatorView: React.FC = () => {
  const { 
    activeScenarioResult, 
    setActiveScenarioResult, 
    currentSimulationHour, 
    setCurrentSimulationHour,
    setActive3DWaterHeight,
    setCurrentView,
    sendCopilotQuery
  } = useApp();

  const [presets, setPresets] = useState<ScenarioParameters[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('SCEN-01');
  const [params, setParams] = useState<ScenarioParameters>({
    scenario_id: 'SCEN-01',
    name: '100-Year Atmospheric River & King Tide',
    hazard_type: 'flood',
    rainfall_intensity_mm_hr: 75.0,
    duration_hours: 18,
    surge_height_m: 2.8,
    tide_level_m: 1.4,
    soil_saturation_pct: 90.0,
    drainage_efficiency_pct: 50.0,
    disrupted_bridges_roads: ['BRG-01', 'RD-01']
  });

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
    runSimulation(params);
  }, []);

  // Animation playback loop
  useEffect(() => {
    let interval: any;
    if (isPlaying && activeScenarioResult) {
      interval = setInterval(() => {
        setCurrentSimulationHour(prev => {
          if (prev >= activeScenarioResult.total_timesteps) {
            setIsPlaying(false);
            return 1;
          }
          const nextH = prev + 1;
          // Sync 3D Twin water height to simulated water depth
          const step = activeScenarioResult.timesteps[nextH - 1];
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
      setActiveScenarioResult(res);
      setCurrentSimulationHour(res.peak_hour);
      if (res.timesteps[res.peak_hour - 1]) {
        setActive3DWaterHeight(res.timesteps[res.peak_hour - 1].max_water_depth_m);
      }
    } catch (e) {
      console.warn('Simulation execution failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = presets.find(x => x.scenario_id === presetId);
    if (p) {
      setParams(p);
      runSimulation(p);
    }
  };

  const currentStep = activeScenarioResult?.timesteps[currentSimulationHour - 1] || null;

  const chartData = activeScenarioResult?.timesteps.map(t => ({
    hour: `H${t.step_hour}`,
    extent: t.flood_extent_sqkm,
    depth: t.max_water_depth_m,
    population: t.population_impacted,
    buildings: t.inundated_buildings_count
  })) || [];

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-ts-text select-text">
      {/* Header & Scenario Presets */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-panel rounded-2xl p-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-ts-primary font-semibold mb-1">
            <Waves className="w-3.5 h-3.5" />
            <span>HYDROLOGICAL DISASTER SCENARIO ENGINE</span>
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
            onClick={() => runSimulation(params)}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-ts-primary to-ts-secondary text-slate-950 text-xs font-mono font-bold hover:scale-102 transition-transform shadow-md disabled:opacity-50"
          >
            {loading ? 'SIMULATING...' : 'RE-RUN SCENARIO'}
          </button>
        </div>
      </div>

      {/* Parameter Sliders Bar */}
      <div className="glass-panel rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-ts-muted">Rainfall Intensity</span>
            <span className="text-ts-primary font-bold">{params.rainfall_intensity_mm_hr} mm/h</span>
          </div>
          <input
            type="range"
            min="10"
            max="150"
            step="5"
            value={params.rainfall_intensity_mm_hr}
            onChange={(e) => setParams({ ...params, rainfall_intensity_mm_hr: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 h-1 bg-ts-bg rounded"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-ts-muted">Storm Surge Height</span>
            <span className="text-ts-accent font-bold">{params.surge_height_m} m</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="6.0"
            step="0.2"
            value={params.surge_height_m}
            onChange={(e) => setParams({ ...params, surge_height_m: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 h-1 bg-ts-bg rounded"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-ts-muted">Soil Saturation</span>
            <span className="text-ts-warning font-bold">{params.soil_saturation_pct}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={params.soil_saturation_pct}
            onChange={(e) => setParams({ ...params, soil_saturation_pct: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 h-1 bg-ts-bg rounded"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-ts-muted">Drainage Capacity</span>
            <span className="text-ts-info font-bold">{params.drainage_efficiency_pct}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={params.drainage_efficiency_pct}
            onChange={(e) => setParams({ ...params, drainage_efficiency_pct: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 h-1 bg-ts-bg rounded"
          />
        </div>
      </div>

      {/* Interactive Time-Step Controller & Scrubber */}
      <div className="glass-panel-glow rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Play / Step Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3.5 py-1.5 rounded-xl bg-ts-primary text-slate-950 text-xs font-mono font-bold flex items-center space-x-1.5 shadow-md shadow-ts-primary/20 hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY TIMELINE'}</span>
            </button>

            <button
              onClick={() => setCurrentSimulationHour(1)}
              className="p-1.5 rounded-xl bg-ts-bg hover:bg-ts-card border border-ts-card-border text-ts-muted"
              title="Reset Timeline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Speed Toggle */}
            <div className="flex bg-ts-bg border border-ts-card-border rounded-xl p-0.5 text-[10px] font-mono">
              {[1, 2, 4].map(s => (
                <button
                  key={s}
                  onClick={() => setPlaybackSpeed(s)}
                  className={`px-2 py-1 rounded-lg ${playbackSpeed === s ? 'bg-ts-primary/20 text-ts-primary font-bold' : 'text-ts-muted'}`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Current Step Readout */}
          <div className="flex items-center space-x-4 text-xs font-mono">
            <div>
              <span className="text-ts-muted">TIMESTEP: </span>
              <span className="text-ts-primary font-bold text-sm">HOUR {currentSimulationHour}</span>
              <span className="text-ts-muted"> / {activeScenarioResult?.total_timesteps || 18}h</span>
            </div>
            <div>
              <span className="text-ts-muted">PEAK AT: </span>
              <span className="text-ts-danger font-bold">HOUR {activeScenarioResult?.peak_hour}</span>
            </div>
          </div>
        </div>

        {/* Timeline Scrubber Slider */}
        <div className="space-y-1 pt-1">
          <input
            type="range"
            min="1"
            max={activeScenarioResult?.total_timesteps || 18}
            step="1"
            value={currentSimulationHour}
            onChange={(e) => {
              const h = parseInt(e.target.value);
              setCurrentSimulationHour(h);
              if (activeScenarioResult?.timesteps[h - 1]) {
                setActive3DWaterHeight(activeScenarioResult.timesteps[h - 1].max_water_depth_m);
              }
            }}
            className="w-full accent-cyan-400 h-2 bg-ts-bg rounded cursor-pointer"
          />
          <div className="flex justify-between text-[9px] font-mono text-ts-muted">
            <span>Hour 1 (Storm Ingress)</span>
            <span className="text-ts-danger font-bold">Hour {activeScenarioResult?.peak_hour} (Peak Surge)</span>
            <span>Hour {activeScenarioResult?.total_timesteps || 18} (Receding)</span>
          </div>
        </div>
      </div>

      {/* Current Hour Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">FLOOD EXTENT (SQ KM)</div>
          <div className="text-xl font-bold font-mono text-ts-primary mt-1">
            {currentStep?.flood_extent_sqkm.toFixed(1)} km²
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">Peak: {activeScenarioResult?.peak_flood_extent_sqkm} km²</div>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">MAX WATER DEPTH</div>
          <div className="text-xl font-bold font-mono text-ts-danger mt-1">
            {currentStep?.max_water_depth_m.toFixed(2)} m
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">Mean Depth: {currentStep?.mean_water_depth_m.toFixed(2)}m</div>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">INUNDATED BUILDINGS</div>
          <div className="text-xl font-bold font-mono text-ts-warning mt-1">
            {currentStep?.inundated_buildings_count.toLocaleString()}
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">Commercial & Residential</div>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">IMPACTED POPULATION</div>
          <div className="text-xl font-bold font-mono text-ts-accent mt-1">
            {currentStep?.population_impacted.toLocaleString()}
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">Direct & Secondary Loss</div>
        </div>
      </div>

      {/* Propagation Chart + Submerged Assets List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Inundation Evolution Curve */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono font-bold text-ts-text flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-ts-primary" />
              <span>HYDROGRAPH INUNDATION PROPAGATION CURVE</span>
            </div>
            <span className="text-[10px] font-mono text-ts-muted">Extent vs Impacted Population</span>
          </div>

          <div className="h-64 w-full">
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
                  labelFormatter={(label) => `Hour ${label}`}
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
        </div>

        {/* Right Col: Submerged Facilities List */}
        <div className="glass-panel rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-ts-card-border pb-1.5">
            <div className="font-mono text-xs font-bold text-ts-danger flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>SUBMERGED CRITICAL ASSETS</span>
            </div>
            <span className="text-[10px] font-mono text-ts-muted">{activeScenarioResult?.submerged_critical_nodes.length || 0} Assets</span>
          </div>

          <div className="space-y-2 text-xs">
            {activeScenarioResult?.submerged_critical_nodes.map((node, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-ts-bg/60 border border-ts-danger/40 space-y-1">
                <div className="flex items-center justify-between font-bold text-ts-text">
                  <span className="truncate">{node.name}</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-ts-danger/20 text-ts-danger shrink-0 ml-1">
                    {node.type}
                  </span>
                </div>
                <div className="text-[10px] text-ts-muted font-mono flex justify-between">
                  <span>Elev: {node.elev_m}m MSL</span>
                  <span className="text-ts-warning">Pop: {node.pop.toLocaleString()}</span>
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
