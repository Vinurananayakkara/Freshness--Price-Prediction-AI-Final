from typing import Optional
from pydantic import BaseModel

from app.schemas.price_schema import VarietyPrice


class HybridResponse(BaseModel):
    # Freshness outputs
    item: str
    prediction: str          # "Fresh" or "Rotten"
    confidence: float
    freshness_score: float   # 0.0 - 100.0

    # Market context
    district: str
    region_type: str
    distance_from_dambulla: float

    # Price output -- all Optional because a Rotten item gets no price at
    # all (see app/api/hybrid.py). Fresh items always populate these.
    wholesale_price: Optional[float] = None
    market_price: Optional[float] = None
    varieties: list[VarietyPrice] = []
    price_available: bool = True     # False if rotten, or the item has no pricing data
    note: Optional[str] = None       # explains why price_available is False
