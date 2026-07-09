import os
import re

src_dir = "/home/fox/sankara_id/sankara/frontend/src"

replacements = [
    # RGBA strings
    (r"rgba\(16,\s*185,\s*129,\s*([\d\.]+)\)", r"rgba(220, 38, 38, \1)"),
    (r"rgba\(52,\s*211,\s*153,\s*([\d\.]+)\)", r"rgba(59, 130, 246, \1)"),
    (r"rgba\(2,\s*26,\s*21,\s*([\d\.]+)\)", r"rgba(11, 15, 25, \1)"),
    (r"rgba\(5,\s*150,\s*105,\s*([\d\.]+)\)", r"rgba(153, 27, 27, \1)"),
    
    # Hex codes (case insensitive)
    (r"(?i)#10b981", "#dc2626"), # primary red
    (r"(?i)#34d399", "#3b82f6"), # secondary blue
    (r"(?i)#059669", "#991b1b"), # dark red
    (r"(?i)#021a15", "#0b0f19"), # surface dark card
    (r"(?i)#010d0a", "#030712"), # background black/navy
    (r"(?i)#020f0c", "#030712"), # secondary background black/navy
]

def main():
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.js', '.css', '.html')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                orig_content = content
                for pattern, repl in replacements:
                    content = re.sub(pattern, repl, content)
                
                if content != orig_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Applied brand colors to: {filepath}")

if __name__ == "__main__":
    main()
