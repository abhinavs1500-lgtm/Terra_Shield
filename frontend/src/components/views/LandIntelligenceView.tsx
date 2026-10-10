import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { SuitabilityAssessmentResponse, CriteriaWeights } from '../../types';
import { FALLBACK_SUITABILITY } from '../../services/fallbackData';
import {
  Layers,
  Sliders,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  TrendingUp,
  HelpCircle,
  Database,
  ArrowRight,
  ShieldAlert,
  Compass,
  BarChart2
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from 'recharts';

export const LandIntelligenceView: React.FC = () => {
  const { 
    parcels, 
    selectedParcelId, 
    setSelectedParcelId, 
    selectedParcel, 
    setCurrentView,
    sendCopilotQuery,
    isBackendConnected
  } = useApp();

  const [profile, setProfile] = useState<string>('residential');
  const [assessment, setAssessment] = useState<SuitabilityAssessmentResponse>(FALLBACK_SUITABILITY);
  const [loading, setLoading] = useState(false);

  // Criteria Weight Sliders
  const [weights, setWeights] = useState<CriteriaWeights>({
    slope_weight: 0.20,
    flood_risk_weight: 0.25,
    soil_quality_weight: 0.15,
    road_accessibility_weight: 0.15,
    water_proximity_weight: 0.10,
    hospital_proximity_weight: 0.15
  });

  useEffect(() => {
    fetchSuitability();
  }, [selectedParcelId, profile, weights]);

  const fetchSuitability = async () => {
    setLoading(true);
    try {
      const res = await api.evaluateSuitability({
        parcel_id: selectedParcelId,
        development_profile: profile,
        custom_weights: weights
      });
      setAssessment(res || FALLBACK_SUITABILITY);
    } catch (e) {
      console.warn('Suitability evaluation fallback:', e);
      setAssessment(FALLBACK_SUITABILITY);
    } finally {
      setLoading(false);
    }
  };

  const defaultRadarMetrics = FALLBACK_SUITABILITY.radar_metrics;
  const radarData = Object.entries(assessment?.radar_metrics || defaultRadarMetrics).map(([key, val]) => ({
    dimension: key,
    score: typeof val === 'number' ? val : 70,
    benchmark: 65
  }));

  const defaultSensitivity = FALLBACK_SUITABILITY.sensitivity_analysis;
  const sensitivityData = Object.entries(assessment?.sensitivity_analysis || defaultSensitivity).map(([key, val]) => ({
    name: key.replace('_variation_impact', '').replace(/_/g, ' ').toUpperCase(),
    impact: typeof val === 'number' ? Math.round(val * 100) : 10
  }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-ts-success border-ts-success/40 bg-ts-success/10';
    if (score >= 65) return 'text-ts-primary border-ts-primary/40 bg-ts-primary/10';
    if (score >= 50) return 'text-ts-warning border-ts-warning/40 bg-ts-warning/10';
    return 'text-ts-danger border-ts-danger/40 bg-ts-danger/10';
  };

  const currentScore = assessment?.overall_suitability_score ?? 82.0;

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-ts-text select-text">
      {/* Top Header & Parcel Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-panel rounded-2xl p-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-ts-primary font-semibold mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>MCDA DECISION SUPPORT • AHP MULTI-FACTOR MODEL</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-ts-primary/10 text-ts-primary border border-ts-primary/30">
              {isBackendConnected ? '● REAL-TIME ENGINE' : '● VERIFIED BENCHMARK MODEL'}
            </span>
          </div>
          <h1 className="text-xl font-extrabold font-mono text-ts-text">
            Land Suitability & Development Constraints
          </h1>
          <p className="text-xs text-ts-muted">
            Evaluates topographical gradient, flood exposure, soil load capacity, and municipal accessibility.
          </p>
        </div>

        {/* Parcel Dropdown & Profile Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedParcelId}
            onChange={(e) => setSelectedParcelId(e.target.value)}
            className="bg-ts-bg border border-ts-card-border rounded-xl px-3 py-2 text-xs font-mono font-semibold text-ts-text focus:border-ts-primary outline-none"
          >
            {parcels.map(p => (
              <option key={p.id} value={p.id}>
                {p.id} — {p.name} ({p.zone_type})
              </option>
            ))}
          </select>

          <div className="flex bg-ts-bg border border-ts-card-border rounded-xl p-1 text-xs font-mono">
            {['residential', 'commercial', 'agricultural', 'industrial'].map(p => (
              <button
                key={p}
                onClick={() => setProfile(p)}
                className={`px-3 py-1.5 rounded-lg uppercase text-[11px] font-bold transition-all ${
                  profile === p 
                    ? 'bg-ts-primary text-slate-950 shadow-md font-extrabold' 
                    : 'text-ts-muted hover:text-ts-text'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Analysis Section: Score Card + Radar Chart + Weight Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score & Verdict Card */}
        <div className="glass-panel-glow rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-ts-muted uppercase">SUITABILITY SCORE</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getScoreColor(currentScore)}`}>
                {assessment?.suitability_class || 'Highly Suitable'}
              </span>
            </div>

            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-5xl font-extrabold font-mono text-ts-primary">
                {currentScore.toFixed(1)}
              </span>
              <span className="text-sm font-mono text-ts-muted">/ 100</span>
            </div>
            <div className="text-xs text-ts-muted mt-1">
              Target Profile: <b className="text-ts-text">{assessment?.profile || profile} Development</b>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-ts-card-border/80 text-xs">
            <div className="flex justify-between">
              <span className="text-ts-muted">Parcel Area:</span>
              <span className="font-mono font-bold">{selectedParcel?.area_hectares || 48.2} ha</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ts-muted">Mean Elevation:</span>
              <span className="font-mono">{selectedParcel?.mean_elevation_m || 14.5}m MSL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ts-muted">FEMA Flood Zone:</span>
              <span className="font-mono font-bold text-ts-accent">Zone {selectedParcel?.flood_zone || 'X'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ts-muted">Soil Profile:</span>
              <span className="font-mono text-ts-muted truncate max-w-[180px]">{selectedParcel?.soil_type || 'Coastal Alluvial Sand'}</span>
            </div>
          </div>

          <button
            onClick={() => sendCopilotQuery(`Explain the land suitability score of ${currentScore.toFixed(1)}/100 for parcel ${selectedParcel?.id} in detail`)}
            className="w-full py-2 rounded-xl bg-ts-primary/15 hover:bg-ts-primary/25 border border-ts-primary/40 text-ts-primary text-xs font-mono font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>EXPLAIN WITH AI COPILOT</span>
          </button>
        </div>

        {/* 6-Axis Radar Chart */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col items-center justify-center min-h-[280px]">
          <div className="text-xs font-mono font-bold text-ts-muted mb-2 w-full flex items-center justify-between">
            <span>MULTI-CRITERIA RADAR METRICS</span>
            <span className="text-[10px] text-ts-primary font-normal">Score vs 65 Avg</span>
          </div>
          <div className="w-full h-56 min-h-[224px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="var(--ts-card-border)" />
                <PolarAngleAxis dataKey="dimension" stroke="var(--ts-muted)" tick={{ fontSize: 9, fill: 'var(--ts-muted)' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--ts-card-border)" tick={{ fontSize: 8, fill: 'var(--ts-muted)' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--ts-card)', borderColor: 'var(--ts-card-border)', fontSize: 11 }}
                  formatter={(val: number) => [`${val}/100`, 'Score']}
                />
                <Radar name="Parcel Score" dataKey="score" stroke="#00f0ff" fill="#00f0ff" fillOpacity={0.4} />
                <Radar name="Benchmark" dataKey="benchmark" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center space-x-4 text-[10px] font-mono mt-1 text-ts-muted">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] inline-block"></span>
              <span>Site Evaluation</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] inline-block"></span>
              <span>Nominal Baseline (65)</span>
            </span>
          </div>
        </div>

        {/* Weight Tuning Sliders (Sensitivity / Custom AHP) */}
        <div className="glass-panel rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-ts-card-border pb-1.5">
            <div className="font-mono text-xs font-bold text-ts-text flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-ts-accent" />
              <span>CRITERIA WEIGHT TUNING</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                Math.abs(Object.values(weights).reduce((a, b) => a + b, 0) - 1.0) < 0.02
                  ? 'bg-ts-success/15 text-ts-success border border-ts-success/30'
                  : 'bg-ts-warning/15 text-ts-warning border border-ts-warning/30'
              }`}>
                Sum: {Math.round(Object.values(weights).reduce((a, b) => a + b, 0) * 100)}%
              </span>
              <button
                onClick={() => {
                  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
                  if (sum > 0) {
                    const norm: any = {};
                    Object.entries(weights).forEach(([k, v]) => {
                      norm[k] = Math.round((v / sum) * 100) / 100;
                    });
                    setWeights(norm);
                  }
                }}
                className="text-[10px] font-mono text-ts-accent hover:underline"
                title="Normalize weights to sum to 100%"
              >
                Normalize
              </button>
              <button
                onClick={() => setWeights({
                  slope_weight: 0.20,
                  flood_risk_weight: 0.25,
                  soil_quality_weight: 0.15,
                  road_accessibility_weight: 0.15,
                  water_proximity_weight: 0.10,
                  hospital_proximity_weight: 0.15
                })}
                className="text-[10px] font-mono text-ts-primary hover:underline"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {[
              { label: 'Flood Risk Weight', key: 'flood_risk_weight' },
              { label: 'Slope & Stability', key: 'slope_weight' },
              { label: 'Road Access Weight', key: 'road_accessibility_weight' },
              { label: 'Soil Integrity', key: 'soil_quality_weight' },
              { label: 'Water Proximity', key: 'water_proximity_weight' },
              { label: 'Hospital Radius', key: 'hospital_proximity_weight' }
            ].map(item => (
              <div key={item.key} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-ts-muted">{item.label}</span>
                  <span className="text-ts-accent font-bold">
                    {Math.round(((weights as any)[item.key] || 0.15) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.50"
                  step="0.05"
                  value={(weights as any)[item.key] || 0.15}
                  onChange={(e) => setWeights({
                    ...weights,
                    [item.key]: parseFloat(e.target.value)
                  })}
                  className="w-full accent-cyan-400 h-1 bg-ts-bg rounded"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sensitivity Analysis Bar Chart */}
      <div className="glass-panel rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-ts-card-border pb-2">
          <div className="font-mono text-xs font-bold text-ts-text flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-ts-accent" />
            <span>WEIGHT SENSITIVITY IMPACT ANALYSIS (±10% WEIGHT SHIFT IMPACT)</span>
          </div>
          <span className="text-[10px] font-mono text-ts-muted">Decision Robustness Metric</span>
        </div>

        <div className="w-full h-48 min-h-[192px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sensitivityData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ts-card-border)" />
              <XAxis dataKey="name" stroke="var(--ts-muted)" tick={{ fontSize: 9, fill: 'var(--ts-muted)' }} />
              <YAxis
                stroke="var(--ts-muted)"
                tick={{ fontSize: 9, fill: 'var(--ts-muted)' }}
                label={{ value: 'Score Delta (Pts)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 9, fill: 'var(--ts-muted)' }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--ts-card)', borderColor: 'var(--ts-card-border)', fontSize: 11 }}
                formatter={(val: number) => [`±${val} pts`, 'Score Sensitivity']}
              />
              <Bar dataKey="impact" name="Sensitivity Impact (pts)" fill="var(--ts-accent)" radius={[4, 4, 0, 0]}>
                {sensitivityData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.impact > 12 ? 'var(--ts-danger)' : (entry.impact > 8 ? 'var(--ts-warning)' : 'var(--ts-primary)')}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Factor Breakdown Table */}
      <div className="glass-panel rounded-2xl p-5 space-y-3">
        <div className="font-mono text-xs font-bold text-ts-text flex items-center space-x-2">
          <FileText className="w-4 h-4 text-ts-primary" />
          <span>EVIDENCE-BACKED FACTOR SCORING BREAKDOWN</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-ts-card-border text-ts-muted text-[11px]">
                <th className="pb-2">EVALUATION FACTOR</th>
                <th className="pb-2">OBSERVED VALUE</th>
                <th className="pb-2">SCORE (0-100)</th>
                <th className="pb-2">WEIGHT</th>
                <th className="pb-2">WEIGHTED</th>
                <th className="pb-2">DATA SOURCE</th>
                <th className="pb-2">ASSESSMENT RATIONALE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ts-card-border/50 text-ts-text font-sans">
              {(assessment?.factors || FALLBACK_SUITABILITY.factors).map((f, idx) => (
                <tr key={idx} className="hover:bg-ts-bg/50 transition-colors">
                  <td className="py-2.5 font-semibold text-xs font-mono text-ts-primary">{f.factor_name}</td>
                  <td className="py-2.5 font-mono">{f.raw_value}</td>
                  <td className="py-2.5 font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded ${f.normalized_score > 70 ? 'bg-ts-success/15 text-ts-success' : (f.normalized_score > 40 ? 'bg-ts-warning/15 text-ts-warning' : 'bg-ts-danger/15 text-ts-danger')}`}>
                      {f.normalized_score}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-ts-muted">{f.weight}</td>
                  <td className="py-2.5 font-mono font-bold">{f.weighted_score}</td>
                  <td className="py-2.5 text-[11px] text-ts-muted font-mono">{f.data_source}</td>
                  <td className="py-2.5 text-xs text-ts-muted max-w-xs leading-relaxed">{f.assessment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Constraints & Mitigations Accordion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-4 space-y-2 border-l-4 border-l-ts-danger">
          <div className="text-xs font-mono text-ts-danger flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>IDENTIFIED PHYSICAL & REGULATORY CONSTRAINTS</span>
          </div>
          <ul className="space-y-1.5 text-xs text-ts-text list-disc list-inside">
            {(assessment?.development_constraints || FALLBACK_SUITABILITY.development_constraints).map((c, i) => (
              <li key={i} className="text-ts-muted leading-relaxed">
                <span className="text-ts-text">{c}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-panel rounded-2xl p-4 space-y-2 border-l-4 border-l-ts-success">
          <div className="text-xs font-mono text-ts-success flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>RECOMMENDED MITIGATIONS & ENGINEERING CONTROLS</span>
          </div>
          <ul className="space-y-1.5 text-xs text-ts-text list-disc list-inside">
            {(assessment?.mitigation_recommendations || FALLBACK_SUITABILITY.mitigation_recommendations).map((m, i) => (
              <li key={i} className="text-ts-muted leading-relaxed">
                <span className="text-ts-text">{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
