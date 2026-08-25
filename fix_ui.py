import re

with open('e:/Personal_Projects/devLink/client/src/components/ChatWorkspace.tsx', 'r') as f:
    content = f.read()

# Replace sidebar logic
content = re.sub(
    r'\{isSidebarOpen && \(\s*<div className="hidden md:flex w-64 bg-\[#050505\] border-r border-\[#1a1a1a\] flex-col shrink-0 animate-fade">',
    '''{/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <div 
        className={ixed inset-y-0 left-0 z-40 md:relative flex w-64 bg-[#050505] border-r border-[#1a1a1a] flex-col shrink-0 transition-transform duration-300 ease-in-out }
      >''',
    content
)

# We need to remove the closing )} of the old {isSidebarOpen && ( block.
# It usually occurs before the <div className="flex-1 flex flex-col relative bg-[#050505]">
content = content.replace(
    '''            </button>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col relative bg-[#050505]">''',
    '''            </button>
          </div>
        </div>
      <div className="flex-1 flex flex-col relative bg-[#050505]">'''
)

# Update the header button to be visible on mobile to open the menu
content = content.replace(
    '''{!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 mr-2 text-neutral-500 hover:text-white transition-colors cursor-pointer"
            >
              <PanelLeft className="w-4.5 h-4.5" />
            </button>
          )}''',
    '''<button 
            onClick={() => setIsSidebarOpen(true)}
            className={p-2 mr-2 text-neutral-500 hover:text-white transition-colors cursor-pointer md:block }
          >
            <PanelLeft className="w-4.5 h-4.5" />
          </button>'''
)

with open('e:/Personal_Projects/devLink/client/src/components/ChatWorkspace.tsx', 'w') as f:
    f.write(content)

with open('e:/Personal_Projects/devLink/client/src/pages/Dashboard.tsx', 'r') as f:
    dash = f.read()

# Fix tabs overflow
dash = dash.replace(
    '''<div className="flex flex-wrap items-center justify-center gap-1 bg-[#0e0e11] border border-white/20 p-1 rounded-full w-full md:w-auto shadow-md">''',
    '''<div className="flex items-center gap-1 bg-[#0e0e11] border border-white/20 p-1 rounded-full w-full md:w-auto shadow-md overflow-x-auto no-scrollbar">'''
)

dash = dash.replace(
    '''<button
              onClick={() => setFilterType("all")}''',
    '''<button
              style={{ flex: "1 0 auto" }}
              onClick={() => setFilterType("all")}'''
)
dash = dash.replace(
    '''<button
              onClick={() => setFilterType("public")}''',
    '''<button
              style={{ flex: "1 0 auto" }}
              onClick={() => setFilterType("public")}'''
)
dash = dash.replace(
    '''<button
              onClick={() => setFilterType("private")}''',
    '''<button
              style={{ flex: "1 0 auto" }}
              onClick={() => setFilterType("private")}'''
)

# Fix loading UI for analyzing
dash = dash.replace('''} from "lucide-react";''', ''', Play } from "lucide-react";''')

dash = dash.replace('''const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem("devLink_customApiKey") || "");''', 
'''const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem("devLink_customApiKey") || "");
  const [analyzingRepoId, setAnalyzingRepoId] = useState<number | null>(null);''')

dash = dash.replace('''const handleAnalyzeClick = (repo: GithubRepo) => {
    if (!localStorage.getItem("devLink_customApiKey")) {
      setIsApiKeyModalOpen(true);
      return;
    }
    onAnalyzeRepo(repo);
  };''',
'''const handleAnalyzeClick = (repo: GithubRepo) => {
    if (!localStorage.getItem("devLink_customApiKey")) {
      setIsApiKeyModalOpen(true);
      return;
    }
    setAnalyzingRepoId(repo.id);
    onAnalyzeRepo(repo);
  };''')

with open('e:/Personal_Projects/devLink/client/src/pages/Dashboard.tsx', 'w') as f:
    f.write(dash)
