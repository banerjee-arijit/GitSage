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
  const [thinkingText, setThinkingText] = useState("Analyzing the codebase...");
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
    
    setThinkingText("Analyzing the codebase...");
    let seconds = 0;
    const thinkInterval = setInterval(() => {
      seconds++;
      if (seconds === 3) setThinkingText("Generating the response...");
      else if (seconds === 6) setThinkingText("Taking a bit longer than usual...");
      else if (seconds === 10) setThinkingText("Almost there...");
    }, 1000);

    const startTime = Date.now();
    try {
      const result = await chatWithCodebase(userId, activeThreadId, repo.name, q);
      clearInterval(thinkInterval);
      const endTime = Date.now();
      
      const aiMsgId = (Date.now() + 1).toString();
      const aiMsg: Message = {
        id: aiMsgId,
        sender: "ai",
        text: "",
        sourceFiles: result.source || [],
        latency: `${endTime - startTime}ms`,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsSending(false);

      const fullText = result.answer || "I parsed the codebase context but could not generate a response.";
      let currentIdx = 0;
      const chunkSize = Math.max(1, Math.floor(fullText.length / 40)); 
      const typeInterval = setInterval(() => {
        currentIdx += chunkSize;
        if (currentIdx >= fullText.length) {
          currentIdx = fullText.length;
          clearInterval(typeInterval);
        }
        setMessages((prev) => 
          prev.map((m) => 
            m.id === aiMsgId ? { ...m, text: fullText.slice(0, currentIdx) } : m
          )
        );
      }, 30);
    } catch (error) {
      clearInterval(thinkInterval);
      console.error("Chat error:", error);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Sorry, I encountered an error communicating with the AI. Please check your connection.",
        latency: "Error",
      };
      setMessages((prev) => [...prev, aiMsg]);
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
      <div className="min-h-screen bg-[#050505] text-[#fafafa] flex flex-col items-center justify-center font-sans selection:bg-orange-300/30 selection:text-orange-200">
        <div className="max-w-md w-full px-6 flex flex-col items-center animate-fade text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#141414] flex items-center justify-center mb-8 shadow-xl border border-white/5">
            <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
          </div>
          <h2 className="text-xl font-medium text-white mb-3">
            Indexing {repo.full_name || repo.name}
          </h2>
          <p className="text-[#a1a1aa] text-sm mb-6">
            {processedFiles} of {totalFiles} files · {chunksEmbedded} chunks embedded
          </p>
          <div className="w-full max-w-[300px] h-1.5 bg-[#141414] rounded-full overflow-hidden mb-6 border border-white/5">
            <div 
              className="h-full bg-[#fdba74] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[#71717a] text-sm">
            You can leave this page open — chat unlocks when indexing finishes.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="h-screen bg-[#000000] text-[#fafafa] flex font-sans selection:bg-orange-300/30 selection:text-orange-200 overflow-hidden">
      {isSidebarOpen && (
        <div className="hidden md:flex w-64 bg-[#050505] border-r border-[#1a1a1a] flex-col shrink-0 animate-fade">
          <div className="p-4 flex items-center justify-between border-b border-[#1a1a1a]">
            <div className="flex items-center gap-2 font-medium text-sm text-neutral-200">
              <div className="w-5 h-5 rounded flex items-center justify-center bg-[#141414] border border-[#262626]">
                <MessageSquare className="w-3 h-3 text-neutral-400" />
              </div>
              assistant-ui
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="text-neutral-400 hover:text-white transition-colors cursor-pointer">
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3 flex-1 flex flex-col">
            <button 
              onClick={createNewThread}
              className="w-full flex items-center gap-2 text-sm text-neutral-300 hover:text-white hover:bg-[#141414] p-2 rounded-lg transition-colors cursor-pointer mb-4"
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
                      ? "bg-[#141414] text-white border border-[#262626]" 
                      : "text-neutral-400 hover:bg-[#141414]/50 hover:text-neutral-200 border border-transparent"
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
              className="w-full flex items-center gap-2 text-sm text-neutral-400 hover:text-white hover:bg-[#141414] p-2 mt-auto rounded-lg transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col relative bg-[#050505] min-w-0 w-full">
        <div className="h-14 flex items-center px-4 border-b border-[#1a1a1a] shrink-0">
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-2 mr-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <PanelLeft className="w-4.5 h-4.5" />
            </button>
          )}
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-200">
            <MessageSquare className="w-4 h-4 text-neutral-400" />
            {threads.find(t => t.id === activeThreadId)?.title || "Chat"}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 lg:px-24 xl:px-48 py-8 space-y-8 scroll-smooth">
          {messages.map((msg) => (
            <div key={msg.id} className="w-full flex flex-col">
              {msg.sender === "user" ? (
                <div className="self-end max-w-[80%] bg-[#1e1e1e] text-white px-5 py-3 rounded-2xl rounded-tr-sm text-[15px] leading-relaxed shadow-sm">
                  {msg.text}
                </div>
              ) : (
                <div className="w-full self-start text-[#e5e5e5] text-[15px] leading-relaxed max-w-[100%] animate-rise">
                  <FormattedMarkdown content={msg.text} />
                  <div className="flex items-center gap-3 mt-3 text-neutral-400">
                    <button className="hover:text-white transition-colors cursor-pointer" title="Copy">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="hover:text-white transition-colors cursor-pointer" title="Reload">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button className="hover:text-white transition-colors cursor-pointer" title="More">
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
            <div className="w-full self-start text-neutral-400 text-[15px] animate-pulse flex items-center gap-2">
               <Loader2 className="w-4 h-4 animate-spin text-orange-300" />
               {thinkingText}
            </div>
          )}
          <div ref={messagesEndRef} className="h-24" />
        </div>
        <div className="absolute bottom-6 left-0 right-0 px-4 sm:px-6 lg:px-24 xl:px-48 flex justify-center w-full">
          <div className="w-full max-w-4xl bg-[#18181b] rounded-[24px] border border-[#2a2a2a] p-2 flex flex-col shadow-2xl relative transition-all focus-within:border-[#fdba74]/50 focus-within:ring-1 focus-within:ring-[#fdba74]/20">
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isSending}
              placeholder="Send a message... (@ to mention, / for commands)"
              className="w-full bg-transparent text-white placeholder-neutral-500 text-base sm:text-[15px] px-4 py-3 focus:outline-none disabled:opacity-50"
            />
            <div className="flex items-center justify-between px-2 pt-1 pb-1">
              <div className="flex items-center gap-2">
                <button className="w-7 h-7 rounded-full hover:bg-[#27272a] flex items-center justify-center text-neutral-400 transition-colors cursor-pointer">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#27272a] text-xs font-medium text-neutral-300 transition-colors cursor-pointer">
                  <span className="w-3.5 h-3.5 rounded-full bg-neutral-700 flex items-center justify-center">
                    <span className="text-[8px]">✨</span>
                  </span>
                  Gemini 3.6 Flash
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full hover:bg-[#27272a] flex items-center justify-center text-neutral-400 transition-colors cursor-pointer">
                  <Mic className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleSendMessage()}
                  disabled={!inputQuestion.trim() || isSending}
                  className="w-8 h-8 rounded-full bg-[#fdba74] hover:bg-[#fb923c] disabled:bg-[#27272a] disabled:text-neutral-400 text-white flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed shadow-md"
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

