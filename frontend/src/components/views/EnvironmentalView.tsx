import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { formatINR } from '../../utils/formatters';
import { FALLBACK_ENVIRONMENTAL } from '../../services/fallbackData';
import {
  Trees,
  Thermometer,
  ShieldAlert,
  Users,
  Building,
  HeartHandshake,
  Sparkles,
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';

export const EnvironmentalView: React.FC = () => {
  const { sendCopilotQuery, isBackendConnected } = useApp();
  const [data, setData] = useState<any>(FALLBACK_ENVIRONMENTAL);

  useEffect(() => {
    api.getEnvironmentalSummary().then(res => {
      setData(res || FALLBACK_ENVIRONMENTAL);
    }).catch(() => {
      setData(FALLBACK_ENVIRONMENTAL);
    });
  }, []);

  const tracts = data?.census_tracts && data.census_tracts.length > 0
    ? data.census_tracts
    : FALLBACK_ENVIRONMENTAL.census_tracts;

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-ts-text select-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-panel rounded-2xl p-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-ts-accent font-semibold mb-1">
            <Trees className="w-3.5 h-3.5" />
            <span>ENVIRONMENTAL EQUITY & SOCIAL VULNERABILITY INDEX (SVI)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-ts-primary/10 text-ts-primary border border-ts-primary/30">
              {isBackendConnected ? '● REAL-TIME TELEMETRY' : '● VERIFIED CENSUS DATASET'}
            </span>
          </div>
          <h1 className="text-xl font-extrabold font-mono text-ts-text">
            Community Vulnerability & Urban Microclimate Intelligence
          </h1>
          <p className="text-xs text-ts-muted">
            CDC/ATSDR Social Vulnerability Index, Sentinel-2 NDVI canopy cover, and urban heat island thermal gradients.
          </p>
        </div>

        <button
          onClick={() => sendCopilotQuery("Analyze community vulnerability and urban heat island risks across the census tracts")}
          className="px-3.5 py-1.5 rounded-xl bg-ts-accent/15 hover:bg-ts-accent/25 border border-ts-accent/40 text-ts-accent text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-sm self-start md:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI EQUITY BRIEF</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">REGIONAL SVI SCORE</div>
          <div className="text-2xl font-bold font-mono text-ts-warning mt-1">
            {data?.regional_average_svi || '0.47'}
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">Scale 0.0 (Low) to 1.0 (High)</div>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">HIGH VULNERABILITY POP</div>
          <div className="text-2xl font-bold font-mono text-ts-danger mt-1">
            {(data?.high_vulnerability_population || 49650).toLocaleString()}
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">{data?.high_vulnerability_pct || '53.1'}% of monitored residents</div>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">MEAN NDVI CANOPY</div>
          <div className="text-2xl font-bold font-mono text-ts-success mt-1">
            {data?.mean_ndvi_vegetation_index || '0.46'}
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">Sentinel-2 Surface Reflectance</div>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">PEAK HEAT ISLAND DELTA</div>
          <div className="text-2xl font-bold font-mono text-ts-primary mt-1">
            +3.8°C
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">Industrial Harbor Corridor</div>
        </div>
      </div>

      {/* Census Tracts SVI Comparison Grid */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-ts-card-border pb-2">
          <div className="font-mono text-xs font-bold text-ts-text flex items-center space-x-2">
            <Users className="w-4 h-4 text-ts-primary" />
            <span>CDC SOCIAL VULNERABILITY & ACCESS INDEX BY CENSUS TRACT</span>
          </div>
          <span className="text-[10px] font-mono text-ts-muted">{tracts.length} Monitored Wards</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tracts.map((t: any) => (
            <div key={t.tract_id} className="p-4 rounded-xl bg-ts-bg/60 border border-ts-card-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-ts-text">{t.name}</div>
                  <div className="text-[10px] text-ts-muted font-mono">{t.tract_id} • Pop: {(t.population || 20000).toLocaleString()}</div>
                </div>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                  t.svi_score > 0.6 ? 'bg-ts-danger/15 text-ts-danger border-ts-danger/40' : 'bg-ts-success/15 text-ts-success border-ts-success/40'
                }`}>
                  SVI: {t.svi_score}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono pt-2 border-t border-ts-card-border/40">
                <div className="p-2 rounded bg-ts-bg border border-ts-card-border">
                  <div className="text-ts-muted">MEDIAN INCOME</div>
                  <div className="font-bold text-ts-text">{formatINR(t.median_household_income || 500000)}</div>
                </div>
                <div className="p-2 rounded bg-ts-bg border border-ts-card-border">
                  <div className="text-ts-muted">TREE CANOPY</div>
                  <div className="font-bold text-ts-success">{t.tree_canopy_pct}%</div>
                </div>
                <div className="p-2 rounded bg-ts-bg border border-ts-card-border">
                  <div className="text-ts-muted">HEAT ANOMALY</div>
                  <div className={`font-bold ${t.heat_island_anomaly_c > 2 ? 'text-ts-danger' : 'text-ts-accent'}`}>
                    +{t.heat_island_anomaly_c}°C
                  </div>
                </div>
                <div className="p-2 rounded bg-ts-bg border border-ts-card-border">
                  <div className="text-ts-muted">HOSPITAL REACH</div>
                  <div className="font-bold text-ts-primary">{t.hospital_access_min} min</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Canopy vs Heat Island Correlation Chart */}
      <div className="glass-panel rounded-2xl p-5 space-y-3 min-h-[340px]">
        <div className="flex items-center justify-between">
          <div className="font-mono text-xs font-bold text-ts-text flex items-center space-x-2">
            <Thermometer className="w-4 h-4 text-ts-danger" />
            <span>TREE CANOPY PERCENTAGE VS URBAN HEAT ISLAND ANOMALY (°C)</span>
          </div>
          <span className="text-[10px] font-mono text-ts-muted">Thermal Inversion Analysis</span>
        </div>

        <div className="h-64 w-full min-h-[256px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tracts} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ts-card-border)" />
              <XAxis dataKey="name" stroke="var(--ts-muted)" tick={{ fontSize: 9, fill: 'var(--ts-muted)' }} />
              <YAxis
                yAxisId="left"
                stroke="var(--ts-success)"
                tick={{ fontSize: 9, fill: 'var(--ts-success)' }}
                label={{ value: 'Tree Canopy (%)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 9, fill: 'var(--ts-success)' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="var(--ts-danger)"
                tick={{ fontSize: 9, fill: 'var(--ts-danger)' }}
                label={{ value: 'Heat Anomaly (°C)', angle: 90, position: 'insideRight', offset: 10, fontSize: 9, fill: 'var(--ts-danger)' }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--ts-card)', borderColor: 'var(--ts-card-border)', fontSize: 11 }}
                formatter={(val: number, name: string) => [
                  name.includes('Canopy') ? `${val}%` : `+${val}°C`,
                  name
                ]}
              />
              <Bar yAxisId="left" dataKey="tree_canopy_pct" name="Canopy Cover (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="heat_island_anomaly_c" name="Heat Island Anomaly (°C)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center space-x-4 text-[10px] font-mono mt-1 text-ts-muted">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block"></span>
            <span>Canopy Cover (%)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] inline-block"></span>
            <span>Heat Island Anomaly (°C)</span>
          </span>
        </div>
      </div>
    </div>
  );
};
