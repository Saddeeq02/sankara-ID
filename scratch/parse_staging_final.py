import os
import json
import re

staging_dir = "/home/fox/sankara_id/sankara/frontend/public/assets/products_staging"
output_json_path = "/home/fox/sankara_id/sankara/backend/products.json"
products_js_path = "/home/fox/sankara_id/sankara/frontend/src/screens/Products.js"
home_js_path = "/home/fox/sankara_id/sankara/frontend/src/screens/Home.js"

# Existing descriptions / specs for items without text files
existing_data = {
    "Alvan Blanch Disc Harrow": {
        "specs": ["Premium Alvan Blanch Steel Structure", "Multiple Heavy Discs", "Adjustable Working Angle", "Sealed Heavy-Duty Bearings"],
        "task": "High-quality secondary tillage, clod breaking, seedbed leveling, and active weed eradication.",
        "description": "Manufactured by Alvan Blanch, this disc harrow is an exceptional tool for secondary cultivation. Following a primary plow, it pulverizes large dirt clods into a fine, flat tilth. It is highly adjustable to ensure full surface coverage, making it ideal for final seedbed preparation."
    },
    "Disc Ridger": {
        "specs": ["Adjustable Gang Angle", "Durable Steel Discs", "Heavy-Duty Frame", "Variable Ridge Width Settings"],
        "task": "Creating uniform ridges and furrows for row crops, irrigation planning, and localized soil water management.",
        "description": "The Disc Ridger utilizes heavy rotating discs to gather loose soil into perfectly shaped ridges. It is highly adjustable, allowing operators to match row spacing requirements for crops such as potatoes, maize, and vegetables, while creating neat channels that optimize field drainage."
    },
    "Mould Board Plough": {
        "specs": ["Classic Mould Board Share Design", "High-Clearance Frame", "Deep Tillage Shares", "Reversible or Fixed Configurations"],
        "task": "Traditional deep tillage, complete soil inversion, burial of organic crop residue, and weed seed suppression.",
        "description": "The Mould Board Plough is the definitive tool for deep soil preparation. By cutting, lifting, and completely turning over the soil profile, it buries surface trash and weed seeds deep underground. This process enhances aeration, improves water infiltration, and establishes a clean, fertile seedbed."
    },
    "Mould Board Ridger": {
        "specs": ["Dual Mould Board Wings", "Deep Penetration Point", "Adjustable Wing Span", "High-Strength Steel Frame"],
        "task": "Forming deep, well-defined raised beds and clean furrows for crops requiring strict root drainage profiles.",
        "description": "The Mould Board Ridger uses symmetric wings to plow through soil, pushing equal amounts to both sides to form raised beds. It provides deep soil penetration, ensuring that the root zone of the crop remains loosely packed and highly aerated, which is ideal for root crop health."
    },
    "Offset Disc Plough": {
        "specs": ["Offset Frame Design", "High-Carbon Steel Discs", "Adjustable Cutting Depth", "Heavy-Duty Scrapers"],
        "task": "Primary tillage in hard, dry, and stony soils, breaking up hardpan layers and chopping weed root systems.",
        "description": "The Offset Disc Plough is designed to aggressively penetrate tough, uncultivated soils where traditional shares might break. The heavy, sharp discs spin freely to slash through crop residue and blend it into the topsoil. It features highly adjustable angles to accommodate changing ground hardness levels."
    },
    "Shrubmaster Rotary Slasher": {
        "specs": ["Heavy-Duty Rotary Cutting Blades", "Reinforced Steel Deck", "Adjustable Skid Shoes", "Friction Clutch Protection"],
        "task": "Heavy-duty clearing of tough field bushes, tall shrubs, overgrown vegetation, and pasture maintenance.",
        "description": "The Shrubmaster Rotary Slasher is engineered to clear wild, untamed fields and scrublands. Driven by the tractor's PTO, its heavy-duty blades rotate at high speeds to shred through thick brushwood and small saplings. It features built-in slip-clutch protection to safeguard the tractor's internal drive from sudden subterranean impacts."
    },
    "Tipping Trailer": {
        "specs": ["Heavy-Duty Steel Construction", "Hydraulic Tipping Mechanism", "Various Payload Capacities", "Multi-Leaf Spring Suspension"],
        "task": "Highly efficient transport and automated unloading of harvested crops, fertilizer bags, and loose farm materials.",
        "description": "This heavy-duty tipping trailer is built to handle the rigorous hauling needs of a busy farm. Operated directly by the tractor’s hydraulic system, its smooth tipping mechanism allows for rapid, effortless unloading of bulk materials. The reinforced steel box structure ensures long-term resistance to denting and heavy impacts."
    },
    "4 ROW CORN HARVESTER HEADER": {
        "name": "4-Row Corn Harvester Header",
        "specs": ["4-Row Harvesting Capacity", "High-Strength Steel Construction", "Compatible with Major Combine Harvesters", "Optimized Row Spacing"],
        "task": "Efficiently snapping and harvesting corn ears from stalks while minimizing grain damage and field loss.",
        "description": "This high-performance 4-Row Corn Harvester Header is engineered for seamless integration with combine harvesters. It cleanly separates corn ears from stalks, directing them into the feeder house while leaving chopped stalks on the field, maximizing efficiency during the harvest season."
    },
    "THRESHER": {
        "name": "Multi-Crop Thresher",
        "specs": ["High-Speed Threshing Cylinder", "Adjustable Blow Speed", "Interchangeable Screen Sieves", "Tractor PTO or Engine Powered"],
        "task": "Separating grains from harvested crops (maize, sorghum, rice, beans) rapidly and cleanly.",
        "description": "The Multi-Crop Thresher is a robust post-harvest machine designed to separate grain from chaff. Powered by a tractor PTO or an auxiliary engine, it processes harvested stalks, yielding clean, polished grain with minimal kernel damage, dramatically cutting down manual threshing labor."
    }
}

# Override for copy-pasted RC 1104
override_rc_1104 = {
    "name": "Zoomlion RC Series 1104 - 4WD Heavy-Duty Tractor",
    "specs": ["110 HP Engine", "4WD", "16 Forward Gears", "High-Pressure Common Rail Diesel Engine", "High Lifting Capacity Category II Hitch"],
    "task": "Intensive large-scale farming, deep tillage, heavy secondary cultivation, and continuous heavy machinery pulling.",
    "description": "The Zoomlion RC Series 1104 is a heavy-duty agricultural tractor designed to dominate demanding farm tasks. Featuring 16 forward speeds and an advanced 110 HP engine, it delivers high torque to pull wider implements and deep-subsoilers effortlessly. The advanced cabin ergonomics and technological control loops allow operators to remain productive during extended seasonal windows."
}

def parse_txt_file_robust(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read().strip()
    
    # Use offset-based keyword parsing
    keys = ['name:', 'specs:', 'specifications:', 'task:', 'description:']
    positions = []
    content_lower = content.lower()
    for key in keys:
        idx = content_lower.find(key)
        if idx != -1:
            positions.append((idx, key))
            
    positions.sort()
    
    details = {}
    for i, (idx, key) in enumerate(positions):
        start = idx + len(key)
        end = positions[i+1][0] if i + 1 < len(positions) else len(content)
        val = content[start:end].strip()
        
        norm_key = key.replace(':', '')
        if norm_key == 'specifications':
            norm_key = 'specs'
        details[norm_key] = val
        
    # Clean up specs list
    if 'specs' in details:
        val = details['specs']
        if isinstance(val, str):
            # Split by commas or semi-colons
            if ',' in val:
                specs_list = [s.strip() for s in val.split(',') if s.strip()]
            elif ';' in val:
                specs_list = [s.strip() for s in val.split(';') if s.strip()]
            else:
                specs_list = [val.strip()]
            # clean up trailing period or specs header leftover
            specs_list = [s[:-1] if s.endswith('.') else s for s in specs_list]
            details['specs'] = specs_list
            
    return details

def main():
    products = []
    id_counter = 1
    
    categories_map = {
        'OTHER': 'Specialized Equipment',
        'combine harvestor': 'Farm Implements',
        'implements': 'Farm Implements',
        'spare parts': 'Spare Parts',
        'tractor': 'Tractors'
    }
    
    for cat_folder in sorted(os.listdir(staging_dir)):
        cat_path = os.path.join(staging_dir, cat_folder)
        if not os.path.isdir(cat_path):
            continue
            
        category_name = categories_map.get(cat_folder, 'Farm Implements')
        
        # We need to process product directories inside
        def process_dir(prod_path, rel_dir):
            nonlocal id_counter
            img_files = []
            txt_files = []
            
            for item in sorted(os.listdir(prod_path)):
                item_path = os.path.join(prod_path, item)
                if os.path.isfile(item_path):
                    ext = os.path.splitext(item)[1].lower()
                    if ext in ['.jpg', '.jpeg', '.png', '.webp']:
                        rel = f"/assets/products_staging/{rel_dir}/{item}"
                        img_files.append(rel)
                    elif ext == '.txt':
                        txt_files.append(item_path)
            
            if not img_files and not txt_files:
                return False
                
            folder_name = os.path.basename(prod_path)
            
            # 1. Start with folder defaults/existing data
            prod_name = folder_name
            specs = []
            task = ""
            desc = ""
            
            if folder_name in existing_data:
                ed = existing_data[folder_name]
                prod_name = ed.get('name', folder_name)
                specs = ed.get('specs', [])
                task = ed.get('task', "")
                desc = ed.get('description', "")
            
            # 2. If txt file exists, parse it and overwrite
            if txt_files:
                details = parse_txt_file_robust(txt_files[0])
                if details.get('name'):
                    prod_name = details['name']
                if details.get('specs'):
                    specs = details['specs']
                if details.get('task'):
                    task = details['task']
                if details.get('description'):
                    desc = details['description']
            
            # 3. Check for specific overrides (like RC 1104)
            if "RC SERIES 1104" in folder_name.upper():
                prod_name = override_rc_1104['name']
                specs = override_rc_1104['specs']
                task = override_rc_1104['task']
                desc = override_rc_1104['description']
                
            # Clean up the name from any leftover byte-order mark or whitespace
            prod_name = prod_name.replace('\ufeff', '').strip()
            # If name starts with "Name:", strip it
            if prod_name.lower().startswith('name:'):
                prod_name = prod_name[5:].strip()
                
            if not specs:
                specs = ["Premium Quality Build", "High Performance Specs"]
            if not desc:
                desc = f"The {prod_name} is a high-reliability choice designed for modern agricultural operations."
            if not task:
                task = f"General agricultural operations and heavy-duty field support."
                
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
            
        # Scan subdirectories
        for sub_folder in sorted(os.listdir(cat_path)):
            sub_path = os.path.join(cat_path, sub_folder)
            if not os.path.isdir(sub_path):
                continue
                
            processed = process_dir(sub_path, f"{cat_folder}/{sub_folder}")
            if not processed:
                # Try nested subdirectories (like LOVOL, MF)
                for sub_sub_folder in sorted(os.listdir(sub_path)):
                    sub_sub_path = os.path.join(sub_path, sub_sub_folder)
                    if os.path.isdir(sub_sub_path):
                        process_dir(sub_sub_path, f"{cat_folder}/{sub_folder}/{sub_sub_folder}")

    # Write backend products.json
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2)
    print(f"Successfully generated backend {output_json_path}")
    
    # Now update frontend Products.js
    with open(products_js_path, 'r', encoding='utf-8') as f:
        js_content = f.read()
        
    start_pattern = "const fallbackProducts = ["
    start_idx = js_content.find(start_pattern)
    if start_idx != -1:
        bracket_count = 0
        end_idx = -1
        for idx in range(start_idx + len(start_pattern) - 1, len(js_content)):
            char = js_content[idx]
            if char == '[':
                bracket_count += 1
            elif char == ']':
                bracket_count -= 1
                if bracket_count == 0:
                    end_idx = idx
                    break
                    
        if end_idx != -1:
            products_js_str = json.dumps(products, indent=2)
            new_fallback_def = f"const fallbackProducts = {products_js_str}"
            new_js_content = js_content[:start_idx] + new_fallback_def + js_content[end_idx + 1:]
            with open(products_js_path, 'w', encoding='utf-8') as f:
                f.write(new_js_content)
            print(f"Successfully updated frontend {products_js_path}")

    # Now update frontend Home.js
    with open(home_js_path, 'r', encoding='utf-8') as f:
        home_content = f.read()
        
    start_idx = home_content.find("const fallbackProducts = [")
    if start_idx != -1:
        bracket_count = 0
        end_idx = -1
        for idx in range(start_idx + len("const fallbackProducts = [") - 1, len(home_content)):
            char = home_content[idx]
            if char == '[':
                bracket_count += 1
            elif char == ']':
                bracket_count -= 1
                if bracket_count == 0:
                    end_idx = idx
                    break
                    
        if end_idx != -1:
            products_js_str = json.dumps(products, indent=2)
            new_fallback_def = f"const fallbackProducts = {products_js_str}"
            new_home_content = home_content[:start_idx] + new_fallback_def + home_content[end_idx + 1:]
            with open(home_js_path, 'w', encoding='utf-8') as f:
                f.write(new_home_content)
            print(f"Successfully updated home screen {home_js_path}")

if __name__ == "__main__":
    main()
