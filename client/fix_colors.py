import re

with open('e:/Personal_Projects/devLink/client/src/components/FormattedMarkdown.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('text-sky-300', 'text-orange-300')
content = content.replace('text-sky-400', 'text-orange-400')
content = content.replace('text-sky-100', 'text-orange-100')
content = content.replace('bg-sky-400', 'bg-orange-400')

with open('e:/Personal_Projects/devLink/client/src/components/FormattedMarkdown.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
