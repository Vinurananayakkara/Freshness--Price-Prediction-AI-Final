"""
Bridges two independently-trained models that don't necessarily agree on
how an item is spelled: the freshness CNN's class labels (e.g. "apples",
"Fresh Apple", "freshapple") vs. the price XGBoost model's one-hot
"Item_<Name>" training columns (e.g. "Item_Apple").

THIS IS THE FIX for the "hybrid/inspector desk doesn't work for apples"
bug. The old code used a hardcoded dict (ITEM_NAME_MAP) that mapped the
freshness label straight to a price-model spelling it assumed was right
("apples" -> "Apple"). If the actual trained price model's column is
spelled differently (e.g. "Item_Apples", "Item_apple", "Item_Red_Apple")
that exact-match dict silently fails and predict_price_from_parts() 422s,
which the hybrid endpoint was swallowing into predicted_price = 0.0 -
so apples looked "broken" while other items happened to match by luck.

Fix: normalize both sides (lowercase, strip spaces/underscores, singular
form) and match the freshness label against whatever "Item_*" columns the
price model was ACTUALLY trained on, instead of trusting a hand-written
guess. This self-corrects regardless of the exact spelling used at
training time.
"""
import re
from typing import Iterable, Optional


def _normalize(name: str) -> str:
    n = name.strip().lower()
    n = re.sub(r"[\s_\-]+", "", n)
    if n.endswith("es") and not n.endswith("oes"):
        n = n[:-2]
    elif n.endswith("s") and not n.endswith("ss"):
        n = n[:-1]
    return n


def resolve_price_item(freshness_item: str, known_items: Iterable[str]) -> Optional[str]:
    """
    freshness_item: item name/label coming out of the freshness CNN
                     (e.g. "Apples", "Banana", "freshapple").
    known_items:    the exact item names the price model was trained on
                     (the values after "Item_" in model_columns.pkl).

    Returns the matching known_item (with its ORIGINAL casing/spelling,
    so it plugs straight into the price model's one-hot columns), or
    None if nothing matches.
    """
    target = _normalize(freshness_item)
    if not target:
        return None

    known_list = list(known_items)

    # 1. exact normalized match
    for candidate in known_list:
        if _normalize(candidate) == target:
            return candidate

    # 2. substring match either direction (handles "redapple" vs "apple", etc.)
    for candidate in known_list:
        norm_c = _normalize(candidate)
        if norm_c and (norm_c in target or target in norm_c):
            return candidate

    return None
