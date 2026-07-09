import os
from PIL import Image
from rembg import remove

def main():
    slides_dir = '/home/fox/sankara_id/sankara/frontend/public/assets/hero_slides'
    if not os.path.exists(slides_dir):
        print(f"Directory not found: {slides_dir}")
        return

    files = os.listdir(slides_dir)
    for file in files:
        if file.lower().endswith(('.jpeg', '.jpg')):
            input_path = os.path.join(slides_dir, file)
            filename_without_ext = os.path.splitext(file)[0]
            output_path = os.path.join(slides_dir, f"{filename_without_ext}.png")
            
            print(f"Processing background removal for: {file} ...")
            try:
                input_image = Image.open(input_path)
                # Remove background using rembg
                output_image = remove(input_image)
                # Save as transparent PNG
                output_image.save(output_path, 'PNG')
                print(f"Successfully saved transparent image to: {output_path}")
                # Remove original JPEG file
                os.remove(input_path)
                print(f"Deleted original file: {input_path}")
            except Exception as e:
                print(f"Failed to process {file}: {e}")

if __name__ == '__main__':
    main()
