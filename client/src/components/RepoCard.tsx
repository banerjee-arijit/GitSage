import type { GithubRepo } from "../types/repository";
import { Lock, Globe, ExternalLink, Sparkles, Code2 } from "lucide-react";
interface RepoCardProps {
  repo: GithubRepo;
  onAnalyze: (repo: GithubRepo) => void;
  isAnalyzing?: boolean;
}
import { Loader2 } from "lucide-react";
export const RepoCard = ({ repo, onAnalyze, isAnalyzing = false }: RepoCardProps) => {
  return (
    <div className="bg-[#0c0c0e] hover:bg-[#0e0e11] border border-white/10 hover:border-white/20 shadow-lg hover:shadow-2xl rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white shrink-0 group-hover:bg-white/10 transition-colors">
              <Code2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-medium text-white truncate group-hover:text-neutral-200 transition-colors">
              {repo.name}
            </h3>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border shrink-0 ${
              repo.private
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-white/5 border-white/10 text-neutral-300"
            }`}
          >
            {repo.private ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            {repo.private ? "Private" : "Public"}
          </span>
        </div>
        <p className="text-xs text-[#a7a6a6] font-light line-clamp-2 leading-relaxed mb-6">
          {repo.description || "No description provided for this repository."}
        </p>
      </div>
      <div>
        <div className="flex items-center justify-between text-[11px] text-[#a7a6a6] pb-4 border-b border-white/5 mb-4">
          {repo.language ? (
            <span className="flex items-center gap-1.5 font-medium text-neutral-200">
              <span className="w-2 h-2 rounded-full bg-white inline-block" />
              {repo.language}
            </span>
          ) : (
            <span className="text-neutral-600">Unspecified</span>
          )}
          <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#a7a6a6] hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => onAnalyze(repo)}
            className="h-9 px-4 bg-white text-[#050505] hover:bg-neutral-200 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
          >
            {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isAnalyzing ? "Initializing..." : "Analyze Repo"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};


