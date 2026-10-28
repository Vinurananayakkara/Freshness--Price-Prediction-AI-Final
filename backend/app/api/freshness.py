from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from PIL import Image, UnidentifiedImageError

from app.api.auth import get_current_user
from app.db.models import User
from app.schemas.freshness_schema import FreshnessResponse
from app.services.freshness_service import predict_freshness
from app.services.image_validator import validate_produce_image


router = APIRouter()


def _freshness_score(prediction: str, confidence: float) -> float:
    if prediction == "Fresh":
        return round(confidence * 100, 1)

    return round((1.0 - confidence) * 100, 1)


@router.post(
    "/predict-freshness",
    response_model=FreshnessResponse,
)
async def predict(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    # 1. Check that the uploaded file is an image
    if (
        file.content_type is None
        or not file.content_type.startswith("image/")
    ):
        raise HTTPException(
            status_code=400,
            detail="Uploaded file must be an image.",
        )

    # 2. Read the image
    try:
        image = Image.open(file.file)
        image.load()
        image = image.convert("RGB")

    except (UnidentifiedImageError, OSError):
        raise HTTPException(
            status_code=400,
            detail="Could not read the uploaded file as an image.",
        )

    # 3. Check whether the image contains supported produce
    validation = validate_produce_image(image)

    if not validation["supported"]:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported Image — The uploaded image could not "
                "be identified as one of the supported produce "
                "categories. Please upload Apple, Banana, Cucumber, "
                "Okra, Orange, Potato, or Tomato."
            ),
        )

    # 4. Run the existing freshness model
    result = predict_freshness(image)

    # 5. Calculate freshness score
    result["freshness_score"] = _freshness_score(
        result["prediction"],
        result["confidence"],
    )

    return result