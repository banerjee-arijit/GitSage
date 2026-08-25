import axios from "axios";
import type { GithubRepo, UserProfile } from "../types/repository";

const API = axios.create({
  baseURL: "https://gitsage-api.onrender.com/api",
});

export const fetchUserProfile = async (identifier: string): Promise<UserProfile> => {
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(identifier);
  const endpoint = isUuid ? `/users/${identifier}` : `/users/search-by-name/${identifier}`;
  const { data } = await API.get<UserProfile>(endpoint);
  return data;
};

export const fetchUserRepos = async (userId: string): Promise<GithubRepo[]> => {
  const { data } = await API.get<GithubRepo[]>(`/repos/github/${userId}`);
  return data;
};

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

export const ingestRepository = async (userId: string, repoName: string, ownerName: string, defaultBranch: string = "main") => {
  const response = await API.post(`/analysis/ingest/${userId}`, {
    repoName,
    ownerName,
    defualtBranch: defaultBranch,
  });
  return response.data;
};

export const createChatThread = async (userId: string, repoName: string, title: string) => {
  const { data } = await API.post(`/analysis/thread/${userId}/${repoName}`, { title });
  return data;
};

export const fetchChatThreads = async (userId: string, repoName: string) => {
  const { data } = await API.get(`/analysis/threads/${userId}/${repoName}`);
  return data;
};

export const fetchChatMessages = async (threadId: string) => {
  const { data } = await API.get(`/analysis/thread/${threadId}/messages`);
  return data;
};

export const deleteChatThread = async (threadId: string) => {
  await API.delete(`/analysis/thread/${threadId}`);
};

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

