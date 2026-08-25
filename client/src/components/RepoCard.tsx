import type { GithubRepo } from "../types/repository";
import { Lock, Globe, ExternalLink, Sparkles, Code2 } from "lucide-react";
interface RepoCardProps {
  repo: GithubRepo;
  onAnalyze: (repo: GithubRepo) => void;
}
export const RepoCard = ({ repo, onAnalyze }: RepoCardProps) => {
  return (
    <div className="bg-card hover:bg-card border border-border hover:border-border shadow-lg hover:shadow-2xl rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-foreground/5 border border-border text-foreground shrink-0 group-hover:bg-foreground/10 transition-colors">
              <Code2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-medium text-foreground truncate group-hover:text-secondary-foreground transition-colors">
              {repo.name}
            </h3>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border shrink-0 ${
              repo.private
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-foreground/5 border-border text-secondary-foreground"
            }`}
          >
            {repo.private ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            {repo.private ? "Private" : "Public"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground font-light line-clamp-2 leading-relaxed mb-6">
          {repo.description || "No description provided for this repository."}
        </p>
      </div>
      <div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-4 border-b border-border mb-4">
          {repo.language ? (
            <span className="flex items-center gap-1.5 font-medium text-secondary-foreground">
              <span className="w-2 h-2 rounded-full bg-foreground inline-block" />
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
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => onAnalyze(repo)}
            className="h-9 px-4 bg-foreground text-background hover:bg-neutral-200 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analyze Repo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

