
import math

from fastapi import APIRouter, Depends, HTTPException

from app.api.auth import get_current_user
from app.db.models import User
from app.services.price_service import (
    KNOWN_ITEMS,
    predict_price_from_parts,
    resolve_item_for_price_model,
)

router = APIRouter()

DISPLAY_ITEMS = [
    "Apple",
    "Banana",
    "Cucumber",
    "Okra",
    "Orange",
    "Potato",
    "Tomato",
]


@router.get("/affordable")
def affordable_products(
    current_user: User = Depends(get_current_user),
):
    # The user must select a district in their profile first.
    if not current_user.district:
        raise HTTPException(
            status_code=422,
            detail=(
                "Please select your district in your profile "
                "before viewing affordable products."
            ),
        )

    products = []
    unavailable_items = []

    for display_item in DISPLAY_ITEMS:
        model_item = resolve_item_for_price_model(display_item)

        # Skip an item if it is not supported by the price model.
        if not model_item or model_item not in KNOWN_ITEMS:
            unavailable_items.append(display_item)
            continue

        try:
            estimate = predict_price_from_parts(
                item=model_item,
                district=current_user.district,
                freshness_score=100.0,
                freshness_status="Fresh",
                season="Maha",
                supply_level="Medium",
                demand_index="Medium",
                middleman_count=2,
                transport_cost=500.0,
            )

            market_price = float(estimate["market_price"])
            wholesale_price = float(estimate["wholesale_price"])

            if not (
                math.isfinite(market_price)
                and math.isfinite(wholesale_price)
            ):
                raise ValueError("Invalid price estimate")

            products.append({
                "item": display_item,
                "district": current_user.district,
                "market_price": round(market_price, 2),
                "wholesale_price": round(wholesale_price, 2),
                "currency": "LKR",
                "unit": "kg",
            })

        except HTTPException:
            raise
        except Exception:
            unavailable_items.append(display_item)

    # Display the most affordable product first.
    products.sort(key=lambda product: product["market_price"])

    if not products:
        raise HTTPException(
            status_code=503,
            detail=(
                "Price estimates are unavailable. "
                "Check the price model and supported item categories."
            ),
        )

    return {
        "district": current_user.district,
        "currency": "LKR",
        "unit": "kg",
        "price_note": (
            "Model-generated estimate; not a live market quotation."
        ),
        "products": products,
        "unavailable_items": unavailable_items,
    }
