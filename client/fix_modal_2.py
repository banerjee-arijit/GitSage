with open('e:/Personal_Projects/devLink/client/src/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    dash = f.read()

old_block = '''<div className="flex flex-col sm:flex-row items-center gap-2 relative mb-2 bg-[#141414] sm:rounded-full rounded-2xl p-1.5 focus-within:bg-[#1a1a1a] transition-all shadow-inner">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full sm:flex-1 bg-transparent border-none px-4 py-2 text-sm text-white focus:outline-none focus:ring-0 placeholder:text-neutral-600"
                />
                <button
                  onClick={handleSaveApiKey}
                  className="w-full sm:w-auto bg-[#fdba74] text-black px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#fb923c] transition-all cursor-pointer shadow-md"
                >
                  Save Key
                </button>
              </div>'''

new_block = '''<div className="flex flex-col sm:flex-row items-center gap-2 relative mb-2 bg-[#141414] sm:rounded-full rounded-2xl p-1.5 focus-within:bg-[#1a1a1a] transition-all shadow-inner">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => {
                    setApiKeyInput(e.target.value);
                    setKeyError(null);
                  }}
                  placeholder="AIzaSy..."
                  disabled={isValidatingKey}
                  className="w-full sm:flex-1 bg-transparent border-none px-4 py-2 text-sm text-white focus:outline-none focus:ring-0 placeholder:text-neutral-600 disabled:opacity-50"
                />
                <button
                  onClick={handleSaveApiKey}
                  disabled={isValidatingKey || !apiKeyInput.trim()}
                  className="w-full sm:w-auto bg-[#fdba74] text-black px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#fb923c] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidatingKey && <Loader2 className="w-4 h-4 animate-spin" />}
                  {hasKey ? "Update Key" : "Save Key"}
                </button>
              </div>
              {keyError && (
                <p className="text-red-400 text-xs text-center mt-2 font-medium">{keyError}</p>
              )}
              {hasKey && (
                <button
                  onClick={() => {
                    localStorage.removeItem("devLink_customApiKey");
                    setApiKeyInput("");
                    setHasKey(false);
                    setIsApiKeyModalOpen(false);
                  }}
                  className="w-full mt-3 bg-red-500/10 text-red-400 border border-red-500/20 px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-red-500/20 transition-all cursor-pointer shadow-md"
                >
                  Delete Key
                </button>
              )}'''

dash = dash.replace(old_block, new_block)

with open('e:/Personal_Projects/devLink/client/src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(dash)
