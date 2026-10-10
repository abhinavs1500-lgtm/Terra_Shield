import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Database,
  Radio,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Activity,
  Server,
  CloudSun,
  Globe
} from 'lucide-react';

export const DataSourcesView: React.FC = () => {
  const { sendCopilotQuery } = useApp();

  const [sources, setSources] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [quakes, setQuakes] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshAll();
  }, []);

  const refreshAll = async () => {
    setRefreshing(true);
    try {
      const [srcData, wData, qData] = await Promise.all([
        api.getDataSources(),
        api.getLiveWeather(),
        api.getLiveEarthquakes()
      ]);
      setSources(srcData);
      setWeather(wData);
      setQuakes(qData);
    } catch (e) {
      console.warn('Data sources refresh error:', e);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-ts-text select-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-panel rounded-2xl p-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-ts-primary font-semibold mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>EXTERNAL API CONNECTORS & DATA PROVENANCE REGISTRY</span>
          </div>
          <h1 className="text-xl font-extrabold font-mono text-ts-text">
            Live Telemetry Feeds & Sourced Data Freshness
          </h1>
          <p className="text-xs text-ts-muted">
            Audits public APIs, observation timestamps, sensor latencies, and explicit synthetic demonstration labels.
          </p>
        </div>

        <button
          onClick={refreshAll}
          disabled={refreshing}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-ts-primary to-ts-secondary text-slate-950 text-xs font-mono font-bold flex items-center space-x-2 shadow-md hover:scale-102 transition-transform disabled:opacity-50 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'SYNCING FEEDS...' : 'POLL LIVE FEEDS'}</span>
        </button>
      </div>

      {/* Live Feed Status Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Open-Meteo Live Telemetry Widget */}
        <div className="glass-panel-glow rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-ts-card-border pb-2">
            <div className="flex items-center space-x-2">
              <CloudSun className="w-4 h-4 text-ts-primary" />
              <span className="font-mono text-xs font-bold text-ts-text">OPEN-METEO LIVE ATMOSPHERIC API</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ts-success/15 text-ts-success border border-ts-success/30 font-bold">
              {weather?.status?.toUpperCase() || 'ONLINE'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-ts-bg/60 border border-ts-card-border">
              <div className="text-[10px] text-ts-muted">TEMPERATURE</div>
              <div className="text-lg font-bold text-ts-primary">{weather?.temperature_c}°C</div>
            </div>
            <div className="p-2.5 rounded-lg bg-ts-bg/60 border border-ts-card-border">
              <div className="text-[10px] text-ts-muted">WIND SPEED</div>
              <div className="text-lg font-bold text-ts-accent">{weather?.wind_speed_kmh} km/h</div>
            </div>
            <div className="p-2.5 rounded-lg bg-ts-bg/60 border border-ts-card-border">
              <div className="text-[10px] text-ts-muted">HUMIDITY</div>
              <div className="text-lg font-bold text-ts-warning">{weather?.humidity_pct}%</div>
            </div>
            <div className="p-2.5 rounded-lg bg-ts-bg/60 border border-ts-card-border">
              <div className="text-[10px] text-ts-muted">PRECIPITATION</div>
              <div className="text-lg font-bold text-ts-info">{weather?.precipitation_mm} mm</div>
            </div>
          </div>

          <div className="text-[10px] text-ts-muted font-mono flex justify-between pt-1">
            <span>Coordinates: {weather?.lat}°N, {weather?.lng}°W</span>
            <span>Synced: {weather?.timestamp}</span>
          </div>
        </div>

        {/* USGS Real-time Earthquake Widget */}
        <div className="glass-panel-glow rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-ts-card-border pb-2">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-ts-danger" />
              <span className="font-mono text-xs font-bold text-ts-text">USGS REAL-TIME SEISMIC FEED</span>
            </div>
            <span className="text-[10px] font-mono text-ts-muted">Latest Global Events</span>
          </div>

          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {quakes.slice(0, 3).map((q, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-ts-bg/60 border border-ts-card-border flex items-center justify-between text-xs font-mono">
                <div className="truncate pr-2">
                  <div className="font-semibold text-ts-text truncate">{q.place}</div>
                  <div className="text-[10px] text-ts-muted">{q.time} • Depth: {q.depth_km}km</div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded border shrink-0 ${
                  q.magnitude >= 4.0 ? 'bg-ts-danger/20 text-ts-danger border-ts-danger/40' : 'bg-ts-warning/20 text-ts-warning border-ts-warning/40'
                }`}>
                  M{q.magnitude}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sourced Data Registry Table */}
      <div className="glass-panel rounded-2xl p-5 space-y-3">
        <div className="font-mono text-xs font-bold text-ts-text flex items-center space-x-2">
          <Database className="w-4 h-4 text-ts-primary" />
          <span>DATA SOURCE REGISTRY & TRANSPARENCY AUDIT</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-ts-card-border text-ts-muted text-[11px]">
                <th className="pb-2">DATASET / CONNECTOR</th>
                <th className="pb-2">PROVIDER</th>
                <th className="pb-2">DOMAIN</th>
                <th className="pb-2">STATUS</th>
                <th className="pb-2">FRESHNESS</th>
                <th className="pb-2">DATA CLASS</th>
                <th className="pb-2">CONFIDENCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ts-card-border/50 text-ts-text font-sans">
              {sources.map((ds, idx) => (
                <tr key={idx} className="hover:bg-ts-bg/50 transition-colors">
                  <td className="py-3 font-bold text-xs font-mono text-ts-primary">{ds.name}</td>
                  <td className="py-3 text-xs text-ts-text">{ds.provider}</td>
                  <td className="py-3 text-xs text-ts-muted font-mono">{ds.type}</td>
                  <td className="py-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ts-success/15 text-ts-success border border-ts-success/30 font-bold uppercase">
                      {ds.status}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-ts-muted font-mono">{ds.freshness}</td>
                  <td className="py-3">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      ds.is_real 
                        ? 'bg-ts-primary/10 text-ts-primary border-ts-primary/30' 
                        : 'bg-ts-warning/10 text-ts-warning border-ts-warning/30'
                    }`}>
                      {ds.is_real ? 'Real Observed Data' : 'Calibrated Model'}
                    </span>
                  </td>
                  <td className="py-3 text-xs font-mono font-bold text-ts-accent">
                    {(ds.confidence * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
