import os

src_dir = "/home/fox/sankara_id/sankara/frontend/src"

def main():
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.js', '.css', '.html')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                orig_content = content
                
                # Replace remaining dark green hexes & gradients
                content = content.replace("#023c2d", "#7f1d1d")
                content = content.replace("#011c15", "#030712")
                content = content.replace("rgba(2, 28, 21, 0.95)", "rgba(11, 15, 25, 0.95)")
                
                if content != orig_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Applied final branding polish to: {filepath}")

if __name__ == "__main__":
    main()
