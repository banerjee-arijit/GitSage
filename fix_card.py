import re

with open('e:/Personal_Projects/devLink/client/src/pages/Dashboard.tsx', 'r') as f:
    dash = f.read()

dash = dash.replace(
    '''<RepoCard key={repo.id} repo={repo} onAnalyze={handleAnalyzeClick} />''',
    '''<RepoCard key={repo.id} repo={repo} onAnalyze={handleAnalyzeClick} isAnalyzing={analyzingRepoId === repo.id} />'''
)

with open('e:/Personal_Projects/devLink/client/src/pages/Dashboard.tsx', 'w') as f:
    f.write(dash)

with open('e:/Personal_Projects/devLink/client/src/components/RepoCard.tsx', 'r') as f:
    card = f.read()

card = card.replace(
    '''interface RepoCardProps {
  repo: GithubRepo;
  onAnalyze: (repo: GithubRepo) => void;
}''',
    '''interface RepoCardProps {
  repo: GithubRepo;
  onAnalyze: (repo: GithubRepo) => void;
  isAnalyzing?: boolean;
}'''
)

card = card.replace(
    '''export const RepoCard = ({ repo, onAnalyze }: RepoCardProps) => {''',
    '''import { Loader2 } from "lucide-react";\nexport const RepoCard = ({ repo, onAnalyze, isAnalyzing = false }: RepoCardProps) => {'''
)

card = card.replace(
    '''          <Wand2 className="h-4 w-4" />
          <span>Analyze Repo</span>''',
    '''          {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          <span>{isAnalyzing ? "Initializing..." : "Analyze Repo"}</span>'''
)

with open('e:/Personal_Projects/devLink/client/src/components/RepoCard.tsx', 'w') as f:
    f.write(card)

