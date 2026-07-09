import os
import json

staging_dir = "/home/fox/sankara_id/sankara/frontend/public/assets/products_staging"

def parse_staging():
    data = {}
    for root, dirs, files in os.walk(staging_dir):
        rel_path = os.path.relpath(root, staging_dir)
        if rel_path == ".":
            continue
        parts = rel_path.split(os.sep)
        
        # We want to identify categories and product names
        # Categories: OTHER, combine harvestor, implements, spare parts, tractor
        category = parts[0]
        
        # If parts has length >= 2, we are in a product folder
        # e.g., implements/Alvan Blanch Disc Harrow
        # Or tractor/LOVOL (wait, Lovol might be a brand or a product)
        # Let's see: parts can be ['tractor', 'LOVOL'] -> is LOVOL a product or a brand containing products?
        # Let's print out all files and directories first to understand the structure.
        print(f"PATH: {rel_path}")
        for f in files:
            file_path = os.path.join(root, f)
            print(f"  FILE: {f} (size: {os.path.getsize(file_path)} bytes)")
            if f.lower().endswith('.txt'):
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as fh:
                        content = fh.read()
                        print("    CONTENT:")
                        print(content)
                except Exception as e:
                    print(f"    ERROR READING FILE: {e}")

if __name__ == "__main__":
    parse_staging()
