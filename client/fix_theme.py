import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Text replacements for Gemini
    content = content.replace("Gemini 1.5 Flash", "Gemini 3.6 Flash")
    content = content.replace("Gemini 1.5", "Gemini 3.6 Flash")
    content = content.replace("gemini-1.5", "gemini-3.6-flash")

    # Color replacements for #1c6cc1
    content = content.replace('bg-[#fdba74] text-black', 'bg-[#1c6cc1] text-white')
    content = content.replace('bg-[#fdba74]', 'bg-[#1c6cc1]')
    content = content.replace('hover:bg-[#fb923c]', 'hover:bg-[#155498]')
    
    content = content.replace('border-[#fdba74]/50', 'border-[#1c6cc1]/50')
    content = content.replace('ring-[#fdba74]/20', 'ring-[#1c6cc1]/20')
    
    content = content.replace('text-orange-300', 'text-[#1c6cc1]')
    content = content.replace('text-orange-400', 'text-[#1c6cc1]')
    content = content.replace('bg-orange-400', 'bg-[#1c6cc1]')
    content = content.replace('text-orange-200', 'text-[#1c6cc1]')
    
    # In FormattedMarkdown, we need some light contrast for code blocks
    content = content.replace('text-orange-100', 'text-sky-100')
    
    # For selection text
    content = content.replace('selection:bg-orange-300/30 selection:text-orange-200', 'selection:bg-[#1c6cc1]/30 selection:text-white')
    content = content.replace('selection:bg-[#1c6cc1]/30 selection:text-[#1c6cc1]', 'selection:bg-[#1c6cc1]/30 selection:text-white')

    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('e:/Personal_Projects/devLink/client/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
