from fastapi import APIRouter, Depends, HTTPException

from app.api.auth import get_current_user
from app.db.models import User
from app.schemas.price_schema import PriceRequest, PriceOptionsResponse, PriceResponse
from app.services.price_service import (
    predict_price,
    KNOWN_ITEMS,
    KNOWN_REGION_TYPES,
    KNOWN_SEASONS,
)
from app.utils.district_data import DISTRICT_NAMES, get_district_defaults

router = APIRouter()


@router.post("/predict-price", response_model=PriceResponse)
def price_prediction(data: PriceRequest, current_user: User = Depends(get_current_user)):
    return predict_price(data)


@router.get("/price-options", response_model=PriceOptionsResponse)
def price_options(current_user: User = Depends(get_current_user)):
    """
    Drives the Advanced Price Prediction form: only lets the user pick
    items/regions/seasons the model was actually trained on, and districts
    from the reference table (for auto-filling weather/distance if wanted).
    """
    return PriceOptionsResponse(
        items=KNOWN_ITEMS,
        region_types=KNOWN_REGION_TYPES,
        seasons=KNOWN_SEASONS,
        districts=DISTRICT_NAMES,
    )


@router.get("/district-defaults/{district}")
def district_defaults(district: str, current_user: User = Depends(get_current_user)):
    """
    Lets the Advanced Price Prediction form auto-fill rainfall/temperature/
    humidity/region_type/distance for a chosen district; the user can then
    override any field before submitting.
    """
    try:
        return get_district_defaults(district)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
