import os
import re

standard_note = """## Agent Note
> [!IMPORTANT]
> Detaylı AI ajan kuralları ve proje mimari haritası için: `.agents/PROJECT_REPORT.md` ve `GEMINI.md` dosyalarını oku.
"""

base_dir = "/Users/serhat/IdeaProjects/secondHand/src/main/java/com/serhat/secondhand"
skip_dirs = ['ai', 'chat']

def update_readme(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Define regex pattern to replace everything from "## Agent Note" up to the next heading "## 1" or similar
    pattern = r"## Agent Note.*?(?=## [1-9]\)|## [1-9]\.|##  [1-9]|## [1-9]|### |## [A-Z]|$)"
    
    new_content, count = re.subn(pattern, standard_note + "\n", content, flags=re.DOTALL)
    
    # Also remove "## 11) AI Ajanlari Icin Hizli Protokol" and "## 12) Degisiklik Oncesi/Sonrasi Checklist" if they exist
    new_content = re.sub(r'## 11\).*', '', new_content, flags=re.DOTALL)
    
    if count > 0:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {path}")
    else:
        print(f"No match found in {path}")

for root, dirs, files in os.walk(base_dir):
    path_parts = root.split(os.sep)
    if any(skip in path_parts for skip in skip_dirs):
        continue
    for file in files:
        if file == "README.md":
            path = os.path.join(root, file)
            update_readme(path)
