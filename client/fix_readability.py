import os
import re

replacements = {
    r'font-light': 'font-normal',
    r'text-\[#a7a6a6\]': 'text-neutral-300',
    r'text-neutral-500': 'text-neutral-400',  # brighten up error messages / secondary text
    r'text-\[11px\]': 'text-xs',              # bump up tiny fonts
    r'text-\[#fdba74\]': 'text-orange-300',   # optional standard tailwind instead of hex
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for pattern, repl in replacements.items():
        content = re.sub(pattern, repl, content)
        
    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated text readability in {filepath}")

for root, dirs, files in os.walk('e:/Personal_Projects/devLink/client/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
