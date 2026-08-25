import os
import re

replacements = {
    r'bg-\[#050505\]': 'bg-background',
    r'bg-\[#0c0c0e\]': 'bg-card',
    r'bg-\[#0e0e11\]': 'bg-card',
    r'bg-\[#141414\]': 'bg-card',
    r'bg-\[#121215\]': 'bg-card',
    r'bg-\[#18181b\]': 'bg-muted',
    r'bg-\[#1a1a1a\]': 'bg-muted',
    r'bg-\[#1e1e1e\]': 'bg-muted',
    r'bg-\[#27272a\]': 'bg-secondary',
    r'bg-\[#262626\]': 'bg-secondary',
    r'text-\[#fafafa\]': 'text-foreground',
    r'text-\[#e5e5e5\]': 'text-foreground',
    r'text-white': 'text-foreground',
    r'text-\[#a7a6a6\]': 'text-muted-foreground',
    r'text-\[#a1a1aa\]': 'text-muted-foreground',
    r'text-\[#71717a\]': 'text-muted-foreground',
    r'text-neutral-500': 'text-muted-foreground',
    r'text-neutral-400': 'text-muted-foreground',
    r'text-neutral-300': 'text-secondary-foreground',
    r'text-neutral-200': 'text-secondary-foreground',
    r'border-white/20': 'border-border',
    r'border-white/10': 'border-border',
    r'border-white/5': 'border-border',
    r'border-\[#1a1a1a\]': 'border-border',
    r'border-\[#262626\]': 'border-border',
    r'border-\[#2a2a2a\]': 'border-border',
    r'text-\[#050505\]': 'text-background',
    r'text-black': 'text-background',
    r'bg-white': 'bg-foreground',
    r'bg-white/5': 'bg-foreground/5',
    r'bg-white/10': 'bg-foreground/10',
    r'bg-white/20': 'bg-foreground/20',
    r'bg-black/60': 'bg-background/80',
    r'text-green-400': 'text-emerald-500',
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
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('e:/Personal_Projects/devLink/client/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
