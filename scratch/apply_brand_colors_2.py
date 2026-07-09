import os
import re

src_dir = "/home/fox/sankara_id/sankara/frontend/src"

def main():
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.js', '.css', '.html')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                orig_content = content
                
                # 1. Clean up remaining green codes (#022c22 and #064e3b)
                content = content.replace("#022c22", "#030712")
                content = content.replace("#064e3b", "#7f1d1d")
                
                # 2. Fix the specific white and blue buttons text color issues
                content = content.replace('color: #022c22;', 'color: #ffffff;')
                content = content.replace('color: #022c22', 'color: #ffffff')
                
                # 3. Clean up green shadow/overlay colors rgba(2, 44, 34, ...)
                content = re.sub(r"rgba\(2,\s*44,\s*34,\s*0\.75\)", "rgba(3, 7, 18, 0.85)", content)
                content = re.sub(r"rgba\(2,\s*44,\s*34,\s*0\.65\)", "rgba(3, 7, 18, 0.75)", content)
                content = re.sub(r"rgba\(2,\s*44,\s*34,\s*0\.85\)", "rgba(3, 7, 18, 0.85)", content)
                content = re.sub(r"rgba\(2,\s*44,\s*34,\s*0\.7\)", "rgba(3, 7, 18, 0.8)", content)
                content = re.sub(r"rgba\(2,\s*44,\s*34,\s*0\)", "rgba(3, 7, 18, 0)", content)
                content = re.sub(r"rgba\(2,\s*44,\s*34,\s*([\d\.]+)\)", r"rgba(0, 0, 0, \1)", content)
                
                # 4. Make Red the dominant color in gradients
                content = content.replace("linear-gradient(135deg, #dc2626 0%, #3b82f6 100%)", "linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)")
                content = content.replace("linear-gradient(135deg, #3b82f6 0%, #dc2626 100%)", "linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)")
                content = content.replace("linear-gradient(90deg, #dc2626, #3b82f6)", "linear-gradient(90deg, #dc2626, #7f1d1d)")
                content = content.replace("linear-gradient(90deg, #3b82f6, #dc2626)", "linear-gradient(90deg, #dc2626, #7f1d1d)")
                content = content.replace("linear-gradient(180deg, #dc2626 0%, #3b82f6 80%, transparent 100%)", "linear-gradient(180deg, #dc2626 0%, #7f1d1d 80%, transparent 100%)")
                
                if content != orig_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Applied final red-dominance updates to: {filepath}")

if __name__ == "__main__":
    main()
