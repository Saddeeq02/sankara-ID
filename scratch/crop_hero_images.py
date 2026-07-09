import os
from PIL import Image

def main():
    slides_dir = '/home/fox/sankara_id/sankara/frontend/public/assets/hero_slides'
    if not os.path.exists(slides_dir):
        print(f"Directory not found: {slides_dir}")
        return

    files = os.listdir(slides_dir)
    for file in files:
        if file.lower().endswith('.png'):
            path = os.path.join(slides_dir, file)
            print(f"Cropping transparent margins for: {file} ...")
            try:
                img = Image.open(path)
                # getbbox returns the bounding box of non-zero intensity pixels
                bbox = img.getbbox()
                if bbox:
                    cropped_img = img.crop(bbox)
                    cropped_img.save(path, 'PNG')
                    print(f"Successfully cropped and saved: {file}")
                else:
                    print(f"No bounding box found (empty image?): {file}")
            except Exception as e:
                print(f"Failed to crop {file}: {e}")

if __name__ == '__main__':
    main()
