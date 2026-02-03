from PIL import Image
import os
import re

def fix_images():
    images_dir = "assets/images"
    if not os.path.exists(images_dir):
        print(f"Error: {images_dir} not found.")
        return

    # Pattern to find files with hyphens or uppercase letters (to be safe)
    # Android resources must be [a-z0-9_.]
    
    files = os.listdir(images_dir)
    for filename in files:
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            full_path = os.path.join(images_dir, filename)
            
            # 1. Determine new name (replace hyphens with underscores, lowercase everything)
            name_part, ext_part = os.path.splitext(filename)
            new_name = name_part.replace("-", "_").lower()
            # Ensure it starts with a letter (standard Android requirement)
            if not new_name[0].isalpha():
                new_name = "img_" + new_name
            
            new_filename = new_name + ".png" # We force everything to .png
            target_path = os.path.join(images_dir, new_filename)
            
            try:
                print(f"Processing: {filename} -> {new_filename}")
                with Image.open(full_path) as img:
                    # Convert to RGBA to ensure compatibility and remove potential metadata issues
                    img_converted = img.convert("RGBA")
                    img_converted.save(target_path, "PNG")
                
                # If the name changed or extension changed, we might want to delete the old one
                # BUT only if the target_path is different from full_path
                if os.path.abspath(full_path) != os.path.abspath(target_path):
                    os.remove(full_path)
                    print(f"  Deleted old file: {filename}")
                    
            except Exception as e:
                print(f"  Failed to process {filename}: {e}")

    print("\nImage processing complete.")

if __name__ == "__main__":
    fix_images()
