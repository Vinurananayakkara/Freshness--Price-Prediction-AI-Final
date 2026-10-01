import os
from datetime import datetime

import joblib
import pandas as pd
import xgboost as xgb
from fastapi import HTTPException

from app.schemas.price_schema import PriceRequest
from app.utils.district_data import get_district_defaults, DISTRICT_NAMES
from app.utils.item_matching import resolve_price_item
from app.utils.variety_data import get_variety_breakdown

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

WHOLESALE_MODEL_PATH = os.path.join(BASE_DIR, "app", "models", "price_prediction_model_wholesale.json")
MARKET_MODEL_PATH = os.path.join(BASE_DIR, "app", "models", "price_prediction_model_market.json")
COLUMN_PATH = os.path.join(BASE_DIR, "app", "models", "model_columns.pkl")

wholesale_model = xgb.XGBRegressor(enable_categorical=True)
wholesale_model.load_model(WHOLESALE_MODEL_PATH)

market_model = xgb.XGBRegressor(enable_categorical=True)
market_model.load_model(MARKET_MODEL_PATH)

model_columns = joblib.load(COLUMN_PATH)


def _values_for_prefix(prefix: str) -> list[str]:
    return sorted(
        c[len(prefix) + 1:] for c in model_columns if c.startswith(prefix + "_")
    )


KNOWN_ITEMS = _values_for_prefix("Item")
KNOWN_REGION_TYPES = _values_for_prefix("Region_Type")
KNOWN_SEASONS = _values_for_prefix("Season")
KNOWN_DISTRICTS = _values_for_prefix("District")

if not KNOWN_ITEMS:
    import warnings
    warnings.warn(
        f"No 'Item_*' one-hot columns found in model_columns.pkl. "
        f"Columns present: {list(model_columns)[:20]}. "
        "Hybrid pricing will report price_available=False for every item.",
        stacklevel=2,
    )

# ---------------------------------------------------------------------------
# Reference tables matching the training generator EXACTLY. If any of these
# drift out of sync with the training script, predictions silently drift
# back toward out-of-distribution inputs -- keep them identical on both
# sides whenever the model gets retrained.
# ---------------------------------------------------------------------------

IMPORTED_ITEMS = {"Apple", "Orange"}

# Extend with new years as they come; falls back to the latest known year
# below rather than raising, since a live server outlives its training data.
FUEL_INDEX = {2020: 1.00, 2021: 1.05, 2022: 1.55, 2023: 1.42, 2024: 1.30,
              2025: 1.32, 2026: 1.35}
INFLATION_INDEX = {2020: 1.00, 2021: 1.06, 2022: 1.18, 2023: 1.22, 2024: 1.26,
                    2025: 1.28, 2026: 1.30}

TOURISM_LEVEL = {
    "Colombo": "High", "Kandy": "High", "Galle": "High", "Nuwara Eliya": "High",
    "Anuradhapura": "High", "Polonnaruwa": "High", "Trincomalee": "High",
    "Gampaha": "Medium", "Kalutara": "Medium", "Matara": "Medium",
    "Kurunegala": "Medium", "Badulla": "Medium", "Puttalam": "Medium",
    "Batticaloa": "Medium", "Jaffna": "Medium", "Ratnapura": "Medium",
    "Hambantota": "Low", "Matale": "Low", "Kegalle": "Low", "Ampara": "Low",
    "Mannar": "Low", "Kilinochchi": "Low", "Mullaitivu": "Low",
    "Vavuniya": "Low", "Monaragala": "Low",
}
TOURISM_MULTIPLIER = {"Low": 0.8, "Medium": 1.0, "High": 1.2}

# The app can only ever offer Low/Medium/High to the user (see price_schema
# and the frontend dropdowns), but the model was trained on continuous
# scores. These are representative values from the SAME distributions the
# training generator produced -- not 1/2/3, which sits entirely outside the
# range the model ever saw during training.
SUPPLY_LEVEL_SCORE = {"Low": 40.0, "Medium": 62.5, "High": 85.0}
DEMAND_LEVEL_SCORE = {"Low": 67.0, "Medium": 82.5, "High": 102.0}

FIXED_PUBLIC_HOLIDAYS = {
    (1, 1), (2, 4), (4, 13), (4, 14), (5, 1), (5, 22), (12, 25),
}


def _get_festival(date: datetime) -> str:
    if date.month == 4:
        return "NewYear"
    elif date.month == 12:
        return "Christmas"
    else:
        return "None"


def _is_public_holiday(date: datetime) -> int:
    return 1 if (date.month, date.day) in FIXED_PUBLIC_HOLIDAYS else 0


def _is_school_holiday(date: datetime) -> int:
    month, day = date.month, date.day
    if month == 4:
        return 1
    if month == 8:
        return 1
    if month == 12 and day >= 15:
        return 1
    if month == 1 and day <= 2:
        return 1
    return 0


def _get_crop_damage_pct(rainfall: float, is_imported: bool) -> float:
    """Mirrors the training generator's get_crop_damage() exactly."""
    effective_rainfall = rainfall * 0.1 if is_imported else rainfall
    if effective_rainfall > 300:
        damage = 35.0
    elif effective_rainfall > 250:
        damage = 20.0
    elif effective_rainfall < 40:
        damage = 10.0
    else:
        damage = 0.0
    if is_imported:
        damage *= 0.2
    return damage


def _set_one_hot(input_df: pd.DataFrame, prefix: str, value: str, field_name: str) -> None:
    col = f"{prefix}_{value}"
    if col not in input_df.columns:
        known = sorted(
            c[len(prefix) + 1:] for c in input_df.columns if c.startswith(prefix + "_")
        )
        raise HTTPException(
            status_code=422,
            detail=f"Unknown {field_name} '{value}'. Expected one of: {known}",
        )
    input_df[col] = 1


def predict_price(data: PriceRequest):
    input_df = pd.DataFrame([[0] * len(model_columns)], columns=model_columns)

    now = datetime.now()
    is_imported = data.item in IMPORTED_ITEMS

    # --- Temporal features ---
    if "Year" in input_df.columns:
        input_df["Year"] = now.year
    if "Month" in input_df.columns:
        input_df["Month"] = now.month

    day_col = f"Day_{now.strftime('%A')}"
    if day_col in input_df.columns:
        input_df[day_col] = 1

    festival = _get_festival(now)
    festival_col = f"Festival_{festival}"
    if festival_col in input_df.columns:
        input_df[festival_col] = 1

    if "Public_Holiday" in input_df.columns:
        input_df["Public_Holiday"] = _is_public_holiday(now)
    if "School_Holiday" in input_df.columns:
        input_df["School_Holiday"] = _is_school_holiday(now)

    # --- Item / import status ---
    if "Is_Imported" in input_df.columns:
        input_df["Is_Imported"] = 1 if is_imported else 0

    # --- Macro indices, looked up by year (falls back to the latest known
    #     year rather than KeyError-ing on a year past the lookup table) ---
    if "Fuel_Index" in input_df.columns:
        input_df["Fuel_Index"] = FUEL_INDEX.get(now.year, FUEL_INDEX[max(FUEL_INDEX)])
    if "Inflation_Index" in input_df.columns:
        input_df["Inflation_Index"] = INFLATION_INDEX.get(now.year, INFLATION_INDEX[max(INFLATION_INDEX)])

    # --- District-driven tourism ---
    tourism_level = TOURISM_LEVEL.get(data.district, "Medium") if data.district else "Medium"
    if "Tourism_Index" in input_df.columns:
        input_df["Tourism_Index"] = TOURISM_MULTIPLIER[tourism_level]

    # --- Harvest / crop damage (best available proxy without a live
    #     harvest-condition input from the user) ---
    if "Harvest_Index" in input_df.columns:
        input_df["Harvest_Index"] = 80.0 if is_imported else 62.5
    if "Crop_Damage_Pct" in input_df.columns:
        input_df["Crop_Damage_Pct"] = _get_crop_damage_pct(data.rainfall, is_imported)

    # --- Numerical features the frontend actually collects ---
    input_df["Rainfall"] = data.rainfall
    input_df["Temperature"] = data.temperature
    input_df["Humidity"] = data.humidity
    input_df["Distance_From_Dambulla"] = data.distance_from_dambulla
    input_df["Middleman_Count"] = data.middleman_count
    input_df["Transport_Cost"] = data.transport_cost

    # --- Freshness features (optional -- from hybrid flow) ---
    if data.freshness_score is not None and "Freshness_Score" in input_df.columns:
        input_df["Freshness_Score"] = data.freshness_score
    if data.freshness_status is not None and "Freshness_Status_Rotten" in input_df.columns:
        input_df["Freshness_Status_Rotten"] = 1 if data.freshness_status.lower() == "rotten" else 0

    # --- Categorical features (validated against known training columns) ---
    _set_one_hot(input_df, "Item", data.item, "item")
    _set_one_hot(input_df, "Region_Type", data.region_type, "region_type")
    _set_one_hot(input_df, "Season", data.season, "season")

    # --- Supply / Demand: continuous scores matching the training
    #     distribution, NOT the raw 1/2/3 ordinal used previously ---
    input_df["Supply_Level"] = SUPPLY_LEVEL_SCORE.get(data.supply_level, 62.5)
    input_df["Demand_Index"] = DEMAND_LEVEL_SCORE.get(data.demand_index, 82.5)

    # --- District one-hot (optional) ---
    if data.district and any(c.startswith("District_") for c in input_df.columns):
        col = f"District_{data.district}"
        if col in input_df.columns:
            input_df[col] = 1
        elif data.district not in DISTRICT_NAMES:
            _set_one_hot(input_df, "District", data.district, "district")

    prediction_wholesale = float(wholesale_model.predict(input_df)[0])
    prediction_market = float(market_model.predict(input_df)[0])

    wholesale_price = round(prediction_wholesale, 2)
    market_price = round(prediction_market, 2)

    return {
        "wholesale_price": wholesale_price,
        "market_price": market_price,
        "varieties": get_variety_breakdown(data.item, wholesale_price, market_price),
    }


def resolve_item_for_price_model(freshness_item_label: str) -> str | None:
    return resolve_price_item(freshness_item_label, KNOWN_ITEMS)


def predict_price_from_parts(
    item: str,
    district: str,
    freshness_score: float,
    freshness_status: str,
    season: str = "Maha",
    supply_level: str = "Medium",
    demand_index: str = "Medium",
    middleman_count: int = 2,
    transport_cost: float = 500.0,
) -> dict:
    """
    Internal helper called by the hybrid endpoint. Auto-fills district
    weather/distance defaults. Returns {wholesale_price, market_price,
    varieties} -- see predict_price() for the shape.
    """
    try:
        defaults = get_district_defaults(district)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    region_type_value = defaults["region_type"]
    if region_type_value not in KNOWN_REGION_TYPES:
        region_type_value = KNOWN_REGION_TYPES[0] if KNOWN_REGION_TYPES else region_type_value

    season_value = season if season in KNOWN_SEASONS else (KNOWN_SEASONS[0] if KNOWN_SEASONS else season)

    data = PriceRequest(
        item=item,
        region_type=region_type_value,
        season=season_value,
        rainfall=defaults["rainfall"],
        temperature=defaults["temperature"],
        humidity=defaults["humidity"],
        supply_level=supply_level,
        demand_index=demand_index,
        distance_from_dambulla=defaults["distance"],
        middleman_count=middleman_count,
        transport_cost=transport_cost,
        district=defaults["district"],
        freshness_score=freshness_score,
        freshness_status=freshness_status,
    )

    return predict_price(data)
