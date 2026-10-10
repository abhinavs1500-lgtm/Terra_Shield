import React from 'react';
import { useApp } from '../../context/AppContext';
import { ThemeName } from '../../types';
import {
  Shield,
  ArrowRight,
  Box,
  Map,
  Waves,
  Network,
  Wrench,
  Layers,
  Sparkles,
  Palette,
  Compass,
  Radio,
  CheckCircle2,
  ChevronRight,
  Activity,
  Flame,
  Globe2
} from 'lucide-react';

export const LandingPageView: React.FC = () => {
  const { setCurrentView, theme, setTheme } = useApp();

  const themes: { id: ThemeName; label: string; color: string }[] = [
    { id: 'holocore', label: 'HOLOCORE', color: 'bg-cyan-400' },
    { id: 'orbital-command', label: 'ORBITAL', color: 'bg-amber-400' },
    { id: 'satellite-intel', label: 'SATELLITE', color: 'bg-emerald-400' },
    { id: 'neo-cyber', label: 'NEO CYBER', color: 'bg-green-400' },
    { id: 'clarity-analytics', label: 'CLARITY', color: 'bg-sky-500' }
  ];

  const features = [
    {
      title: 'Geospatial Intelligence',
      badge: 'INDIA GIS',
      desc: 'High-precision dark cartographic basemap constrained to the Indian subcontinent with vector boundary analytics.',
      icon: Map,
      color: 'text-ts-primary',
      borderColor: 'border-ts-primary/30',
      action: () => setCurrentView('map')
    },
    {
      title: 'Holographic Digital Twin',
      badge: '3D THREE.JS',
      desc: 'Next-gen holographic DEM terrain with animated scanlines, Fresnel rim edge glow shaders, and vertex glitch displacements.',
      icon: Box,
      color: 'text-ts-secondary',
      borderColor: 'border-ts-secondary/30',
      action: () => setCurrentView('digital-twin')
    },
    {
      title: 'Hydrological Disaster Simulator',
      badge: 'SIMULATION',
      desc: 'Time-stepped hydrodynamic flood and cyclone surge progression modeling with live water depth contours.',
      icon: Waves,
      color: 'text-ts-info',
      borderColor: 'border-ts-info/30',
      action: () => setCurrentView('simulator')
    },
    {
      title: 'Infrastructure Cascade Network',
      badge: 'NETWORKX',
      desc: 'Models cross-sector dependencies between power grids, hospitals, and water networks with Dijkstra detour recalculation.',
      icon: Network,
      color: 'text-ts-accent',
      borderColor: 'border-ts-accent/30',
      action: () => setCurrentView('infrastructure')
    },
    {
      title: 'MCDA Land Suitability Scoring',
      badge: 'AHP MODEL',
      desc: 'Multi-criteria spatial evaluation combining slope gradients, soil bearing capacity, flood zones, and municipal road reach.',
      icon: Layers,
      color: 'text-ts-warning',
      borderColor: 'border-ts-warning/30',
      action: () => setCurrentView('land')
    },
    {
      title: 'Disaster Recovery Optimizer',
      badge: '₹ RUPEE SOLVER',
      desc: 'Deterministic knapsack solver allocating repair crews and budgets in Indian Rupees (₹) with priority Gantt scheduling.',
      icon: Wrench,
      color: 'text-ts-success',
      borderColor: 'border-ts-success/30',
      action: () => setCurrentView('recovery')
    }
  ];

  return (
    <div className="h-full w-full overflow-y-auto bg-ts-bg text-ts-text relative selection:bg-ts-primary selection:text-slate-950">
      {/* Background Holographic Grid & Glow Orbs */}
      <div className="absolute inset-0 holo-grid opacity-60 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-ts-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-ts-secondary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[600px] h-[500px] bg-ts-accent/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Floating Navigation */}
      <nav className="relative z-20 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ts-primary to-ts-secondary flex items-center justify-center shadow-lg shadow-ts-primary/30 ring-1 ring-ts-primary/40">
            <Shield className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-wider font-mono bg-gradient-to-r from-ts-primary via-ts-accent to-ts-text bg-clip-text text-transparent">
                TERRASHIELD
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-ts-primary/20 text-ts-primary border border-ts-primary/40">
                AI
              </span>
            </div>
            <div className="text-[10px] text-ts-muted font-mono tracking-tight flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-ts-success animate-pulse inline-block" />
              <span>India National Geospatial Mission</span>
            </div>
          </div>
        </div>

        {/* Theme Switcher in Landing Bar */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden sm:flex items-center space-x-1.5 bg-ts-card/80 border border-ts-card-border rounded-xl p-1 backdrop-blur-md">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  theme === t.id
                    ? 'bg-ts-primary/20 text-ts-primary border border-ts-primary/40 shadow-sm'
                    : 'text-ts-muted hover:text-ts-text hover:bg-ts-bg/50 border border-transparent'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentView('overview')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-ts-primary to-ts-secondary text-slate-950 text-xs font-mono font-extrabold flex items-center space-x-1.5 shadow-lg shadow-ts-primary/30 hover:scale-105 active:scale-95 transition-all"
          >
            <span>LAUNCH PLATFORM</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-16 text-center space-y-8">
        {/* National Mission Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-ts-card/80 border border-ts-primary/40 backdrop-blur-md text-xs font-mono text-ts-primary shadow-inner">
          <Globe2 className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
          <span>INDIAN SUBCONTINENT GEOSPATIAL INTELLIGENCE &amp; RESILIENCE</span>
          <span className="text-ts-muted">|</span>
          <span className="text-ts-accent font-bold">LIVE TELEMETRY</span>
        </div>

        {/* Main Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-ts-text leading-[1.15]">
            Understand the Land.{' '}
            <span className="bg-gradient-to-r from-ts-primary via-ts-accent to-ts-secondary bg-clip-text text-transparent">
              Anticipate the Risk.
            </span>{' '}
            Protect the Future.
          </h1>
          <p className="text-sm sm:text-base text-ts-muted max-w-2xl mx-auto font-sans leading-relaxed">
            TerraShield AI unifies multi-criteria land suitability screening, hydrodynamic flood simulation,
            cascading infrastructure dependency graphs, and resource-constrained recovery optimization into an
            explainable holographic decision platform for India.
          </p>
        </div>

        {/* Big Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setCurrentView('overview')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-ts-primary via-ts-accent to-ts-secondary text-slate-950 text-sm font-mono font-extrabold flex items-center justify-center space-x-2.5 shadow-2xl shadow-ts-primary/40 hover:scale-105 active:scale-98 transition-all group"
          >
            <span>ENTER DASHBOARD WORKSPACE</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => setCurrentView('digital-twin')}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-ts-card/90 hover:bg-ts-card border border-ts-card-border hover:border-ts-primary/60 text-ts-text text-sm font-mono font-bold flex items-center justify-center space-x-2 backdrop-blur-md transition-all group"
          >
            <Box className="w-4 h-4 text-ts-primary group-hover:rotate-12 transition-transform" />
            <span>LAUNCH 3D HOLOGRAPHIC TWIN</span>
          </button>

          <button
            onClick={() => setCurrentView('map')}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-ts-card/90 hover:bg-ts-card border border-ts-card-border hover:border-ts-accent/60 text-ts-text text-sm font-mono font-bold flex items-center justify-center space-x-2 backdrop-blur-md transition-all group"
          >
            <Map className="w-4 h-4 text-ts-accent group-hover:scale-110 transition-transform" />
            <span>EXPLORE INDIA 2D GIS MAP</span>
          </button>
        </div>

        {/* Live Key Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 max-w-4xl mx-auto">
          <div className="glass-panel rounded-xl p-4 text-left border-t-2 border-ts-primary/60">
            <div className="text-[10px] font-mono text-ts-muted">MONITORED BASINS</div>
            <div className="text-xl font-bold font-mono text-ts-primary mt-1">5 Key Regions</div>
            <div className="text-[10px] text-ts-muted mt-0.5">Mumbai · Odisha · Kerala · Gujarat</div>
          </div>

          <div className="glass-panel rounded-xl p-4 text-left border-t-2 border-ts-danger/60">
            <div className="text-[10px] font-mono text-ts-muted">MAX FLOOD HAZARD</div>
            <div className="text-xl font-bold font-mono text-ts-danger mt-1">Zone AE</div>
            <div className="text-[10px] text-ts-muted mt-0.5">100-Year Base Inundation</div>
          </div>

          <div className="glass-panel rounded-xl p-4 text-left border-t-2 border-ts-success/60">
            <div className="text-[10px] font-mono text-ts-muted">OPTIMIZED RECOVERY</div>
            <div className="text-xl font-bold font-mono text-ts-success mt-1">₹1.20 Crore</div>
            <div className="text-[10px] text-ts-muted mt-0.5">Indian Rupee Knapsack Cap</div>
          </div>

          <div className="glass-panel rounded-xl p-4 text-left border-t-2 border-ts-secondary/60">
            <div className="text-[10px] font-mono text-ts-muted">AI CLASSIFIER ROC</div>
            <div className="text-xl font-bold font-mono text-ts-secondary mt-1">0.998 AUC</div>
            <div className="text-[10px] text-ts-muted mt-0.5">Random Forest Sentinel-2</div>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ts-card-border pb-3">
          <div>
            <div className="text-xs font-mono font-bold text-ts-primary flex items-center space-x-1.5">
              <Activity className="w-4 h-4" />
              <span>CORE SYSTEM CAPABILITIES</span>
            </div>
            <h2 className="text-xl font-bold font-mono text-ts-text mt-0.5">
              Integrated Spatial Intelligence Architecture
            </h2>
          </div>
          <span className="text-xs font-mono text-ts-muted">Deterministic Calculations + Explainable AI</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                onClick={feat.action}
                className={`glass-panel rounded-2xl p-5 border ${feat.borderColor} hover:border-ts-primary/70 transition-all cursor-pointer group flex flex-col justify-between space-y-4 hover:shadow-xl hover:-translate-y-1`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-ts-bg flex items-center justify-center border border-ts-card-border group-hover:border-ts-primary/50 transition-colors">
                      <Icon className={`w-5 h-5 ${feat.color}`} />
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-ts-bg border border-ts-card-border text-ts-muted group-hover:text-ts-text">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold font-mono text-ts-text group-hover:text-ts-primary transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-ts-muted leading-relaxed font-sans">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-ts-card-border/50 flex items-center justify-between text-xs font-mono text-ts-muted group-hover:text-ts-primary transition-colors">
                  <span>Enter Module</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="glass-panel-glow rounded-3xl p-8 sm:p-12 space-y-6 relative overflow-hidden border border-ts-primary/30">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-ts-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-ts-text">
              Ready to Anticipate and Protect?
            </h2>
            <p className="text-xs sm:text-sm text-ts-muted font-sans">
              Access the live geospatial map, conduct multi-hazard analysis, model storm surges, and solve resource-constrained recovery plans for Indian land parcels.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setCurrentView('overview')}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-ts-primary to-ts-secondary text-slate-950 text-xs font-mono font-extrabold inline-flex items-center space-x-2 shadow-xl shadow-ts-primary/30 hover:scale-105 active:scale-95 transition-all"
              >
                <span>ENTER PLATFORM DASHBOARD</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-ts-card-border/60 py-6 text-center text-xs font-mono text-ts-muted">
        <div>TerraShield AI — Geospatial Intelligence &amp; Disaster Resilience Platform</div>
        <div className="text-[10px] text-ts-muted/60 mt-1">
          Indian Geographic Focus • Coordinate Bounds Constrained • Deterministic Solvers • Confidential Decision Support
        </div>
      </footer>
    </div>
  );
};
