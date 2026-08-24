import axios from "axios";
import type { GithubRepo, UserProfile } from "../types/repository";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Fetch User Profile by User UUID or Username
export const fetchUserProfile = async (identifier: string): Promise<UserProfile> => {
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(identifier);
  const endpoint = isUuid ? `/users/${identifier}` : `/users/search-by-name/${identifier}`;
  const { data } = await API.get<UserProfile>(endpoint);
  return data;
};

// Fetch live GitHub Repos for User UUID
export const fetchUserRepos = async (userId: string): Promise<GithubRepo[]> => {
  const { data } = await API.get<GithubRepo[]>(`/repos/github/${userId}`);
  return data;
};

// Save repo selection for analysis
export const saveRepoForAnalysis = async (userId: string, repo: GithubRepo) => {
  const response = await API.post(`/repos/save/${userId}`, {
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    html_url: repo.html_url,
    language: repo.language,
    private: repo.private,
  });
  return response.data;
};

// Ingest repository files into VectorStore
export const ingestRepository = async (userId: string, repoName: string, ownerName: string, defaultBranch: string = "main") => {
  const response = await API.post(`/analysis/ingest/${userId}`, {
    repoName,
    ownerName,
    defualtBranch: defaultBranch,
  });
  return response.data;
};

// --- CHAT PERSISTENCE API ---

// Create Thread
export const createChatThread = async (userId: string, repoName: string, title: string) => {
  const { data } = await API.post(`/analysis/thread/${userId}/${repoName}`, { title });
  return data;
};

// Get all threads for a repo
export const fetchChatThreads = async (userId: string, repoName: string) => {
  const { data } = await API.get(`/analysis/threads/${userId}/${repoName}`);
  return data;
};

// Get messages for a thread
export const fetchChatMessages = async (threadId: string) => {
  const { data } = await API.get(`/analysis/thread/${threadId}/messages`);
  return data;
};

// Delete thread
export const deleteChatThread = async (threadId: string) => {
  await API.delete(`/analysis/thread/${threadId}`);
};

// Ask Gemini AI question about codebase (RAG)
export const chatWithCodebase = async (userId: string, threadId: string, repoName: string, question: string) => {
  const customApiKey = localStorage.getItem("devLink_customApiKey");
  const headers = customApiKey ? { "X-Gemini-API-Key": customApiKey } : {};

  const response = await API.post(`/analysis/chat/${userId}`, {
    threadId,
    repoName,
    question,
  }, { headers });
  
  return response.data as { answer: string; source: string[] };
};
