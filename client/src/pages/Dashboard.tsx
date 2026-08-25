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

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem("devLink_customApiKey", apiKeyInput.trim());
    } else {
      localStorage.removeItem("devLink_customApiKey");
    }
    setIsApiKeyModalOpen(false);
  };

  const handleAnalyzeClick = (repo: GithubRepo) => {
    if (!localStorage.getItem("devLink_customApiKey")) {
      setIsApiKeyModalOpen(true);
      return;
    }
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
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Workspace
            </span>
            <h1 className="text-3xl font-light tracking-tight text-foreground mt-1">
              {displayUser 
                ? "Exploring @" + displayUser 
                : "Select a Repository"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-light">
              {displayUser 
                ? "Viewing public repositories for this user. Select one to analyze." 
                : "Choose any public or private repository from your account to start AI codebase analysis and chat."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-transparent border border-border rounded-full p-0.5">
              <button
                onClick={() => setIsApiKeyModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-foreground rounded-full text-xs font-medium hover:bg-foreground/5 transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span>{localStorage.getItem("devLink_customApiKey") ? "Update Key" : "Set API Key"}</span>
              </button>
              {localStorage.getItem("devLink_customApiKey") && (
                <button
                  onClick={() => {
                    localStorage.removeItem("devLink_customApiKey");
                    setApiKeyInput("");
                  }}
                  className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all cursor-pointer"
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
              className="flex items-center gap-2 px-4 py-2 bg-card text-foreground rounded-full text-xs font-medium hover:bg-neutral-800 transition-all disabled:opacity-50 shadow-md cursor-pointer"
            >
              <RefreshCw className={"h-3.5 w-3.5 " + (isLoading ? "animate-spin" : "")} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        {isApiKeyModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md animate-fade px-4">
            <div className="bg-card w-full max-w-md rounded-3xl p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,1)] relative">
              
                <button 
                  onClick={() => setIsApiKeyModalOpen(false)}
                  className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              <h3 className="text-2xl font-light text-foreground mb-2">Bring Your Own Key</h3>
              <p className="text-sm text-muted-foreground mb-6 font-light">
                To use the AI codebase chat, please provide a valid Google Gemini API key.
              </p>
              <div className="bg-card border border-border rounded-2xl p-4 mb-8">
                <div className="flex items-center gap-2 text-emerald-500 mb-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-xs font-semibold uppercase tracking-wider">Privacy Guarantee</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your API key is <strong>never</strong> stored in our database. It is saved purely in your browser's local storage (BYOK) and is only temporarily passed to the server to securely communicate with Google during your session.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 relative mb-2 bg-card sm:rounded-full rounded-2xl p-1.5 focus-within:bg-muted transition-all shadow-inner">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full sm:flex-1 bg-transparent border-none px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-0 placeholder:text-neutral-600"
                />
                <button
                  onClick={handleSaveApiKey}
                  className="w-full sm:w-auto bg-[#fdba74] text-background px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#fb923c] transition-all cursor-pointer shadow-md"
                >
                  Save Key
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground text-center mt-4">
                Don't have one? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[#fdba74] hover:underline">Get a free key from Google AI Studio</a>
              </p>
            </div>
          </div>
        )}
        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search repositories by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 bg-card text-foreground placeholder:text-muted-foreground text-sm rounded-2xl border border-border focus:border-border focus:outline-none focus:ring-0 focus-visible:ring-0 transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1 bg-card border border-border p-1 rounded-full w-full md:w-auto shadow-md">
            <button
              onClick={() => setFilterType("all")}
              className={"px-4 py-1.5 rounded-full text-xs font-medium transition-all " + (filterType === "all" ? "bg-foreground text-background font-semibold" : "text-muted-foreground hover:text-foreground")}
            >
              All ({repos.length})
            </button>
            <button
              onClick={() => setFilterType("public")}
              className={"px-4 py-1.5 rounded-full text-xs font-medium transition-all " + (filterType === "public" ? "bg-foreground text-background font-semibold" : "text-muted-foreground hover:text-foreground")}
            >
              Public ({repos.filter((r) => !r.private).length})
            </button>
            <button
              onClick={() => setFilterType("private")}
              className={"px-4 py-1.5 rounded-full text-xs font-medium transition-all " + (filterType === "private" ? "bg-foreground text-background font-semibold" : "text-muted-foreground hover:text-foreground")}
            >
              Private ({repos.filter((r) => r.private).length})
            </button>
          </div>
        </div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <Loader2 className="h-9 w-9 text-foreground animate-spin mb-4" />
            <p className="text-sm font-light text-muted-foreground">
              Fetching your GitHub repositories...
            </p>
          </div>
        ) : filteredRepos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRepos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} onAnalyze={handleAnalyzeClick} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl bg-card">
            <FolderGit2 className="h-10 w-10 text-neutral-600 mb-3" />
            <h3 className="text-base font-normal text-foreground">
              No repositories found
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm font-light">
              Try adjusting your search query or filter to find the repository
              you are looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


