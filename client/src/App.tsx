import { useState, useEffect, lazy, Suspense } from "react";
import type { GithubRepo, UserProfile } from "./types/repository";
import { fetchUserProfile, fetchUserRepos, saveRepoForAnalysis } from "./service/api";
import { Navbar } from "./components/Navbar";
const LandingPage = lazy(() => import("./components/LandingPage").then(m => ({ default: m.LandingPage })));
const Dashboard = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.Dashboard })));
const ChatWorkspace = lazy(() => import("./components/ChatWorkspace").then(m => ({ default: m.ChatWorkspace })));
export function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [currentView, setCurrentView] = useState<"landing" | "dashboard" | "chat">("landing");
  const [toastMessage] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('devLink_theme') as 'light' | 'dark') || 'dark');
  useEffect(() => { window.document.documentElement.classList.remove('light', 'dark'); window.document.documentElement.classList.add(theme); localStorage.setItem('devLink_theme', theme); }, [theme]);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramUserId = urlParams.get("userId");
    const exploreUser = localStorage.getItem("devLink_exploreUser");
    if (paramUserId) {
      localStorage.setItem("devLink_userId", paramUserId);
      setUserId(paramUserId);
      setCurrentView("dashboard");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const storedUserId = localStorage.getItem("devLink_userId");
      if (storedUserId) {
        setUserId(storedUserId);
        setCurrentView("dashboard");
      } else if (exploreUser) {
        setCurrentView("dashboard");
      }
    }
  }, []);
  useEffect(() => {
    if (userId) {
      const loadUserData = async () => {
        try {
          const profile = await fetchUserProfile(userId);
          setUser(profile);
        } catch (err) {
          console.error(err);
        }
      };
      loadUserData();
    }
  }, [userId]);
  useEffect(() => {
    if (currentView === "dashboard") {
      loadRepositories();
    }
  }, [currentView, userId]);
  const loadRepositories = async () => {
    try {
      setIsLoadingRepos(true);
      const exploreUser = localStorage.getItem("devLink_exploreUser");
      if (exploreUser) {
        const res = await fetch("https://api.github.com/users/" + exploreUser + "/repos?type=public&sort=updated&per_page=100");
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        setRepos(data);
      } else if (userId) {
        const userRepos = await fetchUserRepos(userId);
        setRepos(userRepos);
      } else {
        setRepos([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingRepos(false);
    }
  };
  const handleGitHubLogin = () => {
    window.location.href = "https://gitsage-api.onrender.com/oauth2/authorization/github";
  };
  const handleLogout = () => {
    localStorage.removeItem("devLink_userId");
    localStorage.removeItem("devLink_exploreUser");
    setUserId(null);
    setUser(null);
    setRepos([]);
    setSelectedRepo(null);
    setCurrentView("landing");
  };
  const handleAnalyzeRepo = async (repo: GithubRepo) => {
    let currentUserId = userId;
    if (!currentUserId) {
      let guestId = localStorage.getItem("devLink_guestId");
      if (!guestId) {
        guestId = crypto.randomUUID();
        localStorage.setItem("devLink_guestId", guestId);
      }
      currentUserId = guestId;
    }
    try {
      setSelectedRepo(repo);
      await saveRepoForAnalysis(currentUserId, repo);
      setCurrentView("chat");
    } catch (err) {
      console.error(err);
      setSelectedRepo(repo);
      setCurrentView("chat");
    }
  };
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 bg-card text-foreground border border-border rounded-2xl shadow-2xl text-xs font-medium backdrop-blur-md animate-rise">
          {toastMessage}
        </div>
      )}
      {currentView !== "chat" && (
        <Navbar
          user={user}
          exploreUser={localStorage.getItem("devLink_exploreUser")}
          onLogin={handleGitHubLogin}
          onLogout={handleLogout}
          isDashboard={currentView === 'dashboard'} theme={theme} onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        />
      )}
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        {currentView === "landing" && (
          <LandingPage onLogin={handleGitHubLogin} onExplore={() => setCurrentView("dashboard")} />
        )}
        {currentView === "dashboard" && (
          <Dashboard
            user={user}
            repos={repos}
            isLoading={isLoadingRepos}
            onRefresh={loadRepositories}
            onAnalyzeRepo={handleAnalyzeRepo}
          />
        )}
        {currentView === "chat" && selectedRepo && (
          <ChatWorkspace
            userId={userId || localStorage.getItem("devLink_guestId")!}
            repo={selectedRepo}
            onBack={() => setCurrentView("dashboard")}
          />
        )}
      </Suspense>
    </div>
  );
}
export default App;


