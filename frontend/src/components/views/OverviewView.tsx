import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  ShieldAlert,
  Layers,
  Waves,
  Network,
  Wrench,
  Trees,
  TrendingUp,
  MapPin,
  ArrowRight,
  ExternalLink,
  Activity,
  AlertTriangle,
  FileCheck2,
  Box,
  Compass,
  Radio
} from 'lucide-react';

export const OverviewView: React.FC = () => {
  const { 
    setCurrentView, 
    parcels, 
    setSelectedParcelId, 
    sendCopilotQuery, 
    userRole 
  } = useApp();

  const [weather, setWeather] = useState<any>(null);
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [damageReports, setDamageReports] = useState<any[]>([]);
  const [infraGraph, setInfraGraph] = useState<any>(null);

  useEffect(() => {
    api.getLiveWeather().then(setWeather).catch(() => {});
    api.getDataSources().then(setDataSources).catch(() => {});
    api.getDamageReports().then(setDamageReports).catch(() => {});
    api.getInfraGraph().then(setInfraGraph).catch(() => {});
  }, []);

  const stats = [
    { label: 'MONITORED PARCELS', value: `${parcels.length} Zones`, change: '+2 Pending Review', icon: Layers, color: 'text-ts-primary' },
    { label: 'ACTIVE HAZARD LEVEL', value: 'Elevated (53/100)', change: 'FEMA 100-Yr Zone AE', icon: ShieldAlert, color: 'text-ts-warning' },
    { label: 'CRITICAL INFRASTRUCTURE', value: `${infraGraph?.total_nodes || 10} Nodes`, change: '2 Bottlenecks Flagged', icon: Network, color: 'text-ts-accent' },
    { label: 'RECOVERY READINESS', value: '₹1.20 Cr Cap', change: '85.4% Optimized Efficiency', icon: Wrench, color: 'text-ts-info' }
  ];

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-ts-text">
      {/* Top Welcome Banner */}
      <div className="glass-panel-glow rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-ts-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-ts-primary font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-ts-success animate-pulse inline-block"></span>
              <span>OPERATIONAL WORKSPACE • {userRole.toUpperCase()} CONSOLE</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-mono">
              TerraShield AI Geospatial Intelligence & Resilience Hub
            </h1>
            <p className="text-xs text-ts-muted max-w-2xl mt-1">
              Unified location intelligence, hydrological disaster simulation, cascading infrastructure dependency mapping, and deterministic recovery optimization for India's strategic coastal and riverine basins.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setCurrentView('digital-twin')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-ts-primary to-ts-secondary text-slate-950 text-xs font-mono font-bold flex items-center space-x-2 shadow-lg shadow-ts-primary/25 hover:scale-105 transition-all"
            >
              <Box className="w-4 h-4" />
              <span>LAUNCH 3D TWIN</span>
            </button>
            <button
              onClick={() => setCurrentView('simulator')}
              className="px-3.5 py-2 rounded-xl bg-ts-bg border border-ts-card-border hover:border-ts-primary text-ts-text text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Waves className="w-4 h-4 text-ts-primary" />
              <span>RUN SIMULATION</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const gradients = [
            'from-ts-primary/30 to-ts-secondary/10',
            'from-ts-warning/30 to-ts-danger/10',
            'from-ts-accent/30 to-ts-info/10',
            'from-ts-info/30 to-ts-success/10',
          ];
          const borderColors = ['border-ts-primary/40', 'border-ts-warning/40', 'border-ts-accent/40', 'border-ts-info/40'];
          return (
            <div key={i} className={`glass-panel rounded-xl p-4 flex flex-col justify-between border-t-2 ${borderColors[i]} hover:shadow-lg transition-all group relative overflow-hidden`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${gradients[i]} opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between text-ts-muted mb-3">
                  <span className="text-[10px] font-mono tracking-wider font-semibold">{stat.label}</span>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${borderColors[i].replace('border-', 'bg-').replace('/40', '/15')}`}>
                    <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-xl font-bold font-mono text-ts-text">{stat.value}</div>
                <div className="text-[11px] text-ts-muted mt-0.5">{stat.change}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Land Parcels Carousel + Quick Action Launchers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Land Parcels & Risk Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-mono text-xs font-bold text-ts-text flex items-center space-x-2">
              <Compass className="w-4 h-4 text-ts-primary" />
              <span>ACTIVE STUDY PARCELS & LAND INTELLIGENCE</span>
            </div>
            <button 
              onClick={() => setCurrentView('land')}
              className="text-xs text-ts-primary hover:underline font-mono flex items-center space-x-1"
            >
              <span>Full Parcel Matrix</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {parcels.slice(0, 4).map(p => (
              <div 
                key={p.id}
                onClick={() => {
                  setSelectedParcelId(p.id);
                  setCurrentView('land');
                }}
                className="glass-panel rounded-xl p-3.5 hover:border-ts-primary cursor-pointer transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ts-primary/10 text-ts-primary border border-ts-primary/30">
                      {p.id}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      p.flood_zone === 'X' 
                        ? 'bg-ts-success/15 text-ts-success border border-ts-success/30' 
                        : 'bg-ts-danger/15 text-ts-danger border border-ts-danger/30'
                    }`}>
                      Zone {p.flood_zone}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-ts-text group-hover:text-ts-primary transition-colors">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-ts-muted mt-1">
                    {p.zone_type} • {p.area_hectares} ha • Elev {p.mean_elevation_m}m
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-ts-card-border/60 flex items-center justify-between text-[10px] font-mono text-ts-muted">
                  <span>Slope: {p.mean_slope_deg}°</span>
                  <span className="text-ts-primary group-hover:translate-x-1 transition-transform flex items-center space-x-0.5">
                    <span>Evaluate</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick AI Intelligence Prompts */}
          <div className="glass-panel rounded-xl p-4 space-y-2">
            <div className="text-xs font-mono font-bold text-ts-text flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-ts-accent" />
              <span>ONE-CLICK RESILIENCE WORKFLOWS</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => sendCopilotQuery("Analyze plot P-101 for flood exposure and building suitability")}
                className="p-2.5 rounded-lg bg-ts-bg hover:bg-ts-primary/10 border border-ts-card-border hover:border-ts-primary/50 text-left text-xs transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="font-medium text-ts-text">Evaluate Mumbai Coastal Basin (P-101)</div>
                  <div className="text-[10px] text-ts-muted">Multi-criteria suitability & constraint report</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-ts-primary group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              <button
                onClick={() => sendCopilotQuery("Which critical repairs should be prioritized under ₹1.20 Cr budget?")}
                className="p-2.5 rounded-lg bg-ts-bg hover:bg-ts-primary/10 border border-ts-card-border hover:border-ts-primary/50 text-left text-xs transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="font-medium text-ts-text">Solve Disaster Recovery Schedule</div>
                  <div className="text-[10px] text-ts-muted">Deterministic knapsack solver with crew allocation</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-ts-primary group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Live Incident Feeds & Telemetry Freshness */}
        <div className="space-y-4">
          {/* Real-time Feeds Card */}
          <div className="glass-panel rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-ts-card-border pb-2">
              <div className="font-mono text-xs font-bold text-ts-text flex items-center space-x-1.5">
                <Radio className="w-3.5 h-3.5 text-ts-primary animate-pulse" />
                <span>TELEMETRY & SENSOR STATUS</span>
              </div>
              <span className="text-[10px] font-mono text-ts-success font-bold">ALL FEEDS SYNCED</span>
            </div>

            <div className="space-y-2 text-xs">
              {dataSources.slice(0, 4).map((ds, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-ts-bg/60 border border-ts-card-border/50">
                  <div className="truncate pr-2">
                    <div className="font-semibold text-ts-text truncate">{ds.name}</div>
                    <div className="text-[10px] text-ts-muted">{ds.provider}</div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ts-primary/10 text-ts-primary border border-ts-primary/30 shrink-0">
                    {ds.freshness}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Damage Reports */}
          <div className="glass-panel rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-ts-card-border pb-2">
              <div className="font-mono text-xs font-bold text-ts-text flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-ts-danger" />
                <span>RECENT DAMAGE INCIDENTS</span>
              </div>
              <button 
                onClick={() => setCurrentView('damage')}
                className="text-[10px] text-ts-primary hover:underline font-mono"
              >
                View All ({damageReports.length})
              </button>
            </div>

            <div className="space-y-2">
              {damageReports.slice(0, 3).map(dmg => (
                <div 
                  key={dmg.id}
                  onClick={() => setCurrentView('damage')}
                  className="p-2 rounded-lg bg-ts-bg/60 border border-ts-card-border/50 hover:border-ts-danger/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-xs text-ts-text truncate">{dmg.title}</span>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-ts-danger/15 text-ts-danger border border-ts-danger/30 shrink-0 ml-1">
                      {dmg.severity_grade.split(' ')[0]}
                    </span>
                  </div>
                  <div className="text-[10px] text-ts-muted truncate">{dmg.address}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
