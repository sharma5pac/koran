
import os
from PIL import Image

image_dir = './assets/images'
print(f"Checking images in {image_dir}")

for filename in os.listdir(image_dir):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        try:
            path = os.path.join(image_dir, filename)
            with Image.open(path) as img:
                print(f"{filename}: {img.size} ({img.mode})")
        except Exception as e:
            print(f"Error reading {filename}: {e}")
