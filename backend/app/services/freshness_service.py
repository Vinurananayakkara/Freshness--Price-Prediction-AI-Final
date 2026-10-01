import os
import pickle
import re

import numpy as np
import tensorflow as tf
from fastapi import HTTPException

from app.utils.image_processing import preprocess_image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

MODEL_PATH = os.path.join(BASE_DIR, "app", "models", "freshness_model.keras")
CLASS_PATH = os.path.join(BASE_DIR, "app", "models", "class_indices.pkl")

model = tf.keras.models.load_model(MODEL_PATH)

with open(CLASS_PATH, "rb") as f:
    class_data = pickle.load(f)

# Support two pkl formats:
# 1. {"index_to_class": {0: "freshapple", ...}}  ← nested dict
# 2. {0: "freshapple", ...}                       ← plain int-keyed dict
if isinstance(class_data, dict) and "index_to_class" in class_data:
    labels = class_data["index_to_class"]
else:
    labels = class_data


def _split_label(class_name: str) -> tuple[str, str]:
    """
    Splits a class label like "freshapples", "Fresh Apple", "rotten_banana"
    into (freshness, item). Tolerant of extra spaces/underscores/casing so
    a training-data naming quirk for one class (e.g. only "apples" having
    a stray space) doesn't silently break just that item downstream.
    """
    cleaned = re.sub(r"[\s_\-]+", " ", class_name).strip()
    lowered = cleaned.lower()

    if lowered.startswith("fresh"):
        freshness = "Fresh"
        item = cleaned[len("fresh"):]
    elif lowered.startswith("rotten"):
        freshness = "Rotten"
        item = cleaned[len("rotten"):]
    else:
        freshness = "Unknown"
        item = cleaned

    item = item.strip().strip("_- ").capitalize()
    return freshness, item


# Determine model's expected input resolution dynamically
try:
    if model.input_shape and len(model.input_shape) >= 3 and model.input_shape[1] is not None:
        MODEL_TARGET_SIZE = (int(model.input_shape[1]), int(model.input_shape[2]))
    else:
        MODEL_TARGET_SIZE = (224, 224)
except Exception:
    MODEL_TARGET_SIZE = (224, 224)


def predict_freshness(image):
    try:
        img = preprocess_image(image, target_size=MODEL_TARGET_SIZE)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not process the uploaded file as an image: {exc}")

    try:
        prediction = model.predict(img, verbose=0)
    except Exception as exc:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Freshness model failed to run inference: {exc}")

    class_id = int(np.argmax(prediction))
    confidence = float(prediction[0][class_id])
    class_name = labels[class_id]  # e.g. "freshapples", "rottenbanana"

    freshness, item = _split_label(class_name)

    return {
        "prediction": freshness,
        "item": item,
        "confidence": round(confidence, 4),
        "raw_label": class_name,
    }
