import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { RecoveryPlanResponse, RecoveryTask } from '../../types';
import { formatINR, formatNumberIN } from '../../utils/formatters';
import { FALLBACK_RECOVERY_PLAN } from '../../services/fallbackData';
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
  const { sendCopilotQuery, setCurrentView, isBackendConnected } = useApp();

  const [budget, setBudget] = useState<number>(1200000);
  const [crews, setCrews] = useState<number>(15);
  const [strategy, setStrategy] = useState<string>('criticality_first');
  const [manualOverrides, setManualOverrides] = useState<Record<string, boolean>>({});
  const [plan, setPlan] = useState<RecoveryPlanResponse>(FALLBACK_RECOVERY_PLAN);
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
      setPlan(res || FALLBACK_RECOVERY_PLAN);
    } catch (e) {
      console.warn('Recovery plan solver fallback:', e);
      setPlan(FALLBACK_RECOVERY_PLAN);
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

  const currentPlan = plan || FALLBACK_RECOVERY_PLAN;
  const paretoData = currentPlan.pareto_tradeoffs && currentPlan.pareto_tradeoffs.length > 0
    ? currentPlan.pareto_tradeoffs
    : FALLBACK_RECOVERY_PLAN.pareto_tradeoffs;

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-ts-text select-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-panel rounded-2xl p-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-ts-info font-semibold mb-1">
            <Wrench className="w-3.5 h-3.5" />
            <span>DETERMINISTIC INTEGER KNAPSACK & DAG SCHEDULER</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-ts-primary/10 text-ts-primary border border-ts-primary/30">
              {isBackendConnected ? '● REAL-TIME SOLVER' : '● OPTIMAL OFFLINE MODEL'}
            </span>
          </div>
          <h1 className="text-xl font-extrabold font-mono text-ts-text">
            Disaster Recovery Optimization & Resource Allocation
          </h1>
          <p className="text-xs text-ts-muted">
            Solves multi-objective repair sequencing subject to budget constraints, crew capacity, and operational dependencies.
          </p>
        </div>

        <button
          onClick={() => sendCopilotQuery(`Explain why the recovery optimization solver prioritized plan ${currentPlan.plan_id} with ${formatINR(currentPlan.total_cost_usd)} budget`)}
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
            {formatINR(currentPlan.total_cost_usd || 1090000)}
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">{currentPlan.budget_utilized_pct || 90.8}% of budget utilized</div>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">CITIZENS RESTORED</div>
          <div className="text-2xl font-bold font-mono text-ts-accent mt-1">
            {formatNumberIN(currentPlan.total_population_restored || 608000)}
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">Power, Water & Hospital Access</div>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">TOTAL DURATION</div>
          <div className="text-2xl font-bold font-mono text-ts-primary mt-1">
            {currentPlan.total_duration_days || 11} Days
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">Sequential DAG Execution</div>
        </div>

        <div className="glass-panel rounded-xl p-3.5">
          <div className="text-[10px] font-mono text-ts-muted">TASKS FUNDED</div>
          <div className="text-2xl font-bold font-mono text-ts-text mt-1">
            {currentPlan.selected_tasks_count || 6} / {(currentPlan.selected_tasks_count || 6) + (currentPlan.unfunded_tasks_count || 1)}
          </div>
          <div className="text-[10px] text-ts-muted mt-0.5">{currentPlan.unfunded_tasks_count || 1} deferred to Phase 2</div>
        </div>
      </div>

      {/* Scheduled Gantt Timeline */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-ts-card-border pb-2">
          <div className="font-mono text-xs font-bold text-ts-text flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-ts-primary" />
            <span>OPTIMIZED RECOVERY GANTT TIMELINE ({(currentPlan.schedule || []).length} TASKS)</span>
          </div>
          <span className="text-[10px] font-mono text-ts-muted">{currentPlan.strategy} · Total: {currentPlan.total_duration_days || 11} Days</span>
        </div>

        {/* Day header ruler */}
        {currentPlan.total_duration_days > 0 && (
          <div className="ml-44 pr-2">
            <div className="flex text-[9px] font-mono text-ts-muted relative h-4">
              {Array.from({ length: (currentPlan.total_duration_days || 11) + 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute text-center"
                  style={{ left: `${(i / (currentPlan.total_duration_days || 11)) * 100}%`, transform: 'translateX(-50%)' }}
                >
                  D{i}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task rows */}
        <div className="space-y-2">
          {(currentPlan.schedule || []).map((item, idx) => {
            const leftPct = ((item.start_day - 1) / (currentPlan.total_duration_days || 11)) * 100;
            const widthPct = Math.max(3, (item.task.duration_days / (currentPlan.total_duration_days || 11)) * 100);

            const isPower = item.task.category.toLowerCase().includes('power');
            const isWater = item.task.category.toLowerCase().includes('water');
            const isBridge = item.task.category.toLowerCase().includes('bridge') || item.task.category.toLowerCase().includes('road');
            const isMed = item.task.category.toLowerCase().includes('med') || item.task.category.toLowerCase().includes('hosp');

            const barColor = isPower ? '#00f0ff' : isWater ? '#38bdf8' : isBridge ? '#fbbf24' : isMed ? '#10b981' : '#a855f7';

            return (
              <div key={idx} className="flex items-center space-x-2 text-xs">
                {/* Task Label */}
                <div className="w-44 shrink-0 truncate font-mono text-[11px]" title={item.task.name}>
                  <span className="text-ts-text font-semibold">{item.task.name}</span>
                  <div className="text-[9px] text-ts-muted">{item.task.category} • {formatINR(item.task.cost_usd, { compact: true })}</div>
                </div>

                {/* Timeline Bar */}
                <div className="flex-1 bg-ts-bg rounded-lg h-7 relative overflow-hidden border border-ts-card-border/60">
                  <div
                    className="absolute top-1 bottom-1 rounded flex items-center justify-center transition-all"
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      backgroundColor: `${barColor}25`,
                      border: `1px solid ${barColor}80`
                    }}
                  >
                    <span
                      className="px-1.5 text-[9px] font-mono font-bold whitespace-nowrap overflow-hidden"
                      style={{ color: barColor }}
                    >
                      {item.task.duration_days >= 2 ? `D${item.start_day}–D${item.end_day}` : ''}
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
        <div className="glass-panel rounded-2xl p-4 space-y-3 min-h-[320px]">
          <div className="flex items-center justify-between border-b border-ts-card-border pb-1.5">
            <div className="font-mono text-xs font-bold text-ts-text flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-ts-accent" />
              <span>PARETO FRONTIER: BUDGET (₹) VS CITIZENS RESTORED</span>
            </div>
            <span className="text-[10px] font-mono text-ts-muted">Trade-off Curve</span>
          </div>

          <div className="h-60 w-full min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={paretoData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
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
                  label={{ value: 'Citizens Restored', angle: -90, position: 'insideLeft', offset: 10, fontSize: 9, fill: 'var(--ts-muted)' }}
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
              <span>UNFUNDED / DEFERRED REPAIRS ({(currentPlan.unfunded_tasks || []).length})</span>
            </div>
            <span className="text-[10px] font-mono text-ts-muted">Phase 2 Pipeline</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {(currentPlan.unfunded_tasks || FALLBACK_RECOVERY_PLAN.unfunded_tasks).map((task, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-ts-bg/60 border border-ts-card-border/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-ts-text">{task.name}</div>
                  <div className="text-[10px] text-ts-muted font-mono">{task.category} • {task.duration_days} days</div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-ts-warning font-bold">{formatINR(task.cost_usd)}</div>
                  <div className="text-[9px] text-ts-muted">+{formatNumberIN(task.population_restored)} pop</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
