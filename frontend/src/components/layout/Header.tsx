import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ThemeName, UserRole } from '../../types';
import { api } from '../../services/api';
import { 
  Shield, 
  Sparkles, 
  Palette, 
  UserCheck, 
  Activity, 
  Search, 
  AlertCircle, 
  ChevronDown,
  CloudRain,
  Radio
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    theme, 
    setTheme, 
    userRole, 
    setUserRole, 
    isCopilotOpen, 
    setIsCopilotOpen, 
    parcels, 
    setSelectedParcelId,
    setCurrentView
  } = useApp();

  const [weather, setWeather] = useState<any>(null);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    api.getLiveWeather().then(setWeather).catch(() => {});
  }, []);

  const themes: { id: ThemeName; label: string; desc: string; iconColor: string }[] = [
    { id: 'holocore', label: 'HOLOCORE', desc: 'Default Cyan/Violet Holographic Digital Twin', iconColor: 'bg-cyan-400' },
    { id: 'orbital-command', label: 'ORBITAL COMMAND', desc: 'Dark Navy Operations & Amber Telemetry', iconColor: 'bg-amber-400' },
    { id: 'satellite-intel', label: 'SATELLITE INTEL', desc: 'Topographic GIS & Earth Hazard Legends', iconColor: 'bg-emerald-400' },
    { id: 'neo-cyber', label: 'NEO CYBER', desc: 'Charcoal Cyberpunk & Neon Green/Pink', iconColor: 'bg-green-400' },
    { id: 'clarity-analytics', label: 'CLARITY ANALYTICS', desc: 'Crisp High-Legibility Light Interface', iconColor: 'bg-sky-500' }
  ];

  const roles: UserRole[] = [
    'Urban Planner',
    'Emergency Director',
    'Citizen',
    'Environmental Researcher',
    'System Admin'
  ];

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    const filtered = parcels.filter(p => 
      p.name.toLowerCase().includes(q.toLowerCase()) || 
      p.id.toLowerCase().includes(q.toLowerCase()) ||
      p.zone_type.toLowerCase().includes(q.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const selectSearchResult = (p: any) => {
    setSelectedParcelId(p.id);
    setCurrentView('land');
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <header className="h-16 border-b border-ts-card-border bg-ts-header backdrop-blur-md px-4 flex items-center justify-between z-30 select-none relative">
      {/* Left: Brand & Region */}
      <div className="flex items-center space-x-3">
        <div 
          onClick={() => setCurrentView('landing')}
          className="flex items-center space-x-2.5 cursor-pointer group"
          title="Return to Welcome / Landing Page"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ts-primary to-ts-secondary flex items-center justify-center shadow-lg shadow-ts-primary/20 group-hover:scale-105 transition-transform">
            <Shield className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold tracking-wider text-base bg-gradient-to-r from-ts-primary via-ts-accent to-ts-text bg-clip-text text-transparent font-mono">
                TERRASHIELD
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded font-mono font-bold bg-ts-primary/20 text-ts-primary border border-ts-primary/30">
                AI
              </span>
            </div>
            <div className="text-[10px] text-ts-muted tracking-tight flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-ts-success animate-pulse inline-block"></span>
              <span>India Geospatial Mission • Coastal & Delta Basin</span>
            </div>
          </div>
        </div>

        {/* Global Quick Location Search */}
        <div className="relative hidden md:block w-72 ml-4">
          <div className="flex items-center bg-ts-bg/80 border border-ts-card-border rounded-lg px-2.5 py-1.5 text-xs text-ts-text focus-within:border-ts-primary transition-colors">
            <Search className="w-3.5 h-3.5 text-ts-muted mr-2" />
            <input 
              type="text"
              placeholder="Search parcel, coords, or zone..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-transparent outline-none w-full placeholder:text-ts-muted/60"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-10 bg-ts-card border border-ts-card-border rounded-lg shadow-2xl p-1 z-50">
              {searchResults.map(p => (
                <div 
                  key={p.id}
                  onClick={() => selectSearchResult(p)}
                  className="p-2 hover:bg-ts-primary/10 rounded cursor-pointer text-xs flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="font-semibold text-ts-text">{p.name}</div>
                    <div className="text-[10px] text-ts-muted">{p.id} • {p.zone_type}</div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ts-bg border border-ts-card-border">
                    Zone {p.flood_zone}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Live Telemetry Status Pill */}
      <div className="hidden lg:flex items-center space-x-3 text-xs bg-ts-bg/60 border border-ts-card-border rounded-full px-4 py-1.5 shadow-inner">
        <div className="flex items-center space-x-1.5 text-ts-muted">
          <Radio className="w-3.5 h-3.5 text-ts-primary animate-pulse" />
          <span className="font-mono text-[11px] text-ts-text font-medium">OPEN-METEO FEED:</span>
        </div>
        {weather ? (
          <div className="flex items-center space-x-3 text-[11px] font-mono">
            <span className="text-ts-primary font-bold">{weather.temperature_c}°C</span>
            <span className="text-ts-muted">|</span>
            <span className="text-ts-accent">{weather.wind_speed_kmh} km/h wind</span>
            <span className="text-ts-muted">|</span>
            <span className="text-ts-warning">{weather.humidity_pct}% RH</span>
          </div>
        ) : (
          <span className="text-[11px] text-ts-muted animate-pulse">Synchronizing atmospheric feeds...</span>
        )}
      </div>

      {/* Right: Theme Switcher, Role Selector & Copilot Toggle */}
      <div className="flex items-center space-x-2.5">
        {/* Theme Selector Button */}
        <div className="relative">
          <button
            onClick={() => { setShowThemeMenu(!showThemeMenu); setShowRoleMenu(false); }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-ts-card border border-ts-card-border hover:border-ts-primary text-xs text-ts-text font-medium transition-all shadow-sm"
            title="Switch Visual Theme"
          >
            <Palette className="w-3.5 h-3.5 text-ts-primary" />
            <span className="hidden sm:inline uppercase text-[11px] font-mono font-semibold">{theme.replace('-', ' ')}</span>
            <ChevronDown className="w-3 h-3 text-ts-muted" />
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 top-11 w-72 bg-ts-card border border-ts-card-border rounded-xl shadow-2xl p-2 z-50 backdrop-blur-xl">
              <div className="text-[10px] font-mono uppercase text-ts-muted px-2 py-1 tracking-wider border-b border-ts-card-border mb-1">
                Visual Intelligence Themes
              </div>
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setShowThemeMenu(false); }}
                  className={`w-full text-left p-2 rounded-lg text-xs flex items-start space-x-2.5 transition-all ${
                    theme === t.id 
                      ? 'bg-ts-primary/15 border border-ts-primary/40 text-ts-text font-semibold' 
                      : 'hover:bg-ts-bg text-ts-muted hover:text-ts-text'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full mt-0.5 ${t.iconColor} shadow-sm shrink-0`}></div>
                  <div>
                    <div className="text-xs font-mono">{t.label}</div>
                    <div className="text-[10px] opacity-80 leading-tight font-sans font-normal mt-0.5">{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Role Switcher */}
        <div className="relative">
          <button
            onClick={() => { setShowRoleMenu(!showRoleMenu); setShowThemeMenu(false); }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-ts-card border border-ts-card-border hover:border-ts-accent text-xs text-ts-text font-medium transition-all"
            title="Switch Active Operational Role"
          >
            <UserCheck className="w-3.5 h-3.5 text-ts-accent" />
            <span className="hidden md:inline text-[11px] font-mono">{userRole}</span>
            <ChevronDown className="w-3 h-3 text-ts-muted" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 top-11 w-56 bg-ts-card border border-ts-card-border rounded-xl shadow-2xl p-1.5 z-50 backdrop-blur-xl">
              <div className="text-[10px] font-mono uppercase text-ts-muted px-2 py-1 tracking-wider border-b border-ts-card-border mb-1">
                Operational Workspace Roles
              </div>
              {roles.map(r => (
                <button
                  key={r}
                  onClick={() => { setUserRole(r); setShowRoleMenu(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                    userRole === r ? 'bg-ts-accent/20 text-ts-accent font-bold' : 'hover:bg-ts-bg text-ts-muted hover:text-ts-text'
                  }`}
                >
                  <span>{r}</span>
                  {userRole === r && <span className="w-1.5 h-1.5 rounded-full bg-ts-accent"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI Assistant Copilot Toggle */}
        <button
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-md ${
            isCopilotOpen 
              ? 'bg-gradient-to-r from-ts-primary to-ts-secondary text-slate-950 shadow-ts-primary/30 ring-2 ring-ts-primary/50' 
              : 'bg-ts-primary/10 border border-ts-primary/40 text-ts-primary hover:bg-ts-primary/20'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">AI COPILOT</span>
        </button>
      </div>
    </header>
  );
};
