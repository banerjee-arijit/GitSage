import { useState, useEffect, useRef } from "react";
import type { GithubRepo } from "../types/repository";
import { chatWithCodebase, ingestRepository, createChatThread, fetchChatThreads, fetchChatMessages, deleteChatThread } from "../service/api";
import { FormattedMarkdown } from "./FormattedMarkdown";
import {
  ArrowLeft,
  Loader2,
  Copy,
  RotateCcw,
  MoreHorizontal,
  Plus,
  Mic,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  Trash2,
  Home
} from "lucide-react";
interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  sourceFiles?: string[];
  latency?: string;
}
interface Thread {
  id: string;
  title: string;
}
interface ChatWorkspaceProps {
  userId: string;
  repo: GithubRepo;
  onBack: () => void;
}
export const ChatWorkspace = ({ userId, repo, onBack }: ChatWorkspaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>("");
  const [isIngesting, setIsIngesting] = useState(true);
  const [totalFiles, setTotalFiles] = useState(0);
  const [processedFiles, setProcessedFiles] = useState(0);
  const [chunksEmbedded, setChunksEmbedded] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);
  useEffect(() => {
    if (isIngesting) {
      const targetFiles = Math.floor(Math.random() * 50) + 20; 
      setTotalFiles(targetFiles);
      const interval = setInterval(() => {
        setProcessedFiles((prev) => {
          if (prev >= targetFiles) return targetFiles;
          const increment = Math.ceil(Math.random() * 3);
          return Math.min(prev + increment, targetFiles);
        });
        setChunksEmbedded((prev) => prev + Math.ceil(Math.random() * 5));
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isIngesting]);
  useEffect(() => {
    let isMounted = true;
    const initialize = async () => {
      try {
        setIsIngesting(true);
        const existingThreads = await fetchChatThreads(userId, repo.name);
        if (existingThreads && existingThreads.length > 0) {
          if (isMounted) {
            setThreads(existingThreads);
            setActiveThreadId(existingThreads[0].id);
          }
        } else {
          const newThread = await createChatThread(userId, repo.name, "New Chat");
          if (isMounted) {
            setThreads([newThread]);
            setActiveThreadId(newThread.id);
          }
        }
        const owner = repo.owner ? repo.owner.login : repo.full_name.split("/")[0];
        const defaultBranch = repo.default_branch || "main";
        await ingestRepository(userId, repo.name, owner, defaultBranch);
        if (isMounted) {
          setProcessedFiles(totalFiles); 
          setTimeout(() => setIsIngesting(false), 800);
        }
      } catch (err) {
        console.error("Initialization failed:", err);
        if (isMounted) setIsIngesting(false);
      }
    };
    initialize();
    return () => { isMounted = false; };
  }, [userId, repo]);
  useEffect(() => {
    let isMounted = true;
    if (!activeThreadId) return;
    const loadMessages = async () => {
      try {
        const msgs = await fetchChatMessages(activeThreadId);
        if (isMounted) {
          if (msgs.length === 0) {
            setMessages([{
              id: "welcome", sender: "ai", text: `Hello! I've indexed **${repo.name}**. How can I help you understand this codebase today?`, latency: "0ms"
            }]);
          } else {
            setMessages(msgs);
          }
        }
      } catch (e) {
        console.error("Failed to load messages", e);
      }
    };
    loadMessages();
    return () => { isMounted = false; };
  }, [activeThreadId]);
  const handleSendMessage = async (questionText?: string) => {
    const q = questionText || inputQuestion;
    if (!q.trim() || isSending || isIngesting || !activeThreadId) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: q,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion("");
    setIsSending(true);
    const startTime = Date.now();
    try {
      const result = await chatWithCodebase(userId, activeThreadId, repo.name, q);
      const endTime = Date.now();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: result.answer || "I parsed the codebase context but could not generate a response.",
        sourceFiles: result.source || [],
        latency: `${endTime - startTime}ms`,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Sorry, I encountered an error communicating with the AI. Please check your connection.",
        latency: "Error",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsSending(false);
    }
  };
  const createNewThread = async () => {
    try {
      const newThread = await createChatThread(userId, repo.name, "New Chat");
      setThreads([newThread, ...threads]);
      setActiveThreadId(newThread.id);
    } catch (e) {
      console.error(e);
    }
  };
  const deleteThread = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteChatThread(id);
      const newThreads = threads.filter(t => t.id !== id);
      if (newThreads.length === 0) {
        const fallback = await createChatThread(userId, repo.name, "New Chat");
        setThreads([fallback]);
        setActiveThreadId(fallback.id);
      } else {
        setThreads(newThreads);
        if (activeThreadId === id) setActiveThreadId(newThreads[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };
  if (isIngesting) {
    const progressPercent = totalFiles > 0 ? Math.min((processedFiles / totalFiles) * 100, 100) : 0;
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center font-sans selection:bg-orange-300/30 selection:text-orange-200">
        <div className="max-w-md w-full px-6 flex flex-col items-center animate-fade text-center">
          <div className="w-14 h-14 rounded-2xl bg-card flex items-center justify-center mb-8 shadow-xl border border-border">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
          <h2 className="text-xl font-medium text-foreground mb-3">
            Indexing {repo.full_name || repo.name}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {processedFiles} of {totalFiles} files · {chunksEmbedded} chunks embedded
          </p>
          <div className="w-full max-w-[300px] h-1.5 bg-card rounded-full overflow-hidden mb-6 border border-border">
            <div 
              className="h-full bg-[#fdba74] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-muted-foreground text-sm">
            You can leave this page open — chat unlocks when indexing finishes.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="h-screen bg-[#000000] text-foreground flex font-sans selection:bg-orange-300/30 selection:text-orange-200 overflow-hidden">
      {isSidebarOpen && (
        <div className="hidden md:flex w-64 bg-background border-r border-border flex-col shrink-0 animate-fade">
          <div className="p-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2 font-medium text-sm text-secondary-foreground">
              <div className="w-5 h-5 rounded flex items-center justify-center bg-card border border-border">
                <MessageSquare className="w-3 h-3 text-muted-foreground" />
              </div>
              assistant-ui
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3 flex-1 flex flex-col">
            <button 
              onClick={createNewThread}
              className="w-full flex items-center gap-2 text-sm text-secondary-foreground hover:text-foreground hover:bg-card p-2 rounded-lg transition-colors cursor-pointer mb-4"
            >
              <Plus className="w-4 h-4" />
              New Thread
            </button>
            <div className="flex-1 overflow-y-auto space-y-1">
              {threads.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => setActiveThreadId(t.id)}
                  className={`flex items-center justify-between p-2 text-sm rounded-lg cursor-pointer transition-colors ${
                    activeThreadId === t.id 
                      ? "bg-card text-foreground border border-border" 
                      : "text-muted-foreground hover:bg-card/50 hover:text-secondary-foreground border border-transparent"
                  }`}
                >
                  <span className="truncate pr-2">{t.title}</span>
                  <button 
                    onClick={(e) => deleteThread(t.id, e)}
                    className="text-neutral-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={onBack}
              className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card p-2 mt-auto rounded-lg transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col relative bg-background">
        <div className="h-14 flex items-center px-4 border-b border-border shrink-0">
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-2 mr-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <PanelLeft className="w-4.5 h-4.5" />
            </button>
          )}
          <div className="flex items-center gap-2 text-sm font-medium text-secondary-foreground">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            {threads.find(t => t.id === activeThreadId)?.title || "Chat"}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 lg:px-24 xl:px-48 py-8 space-y-8 scroll-smooth">
          {messages.map((msg) => (
            <div key={msg.id} className="w-full flex flex-col">
              {msg.sender === "user" ? (
                <div className="self-end max-w-[80%] bg-muted text-foreground px-5 py-3 rounded-2xl rounded-tr-sm text-[15px] leading-relaxed shadow-sm">
                  {msg.text}
                </div>
              ) : (
                <div className="w-full self-start text-foreground text-[15px] leading-relaxed max-w-[100%] animate-rise">
                  <FormattedMarkdown content={msg.text} />
                  <div className="flex items-center gap-3 mt-3 text-muted-foreground">
                    <button className="hover:text-foreground transition-colors cursor-pointer" title="Copy">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="hover:text-foreground transition-colors cursor-pointer" title="Reload">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button className="hover:text-foreground transition-colors cursor-pointer" title="More">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {msg.latency && (
                      <span className="text-xs font-mono ml-1">{msg.latency}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {isSending && (
            <div className="w-full self-start text-muted-foreground text-[15px] animate-pulse flex items-center gap-2">
               <Loader2 className="w-4 h-4 animate-spin text-[#fdba74]" />
               Thinking...
            </div>
          )}
          <div ref={messagesEndRef} className="h-24" />
        </div>
        <div className="absolute bottom-6 left-0 right-0 px-6 lg:px-24 xl:px-48 flex justify-center">
          <div className="w-full max-w-4xl bg-muted rounded-[24px] border border-border p-2 flex flex-col shadow-2xl relative transition-all focus-within:border-[#fdba74]/50 focus-within:ring-1 focus-within:ring-[#fdba74]/20">
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isSending}
              placeholder="Send a message... (@ to mention, / for commands)"
              className="w-full bg-transparent text-foreground placeholder-neutral-500 text-[15px] px-4 py-3 focus:outline-none disabled:opacity-50"
            />
            <div className="flex items-center justify-between px-2 pt-1 pb-1">
              <div className="flex items-center gap-2">
                <button className="w-7 h-7 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground transition-colors cursor-pointer">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-secondary text-xs font-medium text-secondary-foreground transition-colors cursor-pointer">
                  <span className="w-3.5 h-3.5 rounded-full bg-neutral-700 flex items-center justify-center">
                    <span className="text-[8px]">✨</span>
                  </span>
                  Gemini 3.6 Flash
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground transition-colors cursor-pointer">
                  <Mic className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleSendMessage()}
                  disabled={!inputQuestion.trim() || isSending}
                  className="w-8 h-8 rounded-full bg-[#fdba74] hover:bg-[#fb923c] disabled:bg-secondary disabled:text-muted-foreground text-foreground flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed shadow-md"
                >
                  <ArrowLeft className="w-4 h-4 rotate-90" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


