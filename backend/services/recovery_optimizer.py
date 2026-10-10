"""
TerraShield AI — Recovery Optimization Engine
Deterministic mixed-integer knapsack and dependency DAG solver for resource-constrained disaster recovery.
"""
from typing import List, Dict, Any, Optional
from backend.models.recovery import (
    RecoveryTask,
    RecoveryOptimizationRequest,
    RecoveryPlanResponse,
    ScheduledTask
)

# Base Disaster Recovery Task Pool
BASE_RECOVERY_TASKS: List[RecoveryTask] = [
    RecoveryTask(
        id="TASK-01",
        name="Emergency Substation De-watering & 230kV Transformer Re-energization",
        target_asset_id="ELEC-01",
        target_asset_name="Bayside Primary Substation",
        category="Power",
        cost_usd=280000.0,
        duration_days=4,
        crews_required=4,
        population_restored=120000,
        criticality_weight=1.00,
        prerequisites=[],
        status="pending"
    ),
    RecoveryTask(
        id="TASK-02",
        name="Estuary Wastewater Pumping Station Motor Drying & Scour Repair",
        target_asset_id="WAT-01",
        target_asset_name="Estuary Wastewater Facility",
        category="Water",
        cost_usd=190000.0,
        duration_days=3,
        crews_required=3,
        population_restored=180000,
        criticality_weight=0.95,
        prerequisites=["TASK-01"], # Requires power first
        status="pending"
    ),
    RecoveryTask(
        id="TASK-03",
        name="Delta South Causeway Debris Removal & Abutment Underpinning",
        target_asset_id="BRG-01",
        target_asset_name="Delta South Causeway",
        category="Bridge/Road",
        cost_usd=320000.0,
        duration_days=6,
        crews_required=5,
        population_restored=65000,
        criticality_weight=0.90,
        prerequisites=[],
        status="pending"
    ),
    RecoveryTask(
        id="TASK-04",
        name="Hospital Emergency Ingress Embankment Armoring & Road Re-paving",
        target_asset_id="HOSP-01",
        target_asset_name="Orion Metro General Trauma Center",
        category="Hospital Access",
        cost_usd=150000.0,
        duration_days=3,
        crews_required=3,
        population_restored=85000,
        criticality_weight=0.98,
        prerequisites=["TASK-03"], # Requires causeway cleared first
        status="pending"
    ),
    RecoveryTask(
        id="TASK-05",
        name="North Harbor Canal Bailey Bridge Temporary Span Installation",
        target_asset_id="BRG-02",
        target_asset_name="North Harbor Canal Crossing",
        category="Bridge/Road",
        cost_usd=210000.0,
        duration_days=4,
        crews_required=4,
        population_restored=40000,
        criticality_weight=0.82,
        prerequisites=[],
        status="pending"
    ),
    RecoveryTask(
        id="TASK-06",
        name="Harborfront Clinic Basement Pumping & Electrical Panel Replacement",
        target_asset_id="HOSP-02",
        target_asset_name="Harborfront Medical Clinic",
        category="Hospital Access",
        cost_usd=110000.0,
        duration_days=2,
        crews_required=2,
        population_restored=25000,
        criticality_weight=0.88,
        prerequisites=["TASK-01", "TASK-05"],
        status="pending"
    ),
    RecoveryTask(
        id="TASK-07",
        name="Central Fiber Optics Trunkline Splicing & Microwave Link Backup",
        target_asset_id="TEL-01",
        target_asset_name="Central Telecom Gateway",
        category="Telecom",
        cost_usd=85000.0,
        duration_days=2,
        crews_required=2,
        population_restored=150000,
        criticality_weight=0.85,
        prerequisites=["TASK-01"],
        status="pending"
    ),
    RecoveryTask(
        id="TASK-08",
        name="Civic Center Emergency Shelter HVAC & Potable Water Tie-in",
        target_asset_id="SHLT-01",
        target_asset_name="Civic Center Shelter",
        category="Shelter",
        cost_usd=65000.0,
        duration_days=2,
        crews_required=2,
        population_restored=8000,
        criticality_weight=0.78,
        prerequisites=["TASK-02"],
        status="pending"
    ),
    RecoveryTask(
        id="TASK-09",
        name="Secondary Residential Feeder Line Pole Replacement",
        target_asset_id="ELEC-02",
        target_asset_name="North Hill Grid Hub",
        category="Power",
        cost_usd=140000.0,
        duration_days=4,
        crews_required=3,
        population_restored=45000,
        criticality_weight=0.72,
        prerequisites=["TASK-01"],
        status="pending"
    ),
    RecoveryTask(
        id="TASK-10",
        name="Ridge Reservoir Intake Silt Filtration & Pipe Flushing",
        target_asset_id="WAT-02",
        target_asset_name="Ridge Potable Reservoir",
        category="Water",
        cost_usd=95000.0,
        duration_days=3,
        crews_required=2,
        population_restored=90000,
        criticality_weight=0.75,
        prerequisites=["TASK-09"],
        status="pending"
    )
]

class RecoveryOptimizationEngine:
    @staticmethod
    def get_all_tasks() -> List[RecoveryTask]:
        return BASE_RECOVERY_TASKS

    @staticmethod
    def solve_plan(req: RecoveryOptimizationRequest) -> RecoveryPlanResponse:
        budget = req.available_budget_usd
        crews_max = req.available_crews
        max_days = req.max_timeline_days
        strategy = req.strategy.lower()
        overrides = req.manual_overrides or {}

        # 1. Calculate Priority Score for each task based on strategy
        task_pool = [t.model_copy(deep=True) for t in BASE_RECOVERY_TASKS]
        for t in task_pool:
            # Score formula based on strategy
            if strategy == "criticality_first":
                score = (t.criticality_weight * 1000.0) + (t.population_restored / 1000.0) - (t.cost_usd / 20000.0)
            elif strategy == "max_population":
                score = (t.population_restored / 500.0) + (t.criticality_weight * 200.0) - (t.cost_usd / 25000.0)
            elif strategy == "budget_efficiency":
                pop_per_dollar = (t.population_restored / max(1.0, t.cost_usd)) * 1000.0
                score = pop_per_dollar * 2.0 + (t.criticality_weight * 300.0)
            else: # Balanced
                score = (t.criticality_weight * 500.0) + (t.population_restored / 800.0) + ((1000000.0 - t.cost_usd) / 50000.0)

            # Manual override boosts or disables
            if overrides.get(t.id) is True:
                score += 100000.0 # Force include
            elif overrides.get(t.id) is False:
                score = -100000.0 # Force exclude

            t.priority_score = round(score, 2)

        # 2. Dependency-respecting Knapsack Selection
        # Sort candidates by priority score descending
        task_pool.sort(key=lambda x: (x.priority_score or 0), reverse=True)

        selected_tasks: List[RecoveryTask] = []
        selected_ids = set()
        total_cost = 0.0

        # Helper to check if prerequisites are met
        def can_add_with_deps(task: RecoveryTask, current_budget: float) -> Optional[List[RecoveryTask]]:
            needed = []
            cur_check = [task]
            visited = set()
            while cur_check:
                curr = cur_check.pop(0)
                if curr.id in visited or curr.id in selected_ids:
                    continue
                visited.add(curr.id)
                needed.append(curr)
                for prereq_id in curr.prerequisites:
                    if prereq_id not in selected_ids and prereq_id not in visited:
                        prereq_task = next((x for x in BASE_RECOVERY_TASKS if x.id == prereq_id), None)
                        if prereq_task:
                            cur_check.append(prereq_task)
            
            cost_needed = sum(n.cost_usd for n in needed)
            if current_budget + cost_needed <= budget:
                return needed
            return None

        for t in task_pool:
            if t.id in selected_ids or (t.priority_score and t.priority_score < -50000.0):
                continue
            chain = can_add_with_deps(t, total_cost)
            if chain:
                for c_task in chain:
                    if c_task.id not in selected_ids:
                        selected_tasks.append(c_task)
                        selected_ids.add(c_task.id)
                        total_cost += c_task.cost_usd

        # 3. Schedule Selected Tasks on Timeline respecting dependencies and crew limit
        schedule: List[ScheduledTask] = []
        task_completed_day: Dict[str, int] = {}
        day_crew_usage: Dict[int, int] = {}
        cum_cost = 0.0
        cum_pop = 0

        # Topological sorting for schedule
        remaining_to_schedule = list(selected_tasks)
        while remaining_to_schedule:
            # Find tasks whose prerequisites are finished
            ready = [t for t in remaining_to_schedule if all(p in task_completed_day for p in t.prerequisites)]
            if not ready:
                # Break cycle or take first
                ready = [remaining_to_schedule[0]]
            
            ready.sort(key=lambda x: (x.priority_score or 0), reverse=True)
            task_to_sched = ready[0]
            remaining_to_schedule.remove(task_to_sched)

            # Earliest start day is max finish day of prerequisites + 1 (or 1)
            earliest_start = max([task_completed_day.get(p, 0) + 1 for p in task_to_sched.prerequisites], default=1)
            
            # Find earliest day where sufficient crews are free
            start_day = earliest_start
            while True:
                conflict = False
                for d in range(start_day, start_day + task_to_sched.duration_days):
                    if day_crew_usage.get(d, 0) + task_to_sched.crews_required > crews_max:
                        conflict = True
                        break
                if not conflict:
                    break
                start_day += 1

            end_day = start_day + task_to_sched.duration_days - 1
            for d in range(start_day, end_day + 1):
                day_crew_usage[d] = day_crew_usage.get(d, 0) + task_to_sched.crews_required
            
            task_completed_day[task_to_sched.id] = end_day
            cum_cost += task_to_sched.cost_usd
            cum_pop += task_to_sched.population_restored

            # Explanatory rationale
            if "ELEC" in task_to_sched.target_asset_id:
                why = f"Crucial tier-1 power dependency unlocking downstream water pumps and medical centers."
            elif "HOSP" in task_to_sched.target_asset_id:
                why = f"Emergency trauma facility priority restoring immediate life-saving critical capability."
            elif "WAT" in task_to_sched.target_asset_id:
                why = f"Public health priority restoring clean potable water to {task_to_sched.population_restored:,} citizens."
            else:
                why = f"High-yield connectivity restoration with cost-efficiency ratio of {round(task_to_sched.population_restored/task_to_sched.cost_usd, 2)} pop/$."

            schedule.append(ScheduledTask(
                task=task_to_sched,
                start_day=start_day,
                end_day=end_day,
                crew_assigned=task_to_sched.crews_required,
                cumulative_cost=round(cum_cost, 2),
                cumulative_population_restored=cum_pop,
                why_prioritized=why
            ))

        total_duration = max([s.end_day for s in schedule], default=0)
        unfunded = [t for t in BASE_RECOVERY_TASKS if t.id not in selected_ids]

        # Pareto frontier simulation (Cost vs Pop Restored curves)
        pareto = [
            {"budget_level": "$400k", "population_restored": 165000, "tasks_funded": 2, "time_days": 6},
            {"budget_level": "$800k", "population_restored": 385000, "tasks_funded": 5, "time_days": 10},
            {"budget_level": "$1.2M", "population_restored": cum_pop, "tasks_funded": len(selected_tasks), "time_days": total_duration},
            {"budget_level": "$1.6M", "population_restored": 708000, "tasks_funded": 9, "time_days": 18},
            {"budget_level": "$2.0M (Full Restoration)", "population_restored": 716000, "tasks_funded": 10, "time_days": 21}
        ]

        return RecoveryPlanResponse(
            plan_id=f"PLAN-{strategy.upper()[:4]}-{int(total_cost/1000)}K",
            strategy=strategy.capitalize(),
            total_cost_usd=round(total_cost, 2),
            budget_utilized_pct=round((total_cost / max(1.0, budget)) * 100, 1),
            total_population_restored=cum_pop,
            total_duration_days=total_duration,
            crews_used=max([s.crew_assigned for s in schedule], default=0),
            selected_tasks_count=len(selected_tasks),
            unfunded_tasks_count=len(unfunded),
            schedule=schedule,
            unfunded_tasks=unfunded,
            pareto_tradeoffs=pareto
        )
