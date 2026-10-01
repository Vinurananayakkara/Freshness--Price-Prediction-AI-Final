from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from PIL import Image, UnidentifiedImageError

from app.api.auth import get_current_user
from app.db.models import User
from app.schemas.freshness_schema import FreshnessResponse
from app.services.freshness_service import predict_freshness

router = APIRouter()


def _freshness_score(prediction: str, confidence: float) -> float:
    if prediction == "Fresh":
        return round(confidence * 100, 1)
    return round((1.0 - confidence) * 100, 1)


@router.post("/predict-freshness", response_model=FreshnessResponse)
async def predict(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if file.content_type is None or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    try:
        image = Image.open(file.file)
        image.load()  # force-read now so a truncated/corrupt upload fails here, not mid-inference
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Could not read the uploaded file as an image.")

    result = predict_freshness(image)
    result["freshness_score"] = _freshness_score(result["prediction"], result["confidence"])
    return result
