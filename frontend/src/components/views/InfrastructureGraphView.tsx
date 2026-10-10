import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { InfrastructureGraphData, DisruptionSimulationResponse, InfraNode } from '../../types';
import {
  Network,
  Activity,
  AlertOctagon,
  ShieldAlert,
  Sparkles,
  Navigation,
  CheckCircle2,
  Zap,
  Droplets,
  Building2,
  Bridge,
  Radio
} from 'lucide-react';

// Hand-tuned node positions to create a logical infrastructure layout
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  'ELEC-01': { x: 120, y: 100 },
  'ELEC-02': { x: 300, y: 80 },
  'WATER-01': { x: 500, y: 100 },
  'WATER-02': { x: 680, y: 80 },
  'HOSP-01': { x: 200, y: 250 },
  'HOSP-02': { x: 600, y: 250 },
  'BRG-01':  { x: 380, y: 200 },
  'BRG-02':  { x: 500, y: 310 },
  'COMM-01': { x: 150, y: 370 },
  'EVAC-01': { x: 680, y: 370 },
};

const NODE_ICON_COLORS: Record<string, string> = {
  power_grid: '#00f0ff',
  water_treatment: '#38bdf8',
  hospital: '#10b981',
  bridge: '#fbbf24',
  comm_tower: '#a855f7',
  evacuation_center: '#f97316',
};

const NODE_BG_COLORS: Record<string, string> = {
  power_grid: 'rgba(0,240,255,0.1)',
  water_treatment: 'rgba(56,189,248,0.1)',
  hospital: 'rgba(16,185,129,0.1)',
  bridge: 'rgba(251,191,36,0.1)',
  comm_tower: 'rgba(168,85,247,0.1)',
  evacuation_center: 'rgba(249,115,22,0.1)',
};

const TYPE_ICONS: Record<string, string> = {
  power_grid: '⚡',
  water_treatment: '💧',
  hospital: '🏥',
  bridge: '🌉',
  comm_tower: '📡',
  evacuation_center: '🚨',
};

// Edges as pairs of node IDs
const EDGES: [string, string][] = [
  ['ELEC-01', 'ELEC-02'],
  ['ELEC-01', 'HOSP-01'],
  ['ELEC-01', 'BRG-01'],
  ['ELEC-02', 'WATER-01'],
  ['ELEC-02', 'WATER-02'],
  ['WATER-01', 'HOSP-01'],
  ['WATER-01', 'BRG-01'],
  ['WATER-01', 'HOSP-02'],
  ['WATER-02', 'HOSP-02'],
  ['HOSP-01', 'COMM-01'],
  ['BRG-01', 'BRG-02'],
  ['BRG-01', 'HOSP-02'],
  ['BRG-02', 'EVAC-01'],
  ['COMM-01', 'EVAC-01'],
  ['HOSP-02', 'EVAC-01'],
];

export const InfrastructureGraphView: React.FC = () => {
  const { sendCopilotQuery, setCurrentView } = useApp();

  const [graphData, setGraphData] = useState<InfrastructureGraphData | null>(null);
  const [disabledNodes, setDisabledNodes] = useState<string[]>(['ELEC-01', 'BRG-01']);
  const [disruption, setDisruption] = useState<DisruptionSimulationResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<InfraNode | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    api.getInfraGraph().then(data => {
      setGraphData(data);
      if (data.nodes.length > 0) setSelectedNode(data.nodes[0]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    runDisruptionAnalysis(disabledNodes);
  }, [disabledNodes]);

  const runDisruptionAnalysis = async (offlineNodeIds: string[]) => {
    setLoading(true);
    try {
      const res = await api.simulateInfraDisruption(offlineNodeIds);
      setDisruption(res);
    } catch (e) {
      console.warn('Disruption simulation failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleNodeFailure = (nodeId: string) => {
    setDisabledNodes(prev =>
      prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
    );
  };

  const getNodeStatus = (nodeId: string) => {
    if (disabledNodes.includes(nodeId)) return 'offline_primary';
    if (disruption?.cascading_failures.some(c => c.node_id === nodeId)) return 'offline_cascaded';
    return 'operational';
  };

  const getEdgeStatus = (a: string, b: string) => {
    const sa = getNodeStatus(a);
    const sb = getNodeStatus(b);
    if (sa === 'offline_primary' || sb === 'offline_primary') return 'severed_primary';
    if (sa === 'offline_cascaded' || sb === 'offline_cascaded') return 'severed_cascaded';
    return 'active';
  };

  // SVG viewport
  const SVG_W = 820;
  const SVG_H = 460;
  const NODE_R = 30;

  const nodeForId = (id: string) => graphData?.nodes.find(n => n.id === id);

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-5 text-ts-text select-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-panel rounded-2xl p-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-ts-accent font-semibold mb-1">
            <Network className="w-3.5 h-3.5" />
            <span>NETWORKX TOPOLOGY GRAPH • CASCADE PROPAGATION ENGINE</span>
          </div>
          <h1 className="text-xl font-extrabold font-mono text-ts-text">
            Infrastructure Dependency Intelligence &amp; Detour Routing
          </h1>
          <p className="text-xs text-ts-muted">
            Click any node to toggle failure. NetworkX propagates cascades across power, water, hospital, and bridge dependencies.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDisabledNodes([])}
            className="px-3 py-1.5 rounded-xl bg-ts-bg hover:bg-ts-card border border-ts-card-border text-xs font-mono text-ts-muted hover:text-ts-text transition-colors"
          >
            Reset All Nodes
          </button>
          <button
            onClick={() => sendCopilotQuery("Analyze infrastructure cascading failure and bottleneck vulnerabilities")}
            className="px-3.5 py-1.5 rounded-xl bg-ts-primary/15 hover:bg-ts-primary/25 border border-ts-primary/40 text-ts-primary text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI CASCADE BRIEF</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-panel-glow rounded-xl p-3.5 border-l-4 border-l-ts-danger">
          <div className="text-[10px] font-mono text-ts-muted">TOTAL OFFLINE NODES</div>
          <div className="text-2xl font-extrabold font-mono text-ts-danger mt-1">
            {disruption?.total_offline_nodes || 0} / {graphData?.total_nodes || 10}
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">
            {disabledNodes.length} Primary + {(disruption?.cascading_failures.length || 0)} Cascaded
          </div>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">POPULATION LOST POWER</div>
          <div className="text-2xl font-extrabold font-mono text-ts-warning mt-1">
            {(disruption?.total_population_lost_power || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">Grid Blackout Radius</div>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">POPULATION LOST WATER</div>
          <div className="text-2xl font-extrabold font-mono text-ts-info mt-1">
            {(disruption?.total_population_lost_water || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">Pumping Depressurization</div>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">CRITICAL BOTTLENECKS</div>
          <div className="text-2xl font-extrabold font-mono text-ts-primary mt-1">
            {graphData?.critical_path_bottlenecks.length || 2} Points
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">High Betweenness Centrality</div>
        </div>
      </div>

      {/* MAIN: SVG Network Graph + Node Details Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* SVG Network Diagram */}
        <div className="xl:col-span-2 glass-panel rounded-2xl p-4">
          <div className="flex items-center justify-between border-b border-ts-card-border pb-2 mb-3">
            <div className="font-mono text-xs font-bold text-ts-text flex items-center space-x-2">
              <Activity className="w-4 h-4 text-ts-primary" />
              <span>INTERACTIVE DEPENDENCY TOPOLOGY (CLICK NODE = TOGGLE FAILURE)</span>
            </div>
            <div className="flex items-center space-x-3 text-[10px] font-mono">
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-ts-success inline-block"></span><span className="text-ts-muted">Operational</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-ts-danger inline-block"></span><span className="text-ts-muted">Failed</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-ts-warning inline-block"></span><span className="text-ts-muted">Cascaded</span></span>
            </div>
          </div>

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-ts-bg/40 rounded-2xl pointer-events-none">
              <span className="text-xs font-mono text-ts-primary animate-pulse">RUNNING CASCADE SIMULATION…</span>
            </div>
          )}

          <div className="w-full overflow-x-auto">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="w-full"
              style={{ minHeight: 300 }}
            >
              {/* Background grid */}
              <defs>
                <pattern id="infra-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--ts-card-border)" strokeWidth="0.3" />
                </pattern>
                <filter id="glow-cyan">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-red">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <marker id="arrow-active" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="rgba(0,240,255,0.6)" />
                </marker>
                <marker id="arrow-severed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="rgba(244,63,94,0.6)" />
                </marker>
              </defs>
              <rect width={SVG_W} height={SVG_H} fill="url(#infra-grid)" />

              {/* Edges */}
              {EDGES.map(([a, b], i) => {
                const pa = NODE_POSITIONS[a];
                const pb = NODE_POSITIONS[b];
                if (!pa || !pb) return null;
                const status = getEdgeStatus(a, b);
                const color =
                  status === 'active' ? 'rgba(0,240,255,0.5)' :
                  status === 'severed_primary' ? 'rgba(244,63,94,0.7)' :
                  'rgba(251,191,36,0.6)';
                const dashArray = status === 'active' ? '0' : '6 4';
                const strokeW = status === 'active' ? 1.5 : 2;
                const marker = status === 'active' ? 'url(#arrow-active)' : 'url(#arrow-severed)';
                return (
                  <line
                    key={i}
                    x1={pa.x} y1={pa.y}
                    x2={pb.x} y2={pb.y}
                    stroke={color}
                    strokeWidth={strokeW}
                    strokeDasharray={dashArray}
                    markerEnd={marker}
                    opacity={0.8}
                  />
                );
              })}

              {/* Nodes */}
              {graphData?.nodes.map(node => {
                const pos = NODE_POSITIONS[node.id];
                if (!pos) return null;
                const status = getNodeStatus(node.id);
                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNode === node.id;
                const nodeColor = status === 'operational'
                  ? (NODE_ICON_COLORS[node.type] || '#00f0ff')
                  : status === 'offline_primary' ? '#f43f5e' : '#fbbf24';
                const ringColor = isSelected
                  ? 'var(--ts-primary)' : (status === 'operational' ? nodeColor : nodeColor);
                const bgOpacity = isHovered || isSelected ? 0.25 : 0.1;
                const r = isSelected ? NODE_R + 4 : NODE_R;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x},${pos.y})`}
                    className="cursor-pointer"
                    onClick={() => { setSelectedNode(node); toggleNodeFailure(node.id); }}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Glow ring for selected/offline */}
                    {(isSelected || status !== 'operational') && (
                      <circle r={r + 8} fill="none" stroke={nodeColor} strokeWidth="1.5" opacity={0.3} />
                    )}
                    {/* Pulsing ring for operational */}
                    {status === 'operational' && (
                      <circle r={r + 5} fill="none" stroke={nodeColor} strokeWidth="0.8" opacity={0.2}>
                        <animate attributeName="r" values={`${r+3};${r+10};${r+3}`} dur="2.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.2;0;0.2" dur="2.5s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {/* Node background */}
                    <circle r={r} fill={nodeColor} fillOpacity={bgOpacity} stroke={nodeColor} strokeWidth={isSelected ? 2.5 : 1.5} />
                    {/* Icon text */}
                    <text textAnchor="middle" dominantBaseline="central" fontSize="18" className="select-none" style={{ userSelect: 'none' }}>
                      {TYPE_ICONS[node.type] || '⬡'}
                    </text>
                    {/* Node label */}
                    <text
                      y={r + 14}
                      textAnchor="middle"
                      fontSize="9"
                      fontFamily="monospace"
                      fill={nodeColor}
                      fontWeight="bold"
                      className="select-none"
                    >
                      {node.id}
                    </text>
                    <text
                      y={r + 24}
                      textAnchor="middle"
                      fontSize="8"
                      fontFamily="sans-serif"
                      fill="var(--ts-muted)"
                      className="select-none"
                    >
                      {node.name.split(' ').slice(0, 2).join(' ')}
                    </text>
                    {/* Status badge */}
                    {status !== 'operational' && (
                      <g>
                        <circle cx={r - 4} cy={-(r - 4)} r={8} fill={status === 'offline_primary' ? '#f43f5e' : '#fbbf24'} />
                        <text x={r - 4} y={-(r - 4)} textAnchor="middle" dominantBaseline="central" fontSize="9" fill="white" fontWeight="bold" className="select-none">
                          {status === 'offline_primary' ? '✕' : '!'}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Node Details Panel */}
        <div className="glass-panel rounded-2xl p-4 space-y-4">
          <div className="font-mono text-xs font-bold text-ts-text border-b border-ts-card-border pb-2">
            NODE INTEL: {selectedNode ? selectedNode.id : '—'}
          </div>

          {selectedNode ? (
            <>
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: NODE_BG_COLORS[selectedNode.type] || 'rgba(0,240,255,0.1)', border: `1px solid ${NODE_ICON_COLORS[selectedNode.type] || '#00f0ff'}40` }}
                >
                  {TYPE_ICONS[selectedNode.type] || '⬡'}
                </div>
                <div>
                  <div className="font-bold text-sm text-ts-text leading-tight">{selectedNode.name}</div>
                  <div className="text-[10px] font-mono text-ts-muted uppercase">{selectedNode.type.replace('_', ' ')}</div>
                  <div className={`text-[10px] font-mono font-bold mt-0.5 ${getNodeStatus(selectedNode.id) === 'operational' ? 'text-ts-success' : 'text-ts-danger'}`}>
                    ● {getNodeStatus(selectedNode.id) === 'operational' ? 'OPERATIONAL' : getNodeStatus(selectedNode.id) === 'offline_primary' ? 'DIRECTLY FAILED' : 'CASCADE OFFLINE'}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-ts-card-border/40">
                  <span className="text-ts-muted font-mono">Population Served</span>
                  <span className="font-bold text-ts-text">{selectedNode.population_served.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-ts-card-border/40">
                  <span className="text-ts-muted font-mono">Criticality Tier</span>
                  <span className="font-bold text-ts-accent">Tier {selectedNode.criticality_tier} ({selectedNode.criticality_tier === 1 ? 'Life-Critical' : 'Standard'})</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-ts-card-border/40">
                  <span className="text-ts-muted font-mono">Backup Power</span>
                  <span className="font-bold text-ts-primary">{selectedNode.backup_power_hrs} hrs Generator</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-ts-card-border/40">
                  <span className="text-ts-muted font-mono">Flood Threshold</span>
                  <span className="font-bold text-ts-warning">{selectedNode.flood_threshold_m}m Water Depth</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-ts-card-border/40">
                  <span className="text-ts-muted font-mono">Dependencies</span>
                  <span className="font-bold text-ts-text">
                    {selectedNode.dependencies && selectedNode.dependencies.length > 0
                      ? selectedNode.dependencies.join(', ')
                      : 'Independent Grid Node'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleNodeFailure(selectedNode.id)}
                className={`w-full py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  disabledNodes.includes(selectedNode.id)
                    ? 'bg-ts-success/15 border border-ts-success/40 text-ts-success hover:bg-ts-success/25'
                    : 'bg-ts-danger/15 border border-ts-danger/40 text-ts-danger hover:bg-ts-danger/25'
                }`}
              >
                {disabledNodes.includes(selectedNode.id) ? '✓ RESTORE NODE' : '✕ SIMULATE FAILURE'}
              </button>
            </>
          ) : (
            <div className="text-xs text-ts-muted font-mono text-center py-8">Click a node in the graph to inspect its dependency intel</div>
          )}

          {/* All nodes quick status */}
          <div className="space-y-1 pt-2 border-t border-ts-card-border">
            <div className="text-[10px] font-mono text-ts-muted mb-2">ALL NODE STATUS</div>
            {graphData?.nodes.map(n => {
              const st = getNodeStatus(n.id);
              return (
                <div
                  key={n.id}
                  onClick={() => { setSelectedNode(n); toggleNodeFailure(n.id); }}
                  className={`flex items-center justify-between px-2 py-1 rounded-lg cursor-pointer transition-colors text-xs ${
                    selectedNode?.id === n.id ? 'bg-ts-primary/15' : 'hover:bg-ts-card/60'
                  }`}
                >
                  <span className="font-mono text-[10px] text-ts-muted">{n.id}</span>
                  <span className="font-medium text-ts-text text-[10px] truncate max-w-[80px]">{n.name.split(' ')[0]}</span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    st === 'operational' ? 'bg-ts-success' : st === 'offline_primary' ? 'bg-ts-danger' : 'bg-ts-warning'
                  }`}></span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cascading Failures + Detours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-panel rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-ts-card-border pb-1.5">
            <div className="font-mono text-xs font-bold text-ts-warning flex items-center space-x-1.5">
              <AlertOctagon className="w-4 h-4" />
              <span>CASCADING FAILURE TRACE SEQUENCE</span>
            </div>
            <span className="text-[10px] font-mono text-ts-muted">{disruption?.cascading_failures.length || 0} Cascades</span>
          </div>

          <div className="space-y-2">
            {disruption?.cascading_failures.length === 0 ? (
              <div className="p-4 text-center text-xs text-ts-muted font-mono bg-ts-bg/40 rounded-xl">
                No cascading failures active. Click an upstream power or water node to trigger a cascade test.
              </div>
            ) : (
              disruption?.cascading_failures.map((cf, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-ts-bg/60 border border-ts-warning/30 text-xs space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-ts-warning/20 text-ts-warning border border-ts-warning/30 mr-2">STEP {cf.step}</span>
                      <span className="font-bold text-ts-text">{cf.node_name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-ts-danger font-bold shrink-0">-{cf.impact_population.toLocaleString()}</span>
                  </div>
                  <div className="text-[11px] text-ts-warning font-mono">{cf.trigger}</div>
                  <div className="text-[10px] text-ts-muted pt-0.5">
                    <b className="text-ts-text">Contingency:</b> {cf.mitigation}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-ts-card-border pb-1.5">
            <div className="font-mono text-xs font-bold text-ts-primary flex items-center space-x-1.5">
              <Navigation className="w-4 h-4" />
              <span>EMERGENCY DETOUR ROUTES (DIJKSTRA)</span>
            </div>
            <span className="text-[10px] font-mono text-ts-muted">Shortest Alternative Paths</span>
          </div>

          <div className="space-y-2.5">
            {(disruption?.alternative_detours || []).map((detour, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-ts-bg/60 border border-ts-primary/30 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-ts-text">
                  <span>{detour.origin} → {detour.destination}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ts-warning/15 text-ts-warning border border-ts-warning/30">
                    +{detour.delay_minutes} min
                  </span>
                </div>
                <div className="text-[11px] text-ts-muted">
                  <span className="line-through opacity-70">Normal: {detour.normal_route}</span>
                </div>
                <div className="text-[11px] text-ts-primary font-medium flex items-center space-x-1">
                  <Navigation className="w-3 h-3" />
                  <span>Detour: {detour.detour_route}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentView('recovery')}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-ts-primary to-ts-secondary text-slate-950 text-xs font-mono font-bold hover:opacity-90 transition-opacity shadow-md"
          >
            → PROCEED TO RECOVERY OPTIMIZATION PLAN
          </button>
        </div>
      </div>
    </div>
  );
};
