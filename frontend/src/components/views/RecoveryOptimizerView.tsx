import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { RecoveryPlanResponse, RecoveryTask } from '../../types';
import { formatINR, formatNumberIN } from '../../utils/formatters';
import {
  Wrench,
  IndianRupee,
  Users,
  Calendar,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Zap,
  Building,
  ArrowRight,
  Sliders,
  CheckSquare,
  Square
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export const RecoveryOptimizerView: React.FC = () => {
  const { sendCopilotQuery, setCurrentView } = useApp();

  const [budget, setBudget] = useState<number>(1200000);
  const [crews, setCrews] = useState<number>(15);
  const [strategy, setStrategy] = useState<string>('criticality_first');
  const [manualOverrides, setManualOverrides] = useState<Record<string, boolean>>({});
  const [plan, setPlan] = useState<RecoveryPlanResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    solveRecoveryPlan();
  }, [budget, crews, strategy, manualOverrides]);

  const solveRecoveryPlan = async () => {
    setLoading(true);
    try {
      const res = await api.optimizeRecovery({
        available_budget_usd: budget,
        available_crews: crews,
        strategy,
        manual_overrides: manualOverrides
      });
      setPlan(res);
    } catch (e) {
      console.warn('Recovery plan solver failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleOverride = (taskId: string) => {
    setManualOverrides(prev => {
      const curr = prev[taskId];
      if (curr === true) return { ...prev, [taskId]: false };
      if (curr === false) {
        const next = { ...prev };
        delete next[taskId];
        return next;
      }
      return { ...prev, [taskId]: true };
    });
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-ts-text select-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-panel rounded-2xl p-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-ts-info font-semibold mb-1">
            <Wrench className="w-3.5 h-3.5" />
            <span>DETERMINISTIC INTEGER KNAPSACK & DAG SCHEDULER</span>
          </div>
          <h1 className="text-xl font-extrabold font-mono text-ts-text">
            Disaster Recovery Optimization & Resource Allocation
          </h1>
          <p className="text-xs text-ts-muted">
            Solves multi-objective repair sequencing subject to budget constraints, crew capacity, and operational dependencies.
          </p>
        </div>

        <button
          onClick={() => sendCopilotQuery(`Explain why the recovery optimization solver prioritized plan ${plan?.plan_id} with ${formatINR(plan?.total_cost_usd)} budget`)}
          className="px-3.5 py-1.5 rounded-xl bg-ts-info/15 hover:bg-ts-info/25 border border-ts-info/40 text-ts-info text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-sm self-start md:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>EXPLAIN PLAN WITH AI</span>
        </button>
      </div>

      {/* Constraints & Strategy Sliders */}
      <div className="glass-panel-glow rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-mono">
        {/* Budget Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-ts-muted flex items-center space-x-1">
              <IndianRupee className="w-3.5 h-3.5 text-ts-success" />
              <span>REPAIR BUDGET CAP</span>
            </span>
            <span className="text-ts-success font-bold text-sm">
              {formatINR(budget, { compact: true })}
            </span>
          </div>
          <input
            type="range"
            min="400000"
            max="2200000"
            step="100000"
            value={budget}
            onChange={(e) => setBudget(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-ts-bg rounded"
          />
          <div className="flex justify-between text-[9px] text-ts-muted">
            <span>₹40 Lakh (Emergency)</span>
            <span>₹1.20 Cr (Nominal)</span>
            <span>₹2.20 Cr (Full Recovery)</span>
          </div>
        </div>

        {/* Crew Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-ts-muted flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-ts-primary" />
              <span>AVAILABLE CREWS</span>
            </span>
            <span className="text-ts-primary font-bold text-sm">
              {crews} Active Teams
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={crews}
            onChange={(e) => setCrews(parseInt(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-ts-bg rounded"
          />
          <div className="flex justify-between text-[9px] text-ts-muted">
            <span>5 Teams</span>
            <span>15 Teams</span>
            <span>30 Teams</span>
          </div>
        </div>

        {/* Strategy Chooser */}
        <div className="space-y-1.5">
          <div className="text-xs text-ts-muted">OPTIMIZATION STRATEGY</div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'criticality_first', label: 'Life-Safety 1st' },
              { id: 'max_population', label: 'Max Population' },
              { id: 'budget_efficiency', label: 'Budget Efficacy' },
              { id: 'balanced', label: 'Balanced' }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setStrategy(s.id)}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase transition-all truncate ${
                  strategy === s.id
                    ? 'bg-ts-primary text-slate-950 font-extrabold shadow-md'
                    : 'bg-ts-bg text-ts-muted hover:text-ts-text border border-ts-card-border'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Solved Plan KPI Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">TOTAL COST ALLOCATED</div>
          <div className="text-2xl font-bold font-mono text-ts-success mt-1">
            {formatINR(plan?.total_cost_usd)}
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">{plan?.budget_utilized_pct}% of budget utilized</div>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">CITIZENS RESTORED</div>
          <div className="text-2xl font-bold font-mono text-ts-accent mt-1">
            {formatNumberIN(plan?.total_population_restored)}
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">Power, Water & Hospital Access</div>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">TOTAL DURATION</div>
          <div className="text-2xl font-bold font-mono text-ts-primary mt-1">
            {plan?.total_duration_days} Days
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">Sequential DAG Execution</div>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">TASKS FUNDED</div>
          <div className="text-2xl font-bold font-mono text-ts-text mt-1">
            {plan?.selected_tasks_count} / {(plan?.selected_tasks_count || 0) + (plan?.unfunded_tasks_count || 0)}
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">{plan?.unfunded_tasks_count} deferred to Phase 2</div>
        </div>
      </div>

      {/* Scheduled Gantt Timeline — Real Gantt Bars */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-ts-card-border pb-2">
          <div className="font-mono text-xs font-bold text-ts-text flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-ts-primary" />
            <span>OPTIMIZED RECOVERY GANTT TIMELINE ({plan?.schedule.length || 0} TASKS)</span>
          </div>
          <span className="text-[10px] font-mono text-ts-muted">{plan?.strategy} · Total: {plan?.total_duration_days} Days</span>
        </div>

        {/* Day header ruler */}
        {plan && plan.total_duration_days > 0 && (
          <div className="ml-44 pr-2">
            <div className="flex text-[9px] font-mono text-ts-muted relative h-4">
              {Array.from({ length: plan.total_duration_days + 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute text-center"
                  style={{ left: `${(i / plan.total_duration_days) * 100}%`, transform: 'translateX(-50%)' }}
                >
                  {i % 5 === 0 ? `D${i}` : ''}
                </div>
              ))}
            </div>
            <div className="h-px bg-ts-card-border/60 mb-1" />
          </div>
        )}

        <div className="space-y-2">
          {plan?.schedule.map((item, idx) => {
            const totalDays = plan.total_duration_days || 1;
            const startPct = ((item.start_day - 1) / totalDays) * 100;
            const widthPct = (item.task.duration_days / totalDays) * 100;
            const categoryColors: Record<string, string> = {
              power: 'var(--ts-primary)',
              water: 'var(--ts-info)',
              hospital: 'var(--ts-success)',
              bridge: 'var(--ts-warning)',
              communications: 'var(--ts-secondary)',
              shelter: 'var(--ts-accent)',
            };
            const barColor = categoryColors[item.task.category] || 'var(--ts-primary)';

            return (
              <div key={idx} className="flex items-center gap-2 group hover:bg-ts-card/30 rounded-lg px-1 py-0.5 transition-colors">
                {/* Task label */}
                <div className="w-44 shrink-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded bg-ts-primary/20 text-ts-primary font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-[11px] text-ts-text truncate leading-tight">{item.task.name}</div>
                      <div className="text-[9px] text-ts-muted font-mono">{item.task.category} · {item.task.duration_days}d · {formatINR(item.task.cost_usd, { compact: true })}</div>
                    </div>
                  </div>
                </div>

                {/* Gantt bar track */}
                <div className="flex-1 relative h-6 bg-ts-bg/60 rounded overflow-hidden border border-ts-card-border/40">
                  <div
                    className="absolute top-0 h-full rounded flex items-center overflow-hidden transition-all"
                    style={{
                      left: `${startPct}%`,
                      width: `${widthPct}%`,
                      background: `linear-gradient(90deg, ${barColor}40, ${barColor}80)`,
                      borderLeft: `2px solid ${barColor}`,
                      minWidth: '4px'
                    }}
                  >
                    <span
                      className="px-1.5 text-[9px] font-mono font-bold whitespace-nowrap overflow-hidden"
                      style={{ color: barColor }}
                    >
                      {item.task.duration_days >= 3 ? `D${item.start_day}–D${item.end_day}` : ''}
                    </span>
                  </div>
                </div>

                {/* Pop restored badge */}
                <div className="w-20 shrink-0 text-right">
                  <span className="text-[9px] font-mono text-ts-accent font-bold">
                    +{formatNumberIN(item.task.population_restored)}
                  </span>
                  <div className="text-[8px] text-ts-muted">restored</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pareto Frontier Curve & Unfunded Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pareto Frontier Line Chart */}
        <div className="glass-panel rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-ts-card-border pb-1.5">
            <div className="font-mono text-xs font-bold text-ts-text flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-ts-accent" />
              <span>PARETO FRONTIER: BUDGET (₹) VS CITIZENS RESTORED</span>
            </div>
            <span className="text-[10px] font-mono text-ts-muted">Trade-off Curve</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={plan?.pareto_tradeoffs || []} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ts-card-border)" />
                <XAxis
                  dataKey="budget_level"
                  stroke="var(--ts-muted)"
                  tick={{ fontSize: 9, fill: 'var(--ts-muted)' }}
                  tickFormatter={(v) => formatINR(v, { compact: true })}
                  label={{ value: 'Budget Level (₹ INR)', position: 'insideBottom', offset: -12, fontSize: 9, fill: 'var(--ts-muted)' }}
                />
                <YAxis
                  stroke="var(--ts-muted)"
                  tick={{ fontSize: 9, fill: 'var(--ts-muted)' }}
                  tickFormatter={(v) => `${(v/1000).toFixed(0)}k`}
                  label={{ value: 'Population Restored', angle: -90, position: 'insideLeft', offset: 10, fontSize: 9, fill: 'var(--ts-muted)' }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--ts-card)', borderColor: 'var(--ts-card-border)', fontSize: 11 }}
                  formatter={(v: number) => [`${formatNumberIN(v)} citizens`, 'Restored']}
                  labelFormatter={(l: number) => `Budget: ${formatINR(l)}`}
                />
                <Line type="monotone" dataKey="population_restored" name="Population Restored" stroke="var(--ts-accent)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--ts-accent)' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deferred / Unfunded Tasks for Phase 2 */}
        <div className="glass-panel rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-ts-card-border pb-1.5">
            <div className="font-mono text-xs font-bold text-ts-warning flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>UNFUNDED / DEFERRED REPAIRS ({plan?.unfunded_tasks.length || 0})</span>
            </div>
            <span className="text-[10px] font-mono text-ts-muted">Phase 2 Pipeline</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {plan?.unfunded_tasks.map((task, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-ts-bg/60 border border-ts-card-border/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-ts-text">{task.name}</div>
                  <div className="text-[10px] text-ts-muted font-mono">{task.category} • {task.duration_days} days</div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-ts-muted font-bold">{formatINR(task.cost_usd)}</div>
                  <button
                    onClick={() => toggleOverride(task.id)}
                    className="text-[9px] text-ts-primary hover:underline"
                  >
                    Force Include
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentView('reports')}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-ts-primary to-ts-secondary text-slate-950 text-xs font-mono font-bold hover:scale-102 transition-transform shadow-md"
          >
            EXPORT RECOVERY DOSSIER (PDF)
          </button>
        </div>
      </div>
    </div>
  );
};
