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
                
                # Replace mint greens with light blues/whites for better contrast on red backgrounds
                content = content.replace("#a7f3d0", "#bfdbfe")
                content = content.replace("#d1fae5", "#eff6ff")
                
                # Replace the stats card number color gradient from dark red to bright white/red gradient
                content = content.replace(
                    "background: linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%);",
                    "background: linear-gradient(135deg, #ffffff 0%, #fca5a5 100%);"
                )
                
                if content != orig_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Applied stats polish to: {filepath}")

if __name__ == "__main__":
    main()
