import { useState } from "react";
import { BrandMark } from "./BrandMark";
const GithubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);
interface LandingPageProps {
  onConnectGithub?: () => void;
  onLogin?: () => void;
  onExplore?: () => void;
}
export const LandingPage = ({ onConnectGithub, onLogin, onExplore }: LandingPageProps) => {
  const handleAuth = onConnectGithub || onLogin || (() => {});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchUrl, setSearchUrl] = useState("");
  const [searchedProfile, setSearchedProfile] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const handleSearchProfile = async () => {
    let username = searchUrl.trim();
    if (!username) return;
    if (username.includes("github.com/")) {
      const parts = username.split("github.com/");
      username = parts[1].split("/")[0];
    } else {
      username = username.replace(/\/$/, "");
      username = username.split("/").pop() || username;
    }
    setIsSearching(true);
    setSearchError("");
    setSearchedProfile(null);
    try {
      const res = await fetch(`https://api.github.com/users/${username}`);
      if (!res.ok) {
        throw new Error("User not found.");
      }
      const data = await res.json();
      if (data.type !== "User" && data.type !== "Organization") {
        throw new Error("Invalid GitHub profile.");
      }
      setSearchedProfile(data);
    } catch (err: any) {
      setSearchError(err.message || "Failed to fetch profile.");
    } finally {
      setIsSearching(false);
    }
  };
  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <section className="relative h-screen w-full overflow-hidden flex flex-col justify-between bg-background">
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <video
            className="w-full h-full object-contain ml-72 object-center scale-105"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          >
            <source
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_112712_da9d53df-6d27-4b12-bdf6-aa9dc2622bdf.mp4"
              type="video/mp4"
            />
          </video>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(5,5,5,0) 45%, rgba(5,5,5,0.55) 70%, rgba(5,5,5,0.95) 90%, #050505 100%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none hidden md:block"
            style={{
              background:
                "linear-gradient(to right, #050505 0%, transparent 18%, transparent 82%, #050505 100%)",
            }}
          />
        </div>
        <div className="relative z-10 container mx-auto max-w-7xl px-6 pt-36 flex-grow flex flex-col justify-center">
          <main className="max-w-2xl">
            <h1 className="text-5xl sm:text-7xl font-light tracking-tight leading-[1.08] text-foreground">
              <span className="block">Chat Directly with</span>
              <span className="block font-light text-orange-300">
                Your Codebase
              </span>
            </h1>
            <p className="mt-8 text-base sm:text-lg font-light text-muted-foreground leading-relaxed max-w-xl">
              Connect your GitHub account, select any public or private
              repository, and ask AI anything about your code with grounded
              Gemini 1.5 Flash intelligence.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <button
                onClick={handleAuth}
                className="h-12 px-8 bg-foreground text-background hover:bg-neutral-200 text-sm font-semibold rounded-full transition-all transform active:scale-95 shadow-2xl flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <GithubIcon className="w-4 h-4 text-background" />
                <span>Connect to GitHub</span>
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="h-12 px-8 bg-card text-foreground border border-border hover:bg-muted text-sm font-semibold rounded-full transition-all transform active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>Explore Other GitHub</span>
              </button>
            </div>
          </main>
        </div>
      </section>
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md animate-fade">
          <div className="w-full max-w-md rounded-3xl p-8  relative">
            <button 
              onClick={() => {
                setIsModalOpen(false);
                setSearchError("");
                setSearchedProfile(null);
                setSearchUrl("");
              }}
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-2xl font-light text-foreground mb-8">Explore Profile</h3>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchProfile();
              }}
              className="flex items-center relative mb-8 bg-card rounded-full p-1.5 focus-within:bg-muted transition-all shadow-inner"
            >
              <input
                type="text"
                value={searchUrl}
                onChange={(e) => setSearchUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="flex-1 bg-transparent border-none px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-0 placeholder:text-neutral-600"
              />
              <button
                type="submit"
                disabled={isSearching || !searchUrl.trim()}
                className="bg-[#fdba74] text-foreground px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#fb923c] transition-all cursor-pointer disabled:opacity-50 shadow-md"
              >
                {isSearching ? "..." : "Search"}
              </button>
            </form>
            {searchError && (
              <p className="text-red-400 text-xs mb-4 px-2">{searchError}</p>
            )}
            {searchedProfile && (
              <div 
                onClick={() => {
                  localStorage.setItem("devLink_exploreUser", searchedProfile.login);
                  if (onExplore) {
                    onExplore();
                  } else {
                    window.location.reload(); // Fallback if no prop provided
                  }
                }}
                className="flex items-center gap-4 p-4 bg-card hover:bg-muted rounded-2xl cursor-pointer transition-all active:scale-[0.98] shadow-sm"
              >
                <img src={searchedProfile.avatar_url} alt="Avatar" className="w-14 h-14 rounded-full bg-[#1c1c1c]" />
                <div className="flex-1">
                  <h4 className="text-foreground font-medium text-base">{searchedProfile.name || searchedProfile.login}</h4>
                  <p className="text-muted-foreground text-xs mt-0.5">@{searchedProfile.login}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                    <span>{searchedProfile.public_repos} Repos</span>
                    <span>{searchedProfile.followers} Followers</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#fdba74]/10 flex items-center justify-center text-[#fdba74]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <section id="features" className="relative z-10 bg-background py-24">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="mb-16">
            <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              ENGINEERED FOR DEVELOPERS
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal text-foreground mt-2">
              Built for Codebase Analysis & Chat
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-border p-8 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center mb-6 text-foreground font-bold text-sm">
                01
              </div>
              <h3 className="text-xl font-medium text-foreground mb-2">
                GitHub OAuth Control
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-light">
                Authenticate securely with GitHub OAuth. Grant access to public
                and private repositories with fine-grained read permissions.
              </p>
            </div>
            <div className="bg-card border border-border p-8 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center mb-6 text-foreground font-bold text-sm">
                02
              </div>
              <h3 className="text-xl font-medium text-foreground mb-2">
                Live Repo Explorer
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-light">
                Browse all your repositories in a clean dashboard with real-time
                search, filter badges, and language indicators.
              </p>
            </div>
            <div className="bg-card border border-border p-8 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center mb-6 text-foreground font-bold text-sm">
                03
              </div>
              <h3 className="text-xl font-medium text-foreground mb-2">
                Gemini 1.5 RAG Chat
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-light">
                Query your entire codebase with grounded AI responses, file
                citations, and precise architectural explanations.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section id="about" className="relative z-10 bg-background py-24">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="flex items-center gap-3 mb-6">
            <BrandMark className="w-6 h-9" />
            <span className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">
              About devLink
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-light text-foreground mb-8 leading-tight">
            The AI-Powered Pair Programmer for Your GitHub Repositories.
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-6 font-light">
            Navigating large or unfamiliar repositories is time-consuming.
            devLink bridges your GitHub account with state-of-the-art AI models,
            giving you an instant pair programmer that understands your exact
            code structure.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed font-light">
            Built with Spring Boot 3, Spring AI, MapStruct, MySQL, and React,
            devLink provides low-latency repository indexing and intelligent
            codebase chat capabilities.
          </p>
        </div>
      </section>
      <section id="faq" className="relative z-10 bg-background py-24">
        <div className="container mx-auto max-w-4xl px-6">
          <h2 className="text-3xl sm:text-4xl font-normal text-foreground mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <div className="border-b border-border pb-6">
              <h3 className="text-lg font-medium text-foreground">
                Does devLink support private repositories?
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed font-light">
                Yes! When you log in via GitHub, devLink requests the{" "}
                <code className="bg-foreground/10 px-1.5 py-0.5 rounded text-foreground font-mono text-xs">
                  repo
                </code>{" "}
                scope, enabling support for both public and private GitHub
                repositories.
              </p>
            </div>
            <div className="border-b border-border pb-6">
              <h3 className="text-lg font-medium text-foreground">
                How does the AI analyze my codebase?
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed font-light">
                When you select a repository to analyze, devLink indexes your
                code files into Spring AI vector stores and uses Gemini 1.5
                Flash RAG to answer queries with precise file citations.
              </p>
            </div>
            <div className="border-b border-border pb-6">
              <h3 className="text-lg font-medium text-foreground">
                Is my code secure?
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed font-light">
                Your code remains private. OAuth access tokens are stored
                securely, and all API interactions occur over encrypted HTTPS
                connections.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

