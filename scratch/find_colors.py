import os
import re
from collections import defaultdict

root_dir = '/Users/serhat/IdeaProjects/secondHand/secondhand-frontend/src'

pattern = re.compile(r'(text|bg|border|ring|hover:text|hover:bg|hover:border)-(green|yellow|blue|orange|red|purple|pink|indigo)-([1-9]00)')

matches = defaultdict(list)

for dirpath, _, filenames in os.walk(root_dir):
    for filename in filenames:
        if filename.endswith(('.jsx', '.js')):
            filepath = os.path.join(dirpath, filename)
            with open(filepath, 'r') as f:
                try:
                    content = f.read()
                    for match in pattern.finditer(content):
                        color_class = match.group(0)
                        matches[color_class].append(filepath)
                except Exception as e:
                    pass

for color_class in sorted(matches.keys()):
    files = set(matches[color_class])
    print(f"{color_class}: {len(matches[color_class])} occurrences in {len(files)} files")
