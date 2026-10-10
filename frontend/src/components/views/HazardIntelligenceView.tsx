import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { MultiHazardReport } from '../../types';
import {
  Flame,
  Waves,
  ShieldAlert,
  AlertTriangle,
  History,
  Navigation,
  Sparkles,
  Info,
  Calendar,
  DollarSign
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';

export const HazardIntelligenceView: React.FC = () => {
  const { 
    selectedParcelId, 
    selectedParcel, 
    setSelectedParcelId, 
    parcels, 
    sendCopilotQuery,
    setCurrentView 
  } = useApp();

  const [hazardReport, setHazardReport] = useState<MultiHazardReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedParcel) {
      setLoading(true);
      api.getHazardReport(
        selectedParcel.coordinates[0][0],
        selectedParcel.coordinates[0][1],
        selectedParcel.id
      ).then(res => {
        setHazardReport(res);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [selectedParcelId, selectedParcel]);

  const getRiskBadge = (level: string) => {
    if (level === 'Severe' || level === 'High') {
      return 'bg-ts-danger/15 text-ts-danger border-ts-danger/40';
    }
    if (level === 'Moderate') {
      return 'bg-ts-warning/15 text-ts-warning border-ts-warning/40';
    }
    return 'bg-ts-success/15 text-ts-success border-ts-success/40';
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-ts-text select-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-panel rounded-2xl p-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-ts-danger font-semibold mb-1">
            <Flame className="w-3.5 h-3.5" />
            <span>MULTI-HAZARD INTELLIGENCE & EXPOSURE MATRIX</span>
          </div>
          <h1 className="text-xl font-extrabold font-mono text-ts-text">
            Natural Hazard Threat Profiles & Historical Benchmarks
          </h1>
          <p className="text-xs text-ts-muted">
            Integrates FEMA NFHL, NOAA storm surge, USGS seismic hazard models, and CAL FIRE indices.
          </p>
        </div>

        {/* Parcel Selector */}
        <select
          value={selectedParcelId}
          onChange={(e) => setSelectedParcelId(e.target.value)}
          className="bg-ts-bg border border-ts-card-border rounded-xl px-3 py-2 text-xs font-mono font-semibold text-ts-text focus:border-ts-primary outline-none"
        >
          {parcels.map(p => (
            <option key={p.id} value={p.id}>
              {p.id} — {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Composite Indicator & Radar Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composite Threat Score Card */}
        <div className="glass-panel-glow rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-ts-muted">COMPOSITE HAZARD INDEX</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getRiskBadge(hazardReport?.overall_threat_level || '')}`}>
                {hazardReport?.overall_threat_level}
              </span>
            </div>

            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-5xl font-extrabold font-mono text-ts-danger">
                {hazardReport?.composite_hazard_index.toFixed(1)}
              </span>
              <span className="text-sm font-mono text-ts-muted">/ 100</span>
            </div>
            <div className="text-xs text-ts-muted mt-1">
              Location: <b className="text-ts-text">{hazardReport?.location_name}</b>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-ts-bg/80 border border-ts-card-border space-y-1.5 text-xs font-mono">
            <div className="text-[10px] text-ts-muted flex items-center space-x-1">
              <Navigation className="w-3 h-3 text-ts-primary" />
              <span>EVACUATION ROUTE STATUS:</span>
            </div>
            <div className="font-bold text-ts-accent">
              {hazardReport?.evacuation_route_status}
            </div>
          </div>

          <button
            onClick={() => sendCopilotQuery(`Evaluate the multi-hazard exposure for ${selectedParcel?.name}`)}
            className="w-full py-2 rounded-xl bg-ts-danger/15 hover:bg-ts-danger/25 border border-ts-danger/40 text-ts-danger text-xs font-mono font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI HAZARD BRIEFING</span>
          </button>
        </div>

        {/* Hazard Radar Chart */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col items-center justify-center">
          <div className="text-xs font-mono font-bold text-ts-muted mb-2 w-full flex items-center justify-between">
            <span>MULTI-HAZARD RADAR PROFILE</span>
            <span className="text-[10px] text-ts-danger font-normal">Score vs 35 Threshold</span>
          </div>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={hazardReport?.radar_data || []}>
                <PolarGrid stroke="var(--ts-card-border)" />
                <PolarAngleAxis dataKey="hazard" stroke="var(--ts-muted)" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--ts-card-border)" tick={{ fontSize: 8 }} />
                <Radar name="Exposure" dataKey="score" stroke="#ff0055" fill="#ff0055" fillOpacity={0.4} />
                <Radar name="Benchmark" dataKey="benchmark" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.1} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Scenario Simulator Launcher Card */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="text-xs font-mono font-bold text-ts-primary flex items-center space-x-1.5 mb-2">
              <Waves className="w-4 h-4" />
              <span>DYNAMIC SCENARIO SIMULATION</span>
            </div>
            <p className="text-xs text-ts-muted leading-relaxed">
              Launch a dynamic hydrological flood simulation with customizable rainfall intensity (mm/hr), storm surge elevation, and asset disruption models.
            </p>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 rounded bg-ts-bg/60 border border-ts-card-border">
              <span className="text-ts-muted">100-Yr Return Flood:</span>
              <span className="text-ts-danger font-bold">Zone AE</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-ts-bg/60 border border-ts-card-border">
              <span className="text-ts-muted">Seismic Liquefaction:</span>
              <span className="text-ts-warning font-bold">Moderate-High</span>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('simulator')}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-ts-primary to-ts-secondary text-slate-950 text-xs font-mono font-bold hover:scale-102 transition-transform shadow-md"
          >
            LAUNCH SCENARIO SIMULATOR
          </button>
        </div>
      </div>

      {/* Hazard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hazardReport?.hazards.map((h, i) => (
          <div key={i} className="glass-panel rounded-xl p-4 space-y-3 hover:border-ts-primary/60 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs font-mono text-ts-text">{h.hazard_type}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getRiskBadge(h.risk_level)}`}>
                  {h.risk_level} ({h.score})
                </span>
              </div>
              <p className="text-xs text-ts-muted leading-relaxed">{h.primary_driver}</p>
            </div>

            <div className="pt-2 border-t border-ts-card-border/60 space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between text-ts-muted">
                <span>Frequency:</span>
                <span className="text-ts-text">{h.historical_frequency}</span>
              </div>
              <div className="flex justify-between text-ts-muted">
                <span>Uncertainty Margin:</span>
                <span className="text-ts-accent">±{h.uncertainty_margin}%</span>
              </div>
              <div className="text-[10px] text-ts-muted/80 pt-1">
                <b>Source:</b> {h.data_source}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Historical Disaster Events Timeline */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-ts-card-border pb-2">
          <div className="font-mono text-xs font-bold text-ts-text flex items-center space-x-2">
            <History className="w-4 h-4 text-ts-primary" />
            <span>REGIONAL HISTORICAL DISASTER EVENTS ARCHIVE</span>
          </div>
          <span className="text-[10px] font-mono text-ts-muted">Documented Records</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hazardReport?.historical_events_nearby.map((evt, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-ts-bg/60 border border-ts-card-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-ts-text">{evt.title}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ts-primary/10 text-ts-primary border border-ts-primary/30">
                  {evt.date}
                </span>
              </div>
              <p className="text-xs text-ts-muted leading-relaxed">{evt.summary}</p>
              <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-ts-muted border-t border-ts-card-border/40">
                <span>Type: {evt.type}</span>
                <span className="text-ts-warning font-bold">
                  Loss: {String(evt.damage_est_usd).startsWith('₹') ? evt.damage_est_usd : `₹${evt.damage_est_usd}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
