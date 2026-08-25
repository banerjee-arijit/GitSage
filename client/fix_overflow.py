with open('e:/Personal_Projects/devLink/client/src/components/FormattedMarkdown.tsx', 'r', encoding='utf-8') as f:
    fm = f.read()

# Fix overflow by adding break-words
fm = fm.replace('className="space-y-3 text-sm leading-relaxed text-neutral-200"',
                'className="space-y-3 text-sm leading-relaxed text-neutral-200 break-words w-full overflow-hidden"')

fm = fm.replace('className="px-1.5 py-0.5 rounded bg-white/10 text-sky-300 font-mono text-xs border border-white/10"',
                'className="px-1.5 py-0.5 rounded bg-white/10 text-sky-300 font-mono text-xs border border-white/10 break-all"')

with open('e:/Personal_Projects/devLink/client/src/components/FormattedMarkdown.tsx', 'w', encoding='utf-8') as f:
    f.write(fm)

with open('e:/Personal_Projects/devLink/client/src/components/ChatWorkspace.tsx', 'r', encoding='utf-8') as f:
    cw = f.read()

# Fix input zooming on iOS by changing text-[15px] to text-base (16px) for mobile
cw = cw.replace('placeholder-neutral-500 text-[15px] px-4 py-3',
                'placeholder-neutral-500 text-base sm:text-[15px] px-4 py-3')

# Fix flex containers overflowing viewport
cw = cw.replace('<div className="flex-1 flex flex-col relative bg-[#050505]">',
                '<div className="flex-1 flex flex-col relative bg-[#050505] min-w-0 w-full">')

cw = cw.replace('px-6 lg:px-24 xl:px-48 flex justify-center',
                'px-4 sm:px-6 lg:px-24 xl:px-48 flex justify-center w-full')

with open('e:/Personal_Projects/devLink/client/src/components/ChatWorkspace.tsx', 'w', encoding='utf-8') as f:
    f.write(cw)
