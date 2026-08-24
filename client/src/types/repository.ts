export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  private: boolean;
  updated_at: string;
  default_branch?: string;
  owner?: {
    login: string;
  };
}

export interface UserProfile {
  id: string;
  githubId: number;
  githubUsername: string;
  displayName: string;
  avatarUrl: string;
}
