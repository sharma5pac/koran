
from PIL import Image
import os

def make_square(image_path, output_path, size=1024, fill_color=(0, 0, 0, 0)):
    try:
        if not os.path.exists(image_path):
            print(f"Error: {image_path} does not exist.")
            return

        original_image = Image.open(image_path)
        print(f"Original size: {original_image.size}")

        # Create a new square image
        new_image = Image.new("RGBA", (size, size), fill_color)
        
        # Calculate position to center the original image
        width, height = original_image.size
        
        # specific logic for this logo: it's wide (1024x571), so we center it vertically
        # if it was tall, we'd center strictly.
        # But let's do generic centering to be safe.
        
        # Resize if logic requires it (e.g. if original is larger than target)
        # Here original width is 1024, so it fits perfectly in width.
        
        left = (size - width) // 2
        top = (size - height) // 2
        
        new_image.paste(original_image, (left, top))
        
        new_image.save(output_path)
        print(f"Saved square image to {output_path}")
        print(f"New size: {new_image.size}")
        
    except Exception as e:
        print(f"Failed to resize image: {e}")

if __name__ == "__main__":
    input_file = "./assets/images/nur_quran_logo.png"
    output_file = "./assets/images/nur_quran_logo_square.png"
    # Using the background color from app.json splash: #0F172A to make it look seamless if needed, 
    # but transparent (0,0,0,0) is usually safer for generic icons. 
    # Let's stick to transparent as it's an icon resource.
    make_square(input_file, output_file)
