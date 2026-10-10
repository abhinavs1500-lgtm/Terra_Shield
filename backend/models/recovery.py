from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class RecoveryTask(BaseModel):
    id: str
    name: str
    target_asset_id: str
    target_asset_name: str
    category: str # Power, Water, Bridge/Road, Hospital Access, Debris Clearing
    cost_usd: float
    duration_days: int
    crews_required: int
    population_restored: int
    criticality_weight: float
    prerequisites: List[str] = [] # task IDs that must complete first
    priority_score: Optional[float] = None
    status: str = "pending" # pending, in_progress, completed

class RecoveryOptimizationRequest(BaseModel):
    available_budget_usd: float = 1200000.0
    available_crews: int = 15
    max_timeline_days: int = 30
    strategy: str = "criticality_first" # balanced, budget_efficiency, max_population, criticality_first
    manual_overrides: Optional[Dict[str, bool]] = None # task_id: forced_include

class ScheduledTask(BaseModel):
    task: RecoveryTask
    start_day: int
    end_day: int
    crew_assigned: int
    cumulative_cost: float
    cumulative_population_restored: int
    why_prioritized: str

class RecoveryPlanResponse(BaseModel):
    plan_id: str
    strategy: str
    total_cost_usd: float
    budget_utilized_pct: float
    total_population_restored: int
    total_duration_days: int
    crews_used: int
    selected_tasks_count: int
    unfunded_tasks_count: int
    schedule: List[ScheduledTask]
    unfunded_tasks: List[RecoveryTask]
    pareto_tradeoffs: List[Dict[str, Any]]
    optimization_method: str = "Deterministic Mixed-Integer Knapsack & Dependency DAG Solver"
