import re

with open('e:/Personal_Projects/devLink/client/src/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    dash = f.read()

# 1. Add hasKey, isValidatingKey, keyError states
state_injection = '''const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem("devLink_customApiKey") || "");
  const [hasKey, setHasKey] = useState<boolean>(!!localStorage.getItem("devLink_customApiKey"));
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);'''

dash = dash.replace('const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem("devLink_customApiKey") || "");', state_injection)

# 2. Add Loader2 import if not present
if 'from "lucide-react"' in dash and 'Loader2' not in dash:
    dash = dash.replace('from "lucide-react";', ', Loader2 } from "lucide-react";')

# 3. Rewrite handleSaveApiKey
old_save_handler = '''const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem("devLink_customApiKey", apiKeyInput.trim());
    } else {
      localStorage.removeItem("devLink_customApiKey");
    }
    setIsApiKeyModalOpen(false);
  };'''

new_save_handler = '''const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) {
      localStorage.removeItem("devLink_customApiKey");
      setHasKey(false);
      setIsApiKeyModalOpen(false);
      return;
    }
    
    setIsValidatingKey(true);
    setKeyError(null);
    try {
      const res = await fetch(https://generativelanguage.googleapis.com/v1beta/models?key=);
      if (!res.ok) throw new Error("Invalid key");
      
      localStorage.setItem("devLink_customApiKey", apiKeyInput.trim());
      setHasKey(true);
      setIsApiKeyModalOpen(false);
    } catch (e) {
      setKeyError("Invalid Google Gemini API Key.");
    } finally {
      setIsValidatingKey(false);
    }
  };'''

dash = dash.replace(old_save_handler, new_save_handler)

# 4. Replace localStorage.getItem checks with hasKey
dash = dash.replace('''{localStorage.getItem("devLink_customApiKey") ? "Update Key" : "Set API Key"}''', '''{hasKey ? "Update Key" : "Set API Key"}''')
dash = dash.replace('''{localStorage.getItem("devLink_customApiKey") ? "Update Key" : "Save Key"}''', '''{hasKey ? "Update Key" : "Save Key"}''')

# For the dashboard explicit delete key button
dash = dash.replace('''{localStorage.getItem("devLink_customApiKey") && (
                <button
                  onClick={() => {
                    localStorage.removeItem("devLink_customApiKey");
                    setApiKeyInput("");
                  }}''', '''{hasKey && (
                <button
                  onClick={() => {
                    localStorage.removeItem("devLink_customApiKey");
                    setApiKeyInput("");
                    setHasKey(false);
                  }}''')

# 5. Fix the modal button and UI (add loading state to the button, add keyError display)
old_modal_input_group = '''<input
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
                  {localStorage.getItem("devLink_customApiKey") ? "Update Key" : "Save Key"}
                </button>
              </div>
              {localStorage.getItem("devLink_customApiKey") && (
                <button
                  onClick={() => {
                    localStorage.removeItem("devLink_customApiKey");
                    setApiKeyInput("");
                    setIsApiKeyModalOpen(false);
                  }}
                  className="w-full mt-3 bg-red-500/10 text-red-400 border border-red-500/20 px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-red-500/20 transition-all cursor-pointer shadow-md"
                >
                  Delete Key
                </button>
              )}'''

new_modal_input_group = '''<input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => {
                    setApiKeyInput(e.target.value);
                    setKeyError(null);
                  }}
                  placeholder="AIzaSy..."
                  className="w-full sm:flex-1 bg-transparent border-none px-4 py-2 text-sm text-white focus:outline-none focus:ring-0 placeholder:text-neutral-600"
                  disabled={isValidatingKey}
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

# Since we already replaced the localStorage.getItem previously, we should use regex or handle the modified string
# Let's just do a manual replace of the wrapper block
dash = re.sub(
    r'<input[\s\S]*?Delete Key\s*</button>\s*\)}', 
    new_modal_input_group, 
    dash
)

with open('e:/Personal_Projects/devLink/client/src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(dash)
