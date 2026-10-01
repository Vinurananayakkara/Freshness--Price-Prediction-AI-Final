from typing import Optional
from pydantic import BaseModel


class FreshnessResponse(BaseModel):
    prediction: str
    item: str
    confidence: float
    freshness_score: Optional[float] = None
    raw_label: Optional[str] = None
