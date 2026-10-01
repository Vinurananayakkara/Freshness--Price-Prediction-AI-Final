"""
hybrid.py  (a.k.a. the "Inspector Desk")
-----------------------------------------
/api/predict-hybrid
  - Accepts: produce image (file) + district (form field) + optional market params
  - Returns: freshness verdict, freshness score, item name, and
    district-tailored wholesale price, market (retail) price, and a
    per-variety price breakdown.

Rotten items are never priced: spoiled produce isn't something a trader or
shop is buying/selling at a market rate, so this returns price_available=False
with an explanatory note instead of running the price model at all.
"""
from typing import Optional

from fastapi import APIRouter, Depends, Form, UploadFile, File, HTTPException
from PIL import Image, UnidentifiedImageError

from app.api.auth import get_current_user
from app.db.models import User
from app.schemas.hybrid_schema import HybridResponse
from app.services.freshness_service import predict_freshness
from app.services.price_service import predict_price_from_parts, resolve_item_for_price_model
from app.utils.district_data import get_district_defaults, DISTRICT_NAMES

router = APIRouter()


def _compute_freshness_score(prediction: str, confidence: float) -> float:
    if prediction == "Fresh":
        return round(confidence * 100, 1)
    return round((1.0 - confidence) * 100, 1)


@router.post("/predict-hybrid", response_model=HybridResponse)
async def predict_hybrid(
    file: UploadFile = File(...),
    district: str = Form(...),
    season: Optional[str] = Form(default="Maha"),
    supply_level: Optional[str] = Form(default="Medium"),
    demand_index: Optional[str] = Form(default="Medium"),
    middleman_count: Optional[int] = Form(default=2),
    transport_cost: Optional[float] = Form(default=500.0),
    current_user: User = Depends(get_current_user),
):
    # --- Validate and open image ---
    if file.content_type is None or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    try:
        image = Image.open(file.file)
        image.load()
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Could not read the uploaded file as an image.")

    # --- Run freshness model ---
    freshness_result = predict_freshness(image)
    prediction = freshness_result["prediction"]   # "Fresh" or "Rotten"
    confidence = freshness_result["confidence"]
    freshness_score = _compute_freshness_score(prediction, confidence)

    # --- Validate district ---
    try:
        district_defaults = get_district_defaults(district)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    # --- Rotten produce isn't priced. Skip the price model entirely. ---
    if prediction == "Rotten":
        return HybridResponse(
            item=freshness_result["item"],
            prediction=prediction,
            confidence=round(confidence, 4),
            freshness_score=freshness_score,
            district=district_defaults["district"],
            region_type=district_defaults["region_type"],
            distance_from_dambulla=district_defaults["distance"],
            wholesale_price=None,
            market_price=None,
            varieties=[],
            price_available=False,
            note="This item was identified as rotten; pricing isn't estimated for spoiled produce.",
        )

    # --- Resolve freshness item -> price model item ---
    price_item = resolve_item_for_price_model(freshness_result["item"])

    if price_item is None:
        return HybridResponse(
            item=freshness_result["item"],
            prediction=prediction,
            confidence=round(confidence, 4),
            freshness_score=freshness_score,
            district=district_defaults["district"],
            region_type=district_defaults["region_type"],
            distance_from_dambulla=district_defaults["distance"],
            wholesale_price=None,
            market_price=None,
            varieties=[],
            price_available=False,
            note=(
                f"Detected '{freshness_result['item']}', but the price model "
                "has no pricing data for this item."
            ),
        )

    # --- Run price model(s) ---
    def _val(val, default, caster=str):
        if val is None or hasattr(val, "default"):
            return default
        try:
            return caster(val)
        except (ValueError, TypeError):
            return default

    clean_season = _val(season, "Maha", str)
    clean_supply = _val(supply_level, "Medium", str)
    clean_demand = _val(demand_index, "Medium", str)
    clean_middleman = _val(middleman_count, 2, int)
    clean_transport = _val(transport_cost, 500.0, float)

    price_result = predict_price_from_parts(
        item=price_item,
        district=district_defaults["district"],
        freshness_score=freshness_score,
        freshness_status=prediction,
        season=clean_season,
        supply_level=clean_supply,
        demand_index=clean_demand,
        middleman_count=clean_middleman,
        transport_cost=clean_transport,
    )

    return HybridResponse(
        item=freshness_result["item"],
        prediction=prediction,
        confidence=round(confidence, 4),
        freshness_score=freshness_score,
        district=district_defaults["district"],
        region_type=district_defaults["region_type"],
        distance_from_dambulla=district_defaults["distance"],
        wholesale_price=price_result["wholesale_price"],
        market_price=price_result["market_price"],
        varieties=price_result["varieties"],
        price_available=True,
    )


@router.get("/districts")
def list_districts(current_user: User = Depends(get_current_user)):
    """Return the list of supported Sri Lanka districts."""
    return {"districts": DISTRICT_NAMES}
