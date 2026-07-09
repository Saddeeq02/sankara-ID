import os
import json
import re

staging_dir = "/home/fox/sankara_id/sankara/frontend/public/assets/products_staging"

def parse_txt_file(filepath):
    details = {}
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Try parsing patterns like "Name: Value"
    # Or "Specs: Value"
    # Or "Task: Value"
    # Or "Description: Value"
    
    patterns = {
        'name': r'(?:Name|Product Name|Title)\s*:\s*(.*)',
        'specs': r'(?:Specs|Specifications|Features)\s*:\s*(.*)',
        'task': r'(?:Task|Purpose|Application)\s*:\s*(.*)',
        'description': r'(?:Description|Details|Info)\s*:\s*(.*)'
    }
    
    # We can also split by blank lines or headers if the regex fails
    # Let's clean the content and search
    for key, regex in patterns.items():
        match = re.search(regex, content, re.IGNORECASE)
        if match:
            details[key] = match.group(1).strip()
            
    # If regex parsing failed, let's try line-by-line block parsing
    lines = content.split('\n')
    current_key = None
    current_val = []
    
    block_details = {}
    for line in lines:
        line_strip = line.strip()
        if not line_strip:
            continue
        
        # Check if line starts with key
        lower_line = line_strip.lower()
        found_header = False
        for k in ['name:', 'specs:', 'task:', 'description:', 'specifications:']:
            if lower_line.startswith(k):
                if current_key:
                    block_details[current_key] = " ".join(current_val).strip()
                current_key = 'specs' if k.startswith('spec') else k[:-1]
                current_val = [line_strip[len(k):].strip()]
                found_header = True
                break
        
        if not found_header:
            if current_key:
                current_val.append(line_strip)
            else:
                # No header yet, maybe first line is Name
                current_key = 'name'
                current_val = [line_strip]
                
    if current_key:
        block_details[current_key] = " ".join(current_val).strip()
        
    # Merge block details and regex details, preferring block details if they are longer/complete
    for k in ['name', 'specs', 'task', 'description']:
        val = block_details.get(k) or details.get(k)
        if val:
            # Clean up
            if k == 'specs':
                # split by commas or semi-colons
                if ',' in val:
                    specs_list = [s.strip() for s in val.split(',') if s.strip()]
                elif ';' in val:
                    specs_list = [s.strip() for s in val.split(';') if s.strip()]
                elif '.' in val:
                    specs_list = [s.strip() for s in val.split('.') if s.strip()]
                else:
                    specs_list = [val.strip()]
                # remove trailing period from specs
                specs_list = [s[:-1] if s.endswith('.') else s for s in specs_list]
                details[k] = specs_list
            else:
                details[k] = val
                
    return details

def main():
    products = []
    id_counter = 1
    
    # We walk the subdirectories of staging_dir
    categories_map = {
        'OTHER': 'Farm Implements',
        'combine harvestor': 'Farm Implements',
        'implements': 'Farm Implements',
        'spare parts': 'Spare Parts',
        'tractor': 'Tractors'
    }
    
    # Get directories in staging_dir
    for cat_folder in sorted(os.listdir(staging_dir)):
        cat_path = os.path.join(staging_dir, cat_folder)
        if not os.path.isdir(cat_path):
            continue
            
        category_name = categories_map.get(cat_folder, 'Farm Implements')
        
        # Traverse subdirectories (products)
        # Note: tractor might contain subdirectories representing brands or subcategories (e.g. LOVOL, MF)
        # Or individual products directly. Let's see:
        # tractor/LOVOL has files: info.txt, image files
        # tractor/MF has files: info.txt, image files
        # tractor/Zoomlion RC SERIES 1104 - 4WD has files: I.TXT, image files
        # Let's walk the directory and if a directory contains image/txt files directly, we treat it as a product!
        # Wait, how to know if it's a product? If it has files, or if it has child directories.
        # Let's inspect subfolders.
        
        def process_product_dir(prod_path, prod_rel_dir):
            nonlocal id_counter
            # Find all images
            img_files = []
            txt_files = []
            
            for item in os.listdir(prod_path):
                item_path = os.path.join(prod_path, item)
                if os.path.isfile(item_path):
                    ext = os.path.splitext(item)[1].lower()
                    if ext in ['.jpg', '.jpeg', '.png', '.webp']:
                        # Save path relative to public/
                        # We want it as "/assets/products_staging/... "
                        rel = f"/assets/products_staging/{prod_rel_dir}/{item}"
                        img_files.append(rel)
                    elif ext == '.txt':
                        txt_files.append(item_path)
            
            # If no images and no txt files, check if there are sub-directories
            if not img_files and not txt_files:
                return False
                
            # Parse txt file
            prod_name = os.path.basename(prod_path)
            specs = []
            task = ""
            desc = ""
            
            if txt_files:
                details = parse_txt_file(txt_files[0])
                if details.get('name'):
                    prod_name = details['name']
                if details.get('specs'):
                    specs = details['specs']
                if details.get('task'):
                    task = details['task']
                if details.get('description'):
                    desc = details['description']
            
            # Default specs/desc if empty
            if not specs:
                specs = ["Premium Quality Build", "High Performance Specs"]
            if not desc:
                desc = f"The {prod_name} is a high-reliability choice designed for modern agricultural operations."
            if not task:
                task = f"General agricultural operations and heavy-duty field support."
                
            # Default image if empty
            if not img_files:
                img_files = ["/assets/images/placeholder-product.jpg"]
                
            product = {
                "id": f"p-{id_counter}",
                "name": prod_name,
                "category": category_name,
                "price": "Price on Request",
                "image": img_files[0],
                "images": img_files,
                "specs": specs,
                "task": task,
                "description": desc,
                "status": "Active"
            }
            products.append(product)
            id_counter += 1
            return True

        # Let's scan
        for sub_folder in sorted(os.listdir(cat_path)):
            sub_path = os.path.join(cat_path, sub_folder)
            if not os.path.isdir(sub_path):
                continue
                
            # Check if this is a product directory (has images/txt)
            processed = process_product_dir(sub_path, f"{cat_folder}/{sub_folder}")
            if not processed:
                # It didn't have files directly. Maybe it has subdirectories (like tractor/LOVOL or tractor/MF)
                for sub_sub_folder in sorted(os.listdir(sub_path)):
                    sub_sub_path = os.path.join(sub_path, sub_sub_folder)
                    if os.path.isdir(sub_sub_path):
                        process_product_dir(sub_sub_path, f"{cat_folder}/{sub_folder}/{sub_sub_folder}")

    # Write to temp JSON file
    out_file = "/home/fox/sankara_id/scratch/parsed_products.json"
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2)
    print(f"Successfully parsed {len(products)} products and saved to {out_file}")

if __name__ == "__main__":
    main()
