import os
import re

root_dir = '/Users/serhat/IdeaProjects/secondHand/secondhand-frontend/src'

replacements = [
    # Indigo & Blue & Purple & Pink -> Primary
    (r'\bbg-(blue|indigo|purple|pink)-[4-9]00\b', 'bg-primary'),
    (r'\bbg-(blue|indigo|purple|pink)-[1-3]00\b', 'bg-primary-50'),
    (r'\btext-(blue|indigo|purple|pink)-[5-9]00\b', 'text-primary'),
    (r'\btext-(blue|indigo|purple|pink)-[1-4]00\b', 'text-primary-50'),
    (r'\bhover:bg-(blue|indigo|purple|pink)-[4-9]00\b', 'hover:bg-primary-hover'),
    (r'\bhover:bg-(blue|indigo|purple|pink)-[1-3]00\b', 'hover:bg-primary-100'),
    (r'\bhover:text-(blue|indigo|purple|pink)-[5-9]00\b', 'hover:text-primary-hover'),
    (r'\bring-(blue|indigo|purple|pink)-[4-6]00\b', 'ring-primary'),
    (r'\bring-(blue|indigo|purple|pink)-[1-3]00\b', 'ring-primary-200'),
    (r'\bborder-(blue|indigo|purple|pink)-[4-9]00\b', 'border-primary'),
    (r'\bborder-(blue|indigo|purple|pink)-[1-3]00\b', 'border-primary-200'),

    # Green -> Success
    (r'\btext-green-[6-9]00\b', 'text-status-success-text'),
    (r'\btext-green-[4-5]00\b', 'text-status-success'),
    (r'\bbg-green-[1-2]00\b', 'bg-status-success-bg'),
    (r'\bbg-green-[3-6]00\b', 'bg-status-success'),
    (r'\bborder-green-[1-3]00\b', 'border-status-success-border'),
    (r'\bborder-green-[4-6]00\b', 'border-status-success'),
    (r'\bhover:text-green-[6-9]00\b', 'hover:text-status-success-text'),

    # Yellow & Orange -> Warning
    (r'\btext-(yellow|orange)-[4-8]00\b', 'text-status-warning-text'),
    (r'\bbg-(yellow|orange)-[1-2]00\b', 'bg-status-warning-bg'),
    (r'\bbg-(yellow|orange)-[3-6]00\b', 'bg-status-warning'),
    (r'\bborder-(yellow|orange)-[1-3]00\b', 'border-status-warning-border'),
    (r'\bborder-(yellow|orange)-[4-6]00\b', 'border-status-warning'),
    (r'\bhover:text-(yellow|orange)-[4-8]00\b', 'hover:text-status-warning-text'),

    # Red -> Error
    (r'\btext-red-[5-9]00\b', 'text-status-error-text'),
    (r'\btext-red-[2-4]00\b', 'text-status-error'),
    (r'\bbg-red-[1-2]00\b', 'bg-status-error-bg'),
    (r'\bbg-red-[3-6]00\b', 'bg-status-error'),
    (r'\bborder-red-[1-4]00\b', 'border-status-error-border'),
    (r'\bborder-red-[5-6]00\b', 'border-status-error'),
    (r'\bhover:text-red-[5-9]00\b', 'hover:text-status-error-text'),
    (r'\bhover:border-red-[1-3]00\b', 'hover:border-status-error-border'),
    (r'\bring-red-[4-6]00\b', 'ring-status-error'),
    (r'\bring-red-[1-3]00\b', 'ring-status-error-border'),
]

modified_files = 0
for dirpath, _, filenames in os.walk(root_dir):
    for filename in filenames:
        if filename.endswith(('.jsx', '.js')):
            filepath = os.path.join(dirpath, filename)
            with open(filepath, 'r') as f:
                content = f.read()
            
            original_content = content
            for pattern, replacement in replacements:
                content = re.sub(pattern, replacement, content)
            
            if content != original_content:
                with open(filepath, 'w') as f:
                    f.write(content)
                modified_files += 1

print(f"Successfully updated colors in {modified_files} files.")
