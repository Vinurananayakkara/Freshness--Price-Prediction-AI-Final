from typing import Optional
from pydantic import BaseModel, Field


class PriceRequest(BaseModel):
    item: str
    region_type: str
    season: str

    rainfall: float = Field(ge=0)
    temperature: float
    humidity: float = Field(ge=0, le=100)

    supply_level: str
    demand_index: str

    distance_from_dambulla: float = Field(ge=0)
    middleman_count: int = Field(ge=0)
    transport_cost: float = Field(ge=0)

    # --- Extended fields for hybrid district-aware prediction ---
    district: Optional[str] = None
    freshness_score: Optional[float] = None
    freshness_status: Optional[str] = None


class VarietyPrice(BaseModel):
    """One cultivar/variety's estimated price, scaled off the item-level
    prediction. See app/utils/variety_data.py for the multiplier table and
    its sourcing notes -- this is illustrative, not a per-photo variety ID.
    """
    name: str
    wholesale_price: float
    market_price: float


class PriceResponse(BaseModel):
    """
    wholesale_price: what a trader/middleman pays at market (e.g. Dambulla).
    market_price: what a shopper pays at a retail stall/shop.
    varieties: optional breakdown across known cultivars of this item,
               scaled from wholesale_price/market_price. Empty if the item
               has no known variety table.
    """
    wholesale_price: float
    market_price: float
    varieties: list[VarietyPrice] = []


class PriceOptionsResponse(BaseModel):
    """Lets the frontend populate its dropdowns from the model's actual training categories."""
    items: list[str]
    region_types: list[str]
    seasons: list[str]
    districts: list[str]
    supply_levels: list[str] = ["Low", "Medium", "High"]
    demand_levels: list[str] = ["Low", "Medium", "High"]
