from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class MLModelBenchmark(BaseModel):
    model_name: str
    model_family: str
    accuracy: float
    precision_macro: float
    recall_macro: float
    f1_score: float
    roc_auc: float
    inference_latency_ms: float
    training_sample_count: int
    validation_strategy: str

class MLResearchLabReport(BaseModel):
    benchmark_timestamp: str
    target_task: str = "Multi-Class Sentinel-2 Land Cover & Inundation Semantic Classifier"
    models: List[MLModelBenchmark]
    confusion_matrix: List[List[int]]
    classes: List[str]
    feature_importances: List[Dict[str, Any]]
    dataset_quality_score: float
    missing_data_pct: float
    spatial_autocorrelation_moran_i: float
    recommendation: str
