import os
import re

standard_note = """## Agent Note
> [!IMPORTANT]
> Detaylı AI ajan kuralları ve proje mimari haritası için: `../../../.agents/PROJECT_REPORT.md` ve `../../../GEMINI.md` dosyalarını oku.
"""

base_dir = "/Users/serhat/IdeaProjects/secondHand/secondhand-frontend/src"

def update_readme(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # If it has Agent Note, replace it
    if "## Agent Note" in content:
        pattern = r"## Agent Note.*?(?=## [1-9]\)|## [1-9]\.|##  [1-9]|## [1-9]|### |## [A-Z]|$)"
        new_content, count = re.subn(pattern, standard_note + "\n", content, flags=re.DOTALL)
        if count > 0:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {path}")
    else:
        # Just prepend it after the title
        pattern = r"(# .*?\n)"
        new_content, count = re.subn(pattern, r"\1\n" + standard_note + "\n", content, count=1)
        if count > 0:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Added to {path}")

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file == "README.md":
            path = os.path.join(root, file)
            update_readme(path)
