from PIL import Image
import torch
from transformers import CLIPModel, CLIPProcessor


MODEL_NAME = "openai/clip-vit-base-patch32"

device = "cuda" if torch.cuda.is_available() else "cpu"

processor = CLIPProcessor.from_pretrained(MODEL_NAME)
model = CLIPModel.from_pretrained(MODEL_NAME)
model.to(device)
model.eval()


SUPPORTED_LABELS = [
    "a photo of an apple",
    "a photo of a banana",
    "a photo of a cucumber",
    "a photo of okra",
    "a photo of an orange fruit",
    "a photo of a potato",
    "a photo of a tomato",
]

UNSUPPORTED_LABELS = [
    "a photo of a person",
    "a photo of a light bulb",
    "a photo of a mobile phone",
    "a photo of a laptop or computer",
    "a photo of a car or vehicle",
    "a photo of furniture",
    "a photo of a document or paper",
    "a photo of a building",
    "a photo of a landscape",
    "a photo of a household object",
    "a photo of an electronic device",
    "a photo of an object that is not fruit or vegetable",
]

ALL_LABELS = SUPPORTED_LABELS + UNSUPPORTED_LABELS


def validate_produce_image(image: Image.Image) -> dict:
    image = image.convert("RGB")

    inputs = processor(
        text=ALL_LABELS,
        images=image,
        return_tensors="pt",
        padding=True,
    )

    inputs = {
        key: value.to(device)
        for key, value in inputs.items()
    }

    with torch.no_grad():
        outputs = model(**inputs)

        probabilities = outputs.logits_per_image.softmax(
            dim=1
        )[0]

    best_index = int(
        torch.argmax(probabilities).item()
    )

    best_score = float(
        probabilities[best_index].item()
    )

    best_label = ALL_LABELS[best_index]

    supported = best_index < len(
        SUPPORTED_LABELS
    )

    return {
        "supported": supported,
        "label": best_label,
        "score": round(best_score, 4),
    }