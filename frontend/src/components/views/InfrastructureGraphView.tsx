import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { InfrastructureGraphData, DisruptionSimulationResponse, InfraNode } from '../../types';
import { FALLBACK_INFRASTRUCTURE_GRAPH, FALLBACK_DISRUPTION } from '../../services/fallbackData';
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

// Hand-tuned node positions to create a clean, aesthetic infrastructure diagram
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  'ELEC-01': { x: 120, y: 100 },
  'ELEC-02': { x: 300, y: 80 },
  'WAT-01': { x: 500, y: 100 },
  'WATER-01': { x: 500, y: 100 },
  'WAT-02': { x: 680, y: 80 },
  'WATER-02': { x: 680, y: 80 },
  'HOSP-01': { x: 200, y: 250 },
  'HOSP-02': { x: 600, y: 250 },
  'BRG-01':  { x: 380, y: 200 },
  'BRG-02':  { x: 500, y: 310 },
  'TEL-01':  { x: 150, y: 370 },
  'COMM-01': { x: 150, y: 370 },
  'SHLT-01': { x: 680, y: 370 },
  'EVAC-01': { x: 680, y: 370 },
};

const NODE_ICON_COLORS: Record<string, string> = {
  power_substation: '#00f0ff',
  power_grid: '#00f0ff',
  water_treatment: '#38bdf8',
  hospital: '#10b981',
  bridge: '#fbbf24',
  telecom_tower: '#a855f7',
  comm_tower: '#a855f7',
  emergency_shelter: '#f97316',
  evacuation_center: '#f97316',
};

const NODE_BG_COLORS: Record<string, string> = {
  power_substation: 'rgba(0,240,255,0.1)',
  power_grid: 'rgba(0,240,255,0.1)',
  water_treatment: 'rgba(56,189,248,0.1)',
  hospital: 'rgba(16,185,129,0.1)',
  bridge: 'rgba(251,191,36,0.1)',
  telecom_tower: 'rgba(168,85,247,0.1)',
  comm_tower: 'rgba(168,85,247,0.1)',
  emergency_shelter: 'rgba(249,115,22,0.1)',
  evacuation_center: 'rgba(249,115,22,0.1)',
};

const TYPE_ICONS: Record<string, string> = {
  power_substation: '⚡',
  power_grid: '⚡',
  water_treatment: '💧',
  hospital: '🏥',
  bridge: '🌉',
  telecom_tower: '📡',
  comm_tower: '📡',
  emergency_shelter: '🚨',
  evacuation_center: '🚨',
};

const SVG_W = 800;
const SVG_H = 460;
const NODE_R = 24;

export const InfrastructureGraphView: React.FC = () => {
  const { sendCopilotQuery, setCurrentView, isBackendConnected } = useApp();

  const [graphData, setGraphData] = useState<InfrastructureGraphData>(FALLBACK_INFRASTRUCTURE_GRAPH);
  const [disabledNodes, setDisabledNodes] = useState<string[]>(['ELEC-01', 'BRG-01']);
  const [disruption, setDisruption] = useState<DisruptionSimulationResponse>(FALLBACK_DISRUPTION);
  const [selectedNode, setSelectedNode] = useState<InfraNode | null>(FALLBACK_INFRASTRUCTURE_GRAPH.nodes[0]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    api.getInfraGraph().then(data => {
      const safeData = data || FALLBACK_INFRASTRUCTURE_GRAPH;
      setGraphData(safeData);
      if (safeData.nodes.length > 0) setSelectedNode(safeData.nodes[0]);
    }).catch(() => {
      setGraphData(FALLBACK_INFRASTRUCTURE_GRAPH);
    });
  }, []);

  useEffect(() => {
    runDisruptionAnalysis(disabledNodes);
  }, [disabledNodes]);

  const runDisruptionAnalysis = async (offlineNodeIds: string[]) => {
    setLoading(true);
    try {
      const res = await api.simulateInfraDisruption(offlineNodeIds);
      setDisruption(res || FALLBACK_DISRUPTION);
    } catch (e) {
      console.warn('Disruption simulation fallback:', e);
      setDisruption(FALLBACK_DISRUPTION);
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

  const activeNodes = graphData?.nodes || FALLBACK_INFRASTRUCTURE_GRAPH.nodes;
  const activeEdges = (graphData?.edges && graphData.edges.length > 0)
    ? graphData.edges.map(e => [e.source, e.target] as [string, string])
    : FALLBACK_INFRASTRUCTURE_GRAPH.edges.map(e => [e.source, e.target] as [string, string]);

  const offlineDirectCount = disabledNodes.length;
  const cascadedCount = disruption?.cascading_failures?.length || 0;
  const totalOffline = offlineDirectCount + cascadedCount;
  const healthPct = Math.max(0, Math.round(((activeNodes.length - totalOffline) / activeNodes.length) * 100));

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-ts-text select-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-panel rounded-2xl p-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-ts-accent font-semibold mb-1">
            <Network className="w-3.5 h-3.5" />
            <span>INTERDEPENDENT INFRASTRUCTURE TOPOLOGY & CASCADE ENGINE</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-ts-primary/10 text-ts-primary border border-ts-primary/30">
              {isBackendConnected ? '● REAL-TIME NETWORKX GRAPH' : '● CALIBRATED TOPOLOGICAL GRAPH'}
            </span>
          </div>
          <h1 className="text-xl font-extrabold font-mono text-ts-text">
            Critical Infrastructure Interdependency & Disruption Graph
          </h1>
          <p className="text-xs text-ts-muted">
            Models cross-sector ripple effects across electrical distribution, water pumping, emergency healthcare, and arterial bridges.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDisabledNodes(['ELEC-01', 'BRG-01'])}
            className="px-3 py-2 rounded-xl bg-ts-bg border border-ts-card-border hover:border-ts-primary text-xs font-mono text-ts-muted hover:text-ts-text transition-colors"
          >
            Reset Defaults
          </button>
          <button
            onClick={() => setDisabledNodes([])}
            className="px-3 py-2 rounded-xl bg-ts-success/15 border border-ts-success/40 text-ts-success text-xs font-mono font-bold hover:bg-ts-success/25 transition-colors"
          >
            Restore All
          </button>
          <button
            onClick={() => sendCopilotQuery(`Explain the cascading infrastructure disruption caused by disabling nodes ${disabledNodes.join(', ')}`)}
            className="px-3.5 py-2 rounded-xl bg-ts-accent/15 hover:bg-ts-accent/25 border border-ts-accent/40 text-ts-accent text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>EXPLAIN CASCADE</span>
          </button>
        </div>
      </div>

      {/* Network Health KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">NETWORK HEALTH</div>
          <div className="text-2xl font-extrabold font-mono mt-1" style={{ color: healthPct > 70 ? 'var(--ts-success)' : healthPct > 40 ? 'var(--ts-warning)' : 'var(--ts-danger)' }}>
            {healthPct}%
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">{activeNodes.length - totalOffline} of {activeNodes.length} Operational</div>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">POPULATION DEPRIVED</div>
          <div className="text-2xl font-extrabold font-mono text-ts-danger mt-1">
            {((disruption?.total_population_unserved ?? ((disruption?.total_population_lost_power || 0) + (disruption?.total_population_lost_water || 0))) || 235000).toLocaleString()}
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">Water, Power, or Transit Loss</div>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">CASCADE FAILURES</div>
          <div className="text-2xl font-extrabold font-mono text-ts-warning mt-1">
            {cascadedCount} Secondary
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">Pumping & Transit Isolation</div>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">CRITICAL BOTTLENECKS</div>
          <div className="text-2xl font-extrabold font-mono text-ts-primary mt-1">
            {graphData?.critical_path_bottlenecks?.length || 3} Points
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

          <div className="w-full overflow-x-auto min-h-[300px]">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="w-full"
              style={{ minHeight: 320 }}
            >
              {/* Background grid */}
              <defs>
                <pattern id="infra-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--ts-card-border)" strokeWidth="0.3" />
                </pattern>
                <marker id="arrow-active" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="rgba(0,240,255,0.6)" />
                </marker>
                <marker id="arrow-severed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="rgba(244,63,94,0.6)" />
                </marker>
              </defs>
              <rect width={SVG_W} height={SVG_H} fill="url(#infra-grid)" />

              {/* Edges */}
              {activeEdges.map(([a, b], i) => {
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
              {activeNodes.map(node => {
                const pos = NODE_POSITIONS[node.id] || { x: 400, y: 200 };
                const status = getNodeStatus(node.id);
                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNode === node.id;
                const nodeColor = status === 'operational'
                  ? (NODE_ICON_COLORS[node.type] || '#00f0ff')
                  : status === 'offline_primary' ? '#f43f5e' : '#fbbf24';
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
                    {/* Ring for active / offline */}
                    {(isSelected || status !== 'operational') && (
                      <circle r={r + 8} fill="none" stroke={nodeColor} strokeWidth="1.5" opacity={0.4} />
                    )}
                    {status === 'operational' && (
                      <circle r={r + 5} fill="none" stroke={nodeColor} strokeWidth="0.8" opacity={0.25}>
                        <animate attributeName="r" values={`${r+3};${r+9};${r+3}`} dur="2.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle r={r} fill={nodeColor} fillOpacity={bgOpacity} stroke={nodeColor} strokeWidth={isSelected ? 2.5 : 1.5} />
                    <text textAnchor="middle" dominantBaseline="central" fontSize="16" style={{ userSelect: 'none' }}>
                      {TYPE_ICONS[node.type] || '⬡'}
                    </text>
                    <text
                      y={r + 14}
                      textAnchor="middle"
                      fontSize="9"
                      fontFamily="monospace"
                      fill={nodeColor}
                      fontWeight="bold"
                      style={{ userSelect: 'none' }}
                    >
                      {node.id}
                    </text>
                    <text
                      y={r + 24}
                      textAnchor="middle"
                      fontSize="8"
                      fontFamily="sans-serif"
                      fill="var(--ts-muted)"
                      style={{ userSelect: 'none' }}
                    >
                      {node.name.split(' ').slice(0, 2).join(' ')}
                    </text>
                    {status !== 'operational' && (
                      <g>
                        <circle cx={r - 4} cy={-(r - 4)} r={7} fill={status === 'offline_primary' ? '#f43f5e' : '#fbbf24'} />
                        <text x={r - 4} y={-(r - 4)} textAnchor="middle" dominantBaseline="central" fontSize="8" fill="white" fontWeight="bold">
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
                  <span className="font-bold text-ts-text">{(selectedNode.population_served || 50000).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-ts-card-border/40">
                  <span className="text-ts-muted font-mono">Criticality Tier</span>
                  <span className="font-bold text-ts-accent">Tier {selectedNode.criticality_tier || 1} ({selectedNode.criticality_tier === 1 ? 'Life-Critical' : 'Secondary'})</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-ts-card-border/40">
                  <span className="text-ts-muted font-mono">Backup Power</span>
                  <span className="font-bold text-ts-primary">{selectedNode.backup_power_hrs || 0} hrs Generator</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-ts-card-border/40">
                  <span className="text-ts-muted font-mono">Flood Threshold</span>
                  <span className="font-bold text-ts-warning">{selectedNode.flood_threshold_m || 1.2}m Depth</span>
                </div>
              </div>

              <button
                onClick={() => toggleNodeFailure(selectedNode.id)}
                className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  disabledNodes.includes(selectedNode.id)
                    ? 'bg-ts-success/20 text-ts-success border border-ts-success/50 hover:bg-ts-success/30'
                    : 'bg-ts-danger/20 text-ts-danger border border-ts-danger/50 hover:bg-ts-danger/30'
                }`}
              >
                {disabledNodes.includes(selectedNode.id) ? 'RESTORE OPERATIONAL STATUS' : 'SIMULATE PRIMARY SEVERANCE'}
              </button>
            </>
          ) : (
            <div className="text-xs text-ts-muted font-mono text-center py-8">Select a node to inspect telemetry.</div>
          )}
        </div>
      </div>

      {/* Cascading Failure Table */}
      <div className="glass-panel rounded-2xl p-5 space-y-3">
        <div className="font-mono text-xs font-bold text-ts-danger flex items-center space-x-2 border-b border-ts-card-border pb-2">
          <AlertOctagon className="w-4 h-4" />
          <span>CASCADING FAILURE SEQUENCE ANALYSIS ({disruption?.cascading_failures?.length || 0} DOWNSTREAM NODES)</span>
        </div>

        <div className="space-y-2">
          {(disruption?.cascading_failures || FALLBACK_DISRUPTION.cascading_failures).map((c, i) => (
            <div key={i} className="p-3 rounded-xl bg-ts-bg/60 border border-ts-card-border flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-ts-text flex items-center space-x-2">
                  <span className="font-mono text-ts-warning">Step {c.step}</span>
                  <span>{c.node_name} ({c.node_id})</span>
                </div>
                <div className="text-[11px] text-ts-muted">{c.trigger}</div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-ts-danger font-mono font-bold">{(c.impact_population || 10000).toLocaleString()} citizens</span>
                <div className="text-[10px] text-ts-success">{c.mitigation}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
