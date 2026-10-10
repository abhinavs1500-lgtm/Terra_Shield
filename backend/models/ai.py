from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ChatMessage(BaseModel):
    role: str # user, assistant, system
    content: str
    timestamp: Optional[str] = None

class AssistantQueryRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None # selected_parcel, active_scenario, active_layers, user_role

class SourceCitation(BaseModel):
    dataset_name: str
    provider: str
    observation_date: str
    is_real_data: bool
    citation_url: Optional[str] = None
    relevance_note: str

class AssistantQueryResponse(BaseModel):
    answer: str
    sources: List[SourceCitation]
    suggested_actions: List[Dict[str, str]]
    confidence_score: float
    data_freshness_warning: Optional[str] = None
    is_hypothetical_context: bool
