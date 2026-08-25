import { useState, useMemo } from "react";
import type { GithubRepo, UserProfile } from "../types/repository";
import { RepoCard } from "../components/RepoCard";
import { Input } from "../components/ui/input";
import { Search, Loader2, FolderGit2, RefreshCw } from "lucide-react";

interface DashboardProps {
  user: UserProfile | null;
  repos: GithubRepo[];
  isLoading: boolean;
  onRefresh: () => void;
  onAnalyzeRepo: (repo: GithubRepo) => void;
}

export const Dashboard = ({
  user,
  repos,
  isLoading,
  onRefresh,
  onAnalyzeRepo,
}: DashboardProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "public" | "private">("all");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(() => !localStorage.getItem("devLink_customApiKey"));
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem("devLink_customApiKey") || "");
  const [hasKey, setHasKey] = useState<boolean>(!!localStorage.getItem("devLink_customApiKey"));
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [analyzingRepoId, setAnalyzingRepoId] = useState<number | null>(null);

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) {
      localStorage.removeItem("devLink_customApiKey");
      setHasKey(false);
      setIsApiKeyModalOpen(false);
      return;
    }
    
    setIsValidatingKey(true);
    setKeyError(null);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKeyInput.trim()}`);
      if (!res.ok) throw new Error("Invalid key");
      
      localStorage.setItem("devLink_customApiKey", apiKeyInput.trim());
      setHasKey(true);
      setIsApiKeyModalOpen(false);
    } catch (e) {
      setKeyError("Invalid Google Gemini API Key.");
    } finally {
      setIsValidatingKey(false);
    }
  };

  const handleAnalyzeClick = (repo: GithubRepo) => {
    if (!localStorage.getItem("devLink_customApiKey")) {
      setIsApiKeyModalOpen(true);
      return;
    }
    setAnalyzingRepoId(repo.id);
    onAnalyzeRepo(repo);
  };

  const filteredRepos = useMemo(() => {
    return repos.filter((repo) => {
      const matchesSearch =
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description &&
          repo.description.toLowerCase().includes(searchQuery.toLowerCase()));
      if (filterType === "public") return matchesSearch && !repo.private;
      if (filterType === "private") return matchesSearch && repo.private;
      return matchesSearch;
    });
  }, [repos, searchQuery, filterType]);

  const exploreUser = localStorage.getItem("devLink_exploreUser");
  const displayUser = exploreUser || user?.githubUsername;

  return (
    <div className="min-h-screen bg-[#050505] text-[#fafafa] pt-24 pb-16">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-300">
              Workspace
            </span>
            <h1 className="text-3xl font-normal tracking-tight text-white mt-1">
              {displayUser 
                ? "Exploring @" + displayUser 
                : "Select a Repository"}
            </h1>
            <p className="text-sm text-neutral-300 mt-1 font-normal">
              {displayUser 
                ? "Viewing public repositories for this user. Select one to analyze." 
                : "Choose any public or private repository from your account to start AI codebase analysis and chat."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-transparent border border-white/20 rounded-full p-0.5">
              <button
                onClick={() => setIsApiKeyModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-white rounded-full text-xs font-medium hover:bg-white/5 transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span>{hasKey ? "Update Key" : "Set API Key"}</span>
              </button>
              {hasKey && (
                <button
                  onClick={() => {
                    localStorage.removeItem("devLink_customApiKey");
                    setApiKeyInput("");
                    setHasKey(false);
                  }}
                  className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all cursor-pointer"
                  title="Remove Key"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-[#121215] text-white rounded-full text-xs font-medium hover:bg-neutral-800 transition-all disabled:opacity-50 shadow-md cursor-pointer"
            >
              <RefreshCw className={"h-3.5 w-3.5 " + (isLoading ? "animate-spin" : "")} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        {isApiKeyModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade px-4">
            <div className="bg-[#0c0c0e] w-full max-w-md rounded-3xl p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,1)] relative">
              
                <button 
                  onClick={() => setIsApiKeyModalOpen(false)}
                  className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              <h3 className="text-2xl font-normal text-white mb-2">Bring Your Own Key</h3>
              <p className="text-sm text-neutral-300 mb-6 font-normal">
                To use the AI codebase chat, please provide a valid Google Gemini API key.
              </p>
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 mb-8">
                <div className="flex items-center gap-2 text-green-400 mb-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-xs font-semibold uppercase tracking-wider">Privacy Guarantee</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Your API key is <strong>never</strong> stored in our database. It is saved purely in your browser's local storage (BYOK) and is only temporarily passed to the server to securely communicate with Google during your session.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 relative mb-2 bg-[#141414] sm:rounded-full rounded-2xl p-1.5 focus-within:bg-[#1a1a1a] transition-all shadow-inner">
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
              )}
              <p className="text-xs text-neutral-400 text-center mt-4">
                Don't have one? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-orange-300 hover:underline">Get a free key from Google AI Studio</a>
              </p>
            </div>
          </div>
        )}
        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
            <Input
              type="text"
              placeholder="Search repositories by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 bg-[#0e0e11] text-white placeholder:text-neutral-300 text-sm rounded-2xl border border-white/10 focus:border-white/20 focus:outline-none focus:ring-0 focus-visible:ring-0 transition-all"
            />
          </div>
          <div className="flex items-center gap-1 bg-[#0e0e11] border border-white/20 p-1 rounded-full w-full md:w-auto shadow-md overflow-x-auto no-scrollbar">
            <button
              style={{ flex: "1 0 auto" }}
              onClick={() => setFilterType("all")}
              className={"px-4 py-1.5 rounded-full text-xs font-medium transition-all " + (filterType === "all" ? "bg-white text-black font-semibold" : "text-neutral-300 hover:text-white")}
            >
              All ({repos.length})
            </button>
            <button
              style={{ flex: "1 0 auto" }}
              onClick={() => setFilterType("public")}
              className={"px-4 py-1.5 rounded-full text-xs font-medium transition-all " + (filterType === "public" ? "bg-white text-black font-semibold" : "text-neutral-300 hover:text-white")}
            >
              Public ({repos.filter((r) => !r.private).length})
            </button>
            <button
              style={{ flex: "1 0 auto" }}
              onClick={() => setFilterType("private")}
              className={"px-4 py-1.5 rounded-full text-xs font-medium transition-all " + (filterType === "private" ? "bg-white text-black font-semibold" : "text-neutral-300 hover:text-white")}
            >
              Private ({repos.filter((r) => r.private).length})
            </button>
          </div>
        </div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <Loader2 className="h-9 w-9 text-white animate-spin mb-4" />
            <p className="text-sm font-normal text-neutral-300">
              Fetching your GitHub repositories...
            </p>
          </div>
        ) : filteredRepos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRepos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} onAnalyze={handleAnalyzeClick} isAnalyzing={analyzingRepoId === repo.id} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl bg-[#0e0e11]">
            <FolderGit2 className="h-10 w-10 text-neutral-600 mb-3" />
            <h3 className="text-base font-normal text-white">
              No repositories found
            </h3>
            <p className="text-xs text-neutral-300 mt-1 max-w-sm font-normal">
              Try adjusting your search query or filter to find the repository
              you are looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};





