import os
import re

def strip_comments(content, ext):
    original = content
    
    if ext in ['.css']:
        # Don't touch CSS, it has tailwind directives
        return content

    # JSX Comments {/* ... */}
    def jsx_replacer(match):
        s = match.group(0)
        if 'eslint' in s.lower(): return s
        return ''
    content = re.sub(r'\{\s*/\*[\s\S]*?\*/\s*\}', jsx_replacer, content)
    
    # Block comments /* ... */
    def block_replacer(match):
        s = match.group(0)
        if 'eslint' in s.lower() or 'tailwind' in s.lower() or '@ts-' in s: return s
        return ''
    content = re.sub(r'/\*[\s\S]*?\*/', block_replacer, content)
    
    # Single line comments //...
    # Must not match http:// or https:// -> use negative lookbehind for :
    # Also ignore inside strings? Regex can't easily parse strings, but negative lookbehind for : handles 99% of URLs.
    def line_replacer(match):
        s = match.group(0)
        if 'eslint' in s.lower() or '@ts-' in s: return s
        return ''
    content = re.sub(r'(?<!:)//.*', line_replacer, content)
    
    # Empty lines collapse
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    
    return content

changed_files = 0
for root, dirs, files in os.walk('e:/Personal_Projects/devLink/client/src'):
    for file in files:
        ext = os.path.splitext(file)[1]
        if ext in ['.ts', '.tsx', '.js', '.jsx']:
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = strip_comments(content, ext)
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                changed_files += 1

print(f"Removed comments from {changed_files} files.")
