from PIL import Image

from app.services.image_validator import (
    validate_produce_image,
)


IMAGE_PATH = "test_images/apple.jpeg"

image = Image.open(IMAGE_PATH)

result = validate_produce_image(image)

print(result)