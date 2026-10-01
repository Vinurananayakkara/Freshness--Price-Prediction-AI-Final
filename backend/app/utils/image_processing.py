from PIL import Image
import numpy as np

# Model input size
IMG_SIZE = 224


def preprocess_image(
    image: Image.Image,
    target_size: tuple[int, int] | int = IMG_SIZE
) -> np.ndarray:

    if isinstance(target_size, int):
        h = w = target_size
    else:
        h, w = int(target_size[0]), int(target_size[1])

    # PIL.resize expects (width, height)
    img = image.convert("RGB").resize((w, h))

    # IMPORTANT:
    # Do NOT divide by 255 here.
    # Your saved EfficientNetB0 model performs preprocessing internally.
    arr = np.asarray(img, dtype=np.float32)

    # Add batch dimension:
    # (224, 224, 3) -> (1, 224, 224, 3)
    return np.expand_dims(arr, axis=0)