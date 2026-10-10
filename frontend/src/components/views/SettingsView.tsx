import React from 'react';
import { useApp } from '../../context/AppContext';
import { ThemeName, UserRole } from '../../types';
import {
  Settings,
  Palette,
  UserCheck,
  ShieldAlert,
  Info,
  CheckCircle2,
  Cpu,
  Sparkles,
  Server
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { theme, setTheme, userRole, setUserRole } = useApp();

  const themes: { id: ThemeName; title: string; desc: string; palette: string[]; tag: string }[] = [
    {
      id: 'holocore',
      title: 'Theme A — HOLOCORE (Default)',
      desc: 'Deep midnight environment, electric cyan and violet holographic glass, luminous digital-twin contours and scanning lines.',
      palette: ['#030712', '#00f0ff', '#8b5cf6', '#00ff9d'],
      tag: 'SCI-FI DIGITAL TWIN'
    },
    {
      id: 'orbital-command',
      title: 'Theme B — ORBITAL COMMAND',
      desc: 'Dark navy operations center aesthetic, radar telemetry, amber/cyan tactical status indicators for mission control.',
      palette: ['#0b132b', '#f59e0b', '#3b82f6', '#06b6d4'],
      tag: 'MISSION CONTROL'
    },
    {
      id: 'satellite-intel',
      title: 'Theme C — SATELLITE INTELLIGENCE',
      desc: 'Topographic GIS earth tones, emerald hazard contours, high-contrast scientific legend presentation.',
      palette: ['#141b18', '#10b981', '#0284c7', '#eab308'],
      tag: 'EARTH TOPOGRAPHY'
    },
    {
      id: 'neo-cyber',
      title: 'Theme D — NEO CYBER',
      desc: 'Charcoal cyberpunk environment with high-voltage neon green, magenta, and technical infrastructure network grids.',
      palette: ['#09090b', '#00ff9d', '#ff007f', '#00f0ff'],
      tag: 'CYBERPUNK NETWORK'
    },
    {
      id: 'clarity-analytics',
      title: 'Theme E — CLARITY ANALYTICS',
      desc: 'Clean crisp light interface with white/slate surfaces, accessible contrast, and professional analytical charts.',
      palette: ['#ffffff', '#0284c7', '#4f46e5', '#0f172a'],
      tag: 'CLEAN LIGHT UI'
    }
  ];

  const roles: { role: UserRole; desc: string }[] = [
    { role: 'Urban Planner', desc: 'Evaluates zoning, slope stability, multi-criteria land ratings, and development permits.' },
    { role: 'Emergency Director', desc: 'Conducts disaster simulations, hospital triage, bridge cascade tracing, and recovery dispatch.' },
    { role: 'Citizen', desc: 'Explores neighborhood flood exposure, evacuation route status, and damage incident reporting.' },
    { role: 'Environmental Researcher', desc: 'Analyzes NDVI vegetation canopy, urban heat island anomalies, and CDC SVI equity metrics.' },
    { role: 'System Admin', desc: 'Manages live telemetry connectors, ML benchmark evaluation suites, and system audit logs.' }
  ];

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-ts-text select-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-panel rounded-2xl p-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-ts-primary font-semibold mb-1">
            <Settings className="w-3.5 h-3.5" />
            <span>SYSTEM PREFERENCES & DESIGN SYSTEM</span>
          </div>
          <h1 className="text-xl font-extrabold font-mono text-ts-text">
            Visual Identity Themes & Operational Workspace Roles
          </h1>
          <p className="text-xs text-ts-muted">
            Seamlessly switch complete design tokens, color variables, and user perspective profiles without data loss.
          </p>
        </div>
      </div>

      {/* 5-Theme Switcher Gallery */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-ts-card-border pb-2">
          <div className="font-mono text-xs font-bold text-ts-text flex items-center space-x-2">
            <Palette className="w-4 h-4 text-ts-primary" />
            <span>SELECT APPLICATION VISUAL THEME (5 DISTINCT PALETTES)</span>
          </div>
          <span className="text-[10px] font-mono text-ts-primary font-bold">Active: {theme.toUpperCase()}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map(t => {
            const isCurrent = theme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  isCurrent 
                    ? 'bg-ts-primary/15 border-ts-primary shadow-xl shadow-ts-primary/20 ring-2 ring-ts-primary' 
                    : 'bg-ts-bg/80 border-ts-card-border hover:border-ts-primary/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-ts-bg border border-ts-card-border">
                      {t.tag}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono font-bold text-ts-primary flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ACTIVE</span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-ts-text font-mono">{t.title}</h3>
                  <p className="text-xs text-ts-muted mt-1 leading-relaxed">{t.desc}</p>
                </div>

                {/* Color Swatches */}
                <div className="flex items-center space-x-2 pt-2 border-t border-ts-card-border/50">
                  {t.palette.map((color, cIdx) => (
                    <div
                      key={cIdx}
                      className="w-6 h-6 rounded-lg border border-white/20 shadow-sm"
                      style={{ backgroundColor: color }}
                    ></div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operational Workspace Role Selector */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-ts-card-border pb-2">
          <div className="font-mono text-xs font-bold text-ts-text flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-ts-accent" />
            <span>OPERATIONAL WORKSPACE PERSPECTIVES</span>
          </div>
          <span className="text-[10px] font-mono text-ts-accent font-bold">Current: {userRole}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {roles.map(r => (
            <div
              key={r.role}
              onClick={() => setUserRole(r.role)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                userRole === r.role 
                  ? 'bg-ts-accent/15 border-ts-accent shadow-md' 
                  : 'bg-ts-bg/80 border-ts-card-border hover:border-ts-accent/50'
              }`}
            >
              <div className="space-y-0.5 pr-2">
                <div className="font-bold text-xs font-mono text-ts-text">{r.role}</div>
                <div className="text-xs text-ts-muted leading-relaxed">{r.desc}</div>
              </div>
              {userRole === r.role && (
                <CheckCircle2 className="w-4 h-4 text-ts-accent shrink-0 mt-0.5" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* System Diagnostics & Platform Integrity */}
      <div className="glass-panel rounded-2xl p-5 space-y-3">
        <div className="font-mono text-xs font-bold text-ts-text flex items-center space-x-2">
          <Server className="w-4 h-4 text-ts-primary" />
          <span>SYSTEM ARCHITECTURE & COMPUTATIONAL ENGINE SPECS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-ts-bg/60 border border-ts-card-border">
            <div className="text-[10px] text-ts-muted">BACKEND RUNTIME</div>
            <div className="font-bold text-ts-text mt-0.5">FastAPI Python 3.13 • Uvicorn</div>
          </div>
          <div className="p-3 rounded-xl bg-ts-bg/60 border border-ts-card-border">
            <div className="text-[10px] text-ts-muted">GRAPH & MCDA ENGINES</div>
            <div className="font-bold text-ts-primary mt-0.5">NetworkX • Scipy • Knapsack DAG</div>
          </div>
          <div className="p-3 rounded-xl bg-ts-bg/60 border border-ts-card-border">
            <div className="text-[10px] text-ts-muted">GEOSPATIAL 3D & 2D</div>
            <div className="font-bold text-ts-accent mt-0.5">Leaflet GIS • Three.js WebGL Twin</div>
          </div>
        </div>
      </div>
    </div>
  );
};
