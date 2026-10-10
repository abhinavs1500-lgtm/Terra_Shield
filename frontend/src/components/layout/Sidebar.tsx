import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationModule } from '../../types';
import {
  LayoutDashboard,
  Map,
  Box,
  Layers,
  Flame,
  Waves,
  Network,
  Camera,
  Wrench,
  Trees,
  Cpu,
  FileText,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Radio,
  Globe2
} from 'lucide-react';

type NavGroup = {
  label: string;
  items: { id: NavigationModule; label: string; icon: React.FC<{ className?: string }>; badge?: string }[];
};

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const navGroups: NavGroup[] = [
    {
      label: 'Workspace',
      items: [
        { id: 'landing', label: 'Welcome / Landing', icon: ShieldCheck, badge: 'HOME' },
        { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
        { id: 'map', label: 'Live Geospatial Map', icon: Map, badge: '2D' },
        { id: 'digital-twin', label: '3D Digital Twin', icon: Box, badge: 'HOLO' },
      ]
    },
    {
      label: 'Analysis',
      items: [
        { id: 'land', label: 'Land Intelligence', icon: Layers },
        { id: 'hazard', label: 'Hazard Intelligence', icon: Flame },
        { id: 'environmental', label: 'Environmental & SVI', icon: Trees },
        { id: 'research-lab', label: 'AI Research Lab', icon: Cpu },
      ]
    },
    {
      label: 'Incident Response',
      items: [
        { id: 'simulator', label: 'Disaster Simulator', icon: Waves, badge: 'SIM' },
        { id: 'infrastructure', label: 'Infrastructure Graph', icon: Network },
        { id: 'damage', label: 'Damage Assessment', icon: Camera },
        { id: 'recovery', label: 'Recovery Optimizer', icon: Wrench, badge: 'SOLVER' },
      ]
    },
    {
      label: 'System',
      items: [
        { id: 'reports', label: 'Reports & Dossiers', icon: FileText },
        { id: 'data-sources', label: 'Data Sources & Feeds', icon: Database, badge: 'LIVE' },
        { id: 'settings', label: 'System Settings', icon: Settings },
      ]
    }
  ];

  const allItems = navGroups.flatMap(g => g.items);

  return (
    <aside
      className={`h-[calc(100vh-4rem)] border-r border-ts-card-border bg-ts-sidebar backdrop-blur-xl flex flex-col justify-between transition-all duration-300 z-20 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Nav Groups */}
      <div className="flex-1 py-3 px-2 overflow-y-auto overflow-x-hidden space-y-0.5">
        {collapsed ? (
          // Collapsed mode: flat icon list, no groups
          allItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                title={item.label}
                className={`w-full flex items-center justify-center rounded-xl px-0 py-2.5 transition-all group relative ${
                  isActive
                    ? 'bg-ts-primary/15 border border-ts-primary/40 text-ts-primary shadow-sm shadow-ts-primary/20'
                    : 'text-ts-muted hover:text-ts-primary hover:bg-ts-bg/80 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-ts-primary' : ''}`} />
                {/* Tooltip */}
                <div className="absolute left-16 ml-2 px-2.5 py-1.5 bg-ts-card border border-ts-card-border rounded-lg text-xs font-mono text-ts-text whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-ts-primary/20 text-ts-primary border border-ts-primary/40">
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        ) : (
          // Expanded mode: grouped with section headers
          navGroups.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? 'mt-2' : ''}>
              {/* Group separator label */}
              <div className="px-3 pt-3 pb-1">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-ts-muted/60 letter-spacing-wider">
                  {group.label}
                </span>
              </div>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className={`w-full flex items-center rounded-xl px-3 py-2.5 text-xs font-medium transition-all group relative ${
                        isActive
                          ? 'bg-ts-primary/15 border border-ts-primary/40 text-ts-primary shadow-sm shadow-ts-primary/20 font-bold'
                          : 'text-ts-muted hover:text-ts-text hover:bg-ts-bg/80 border border-transparent'
                      }`}
                    >
                      {/* Active left border accent */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-ts-primary" />
                      )}
                      <Icon className={`w-4 h-4 shrink-0 transition-all ${isActive ? 'text-ts-primary scale-110' : 'group-hover:text-ts-primary'}`} />
                      <span className="ml-3 truncate font-sans text-[12px]">{item.label}</span>
                      {item.badge && (
                        <span className={`ml-auto text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                          isActive
                            ? 'bg-ts-primary/20 text-ts-primary border-ts-primary/40'
                            : 'bg-ts-bg text-ts-muted border-ts-card-border'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Status & Collapse */}
      <div className="p-3 border-t border-ts-card-border bg-ts-bg/40 space-y-2">
        {!collapsed && (
          <div className="p-2 rounded-lg bg-ts-card/60 border border-ts-card-border text-[10px] space-y-1.5">
            <div className="flex items-center justify-between font-mono">
              <span className="text-ts-muted">ENGINE STATUS</span>
              <span className="text-ts-success font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-ts-success inline-block animate-pulse"></span>
                <span>ONLINE</span>
              </span>
            </div>
            <div className="text-ts-muted/70 truncate text-[9px]">MCDA · NetworkX · Knapsack · sklearn</div>
            <div className="flex items-center space-x-1 text-ts-primary/60 text-[9px] font-mono">
              <Globe2 className="w-3 h-3" />
              <span>Open-Meteo · USGS Feeds Active</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full py-1.5 rounded-lg bg-ts-bg hover:bg-ts-card border border-ts-card-border flex items-center justify-center text-ts-muted hover:text-ts-primary text-xs transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : (
            <span className="flex items-center space-x-1.5">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[10px] font-mono">COLLAPSE</span>
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};
