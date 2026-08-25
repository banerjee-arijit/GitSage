import re

with open('e:/Personal_Projects/devLink/client/src/components/ChatWorkspace.tsx', 'r', encoding='utf-8') as f:
    cw = f.read()

# Add thinkingText state
if 'const [thinkingText' not in cw:
    cw = cw.replace('const [isSending, setIsSending] = useState(false);',
                    'const [isSending, setIsSending] = useState(false);\n  const [thinkingText, setThinkingText] = useState("Analyzing the codebase...");')

# Modify handleSendMessage
old_handle_send = '''  const handleSendMessage = async (questionText?: string) => {
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
        latency: ${endTime - startTime}ms,
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
  };'''

new_handle_send = '''  const handleSendMessage = async (questionText?: string) => {
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
        latency: ${endTime - startTime}ms,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsSending(false);

      const fullText = result.answer || "I parsed the codebase context but could not generate a response.";
      let currentIdx = 0;
      const chunkSize = Math.max(1, Math.floor(fullText.length / 60)); // finish in ~1-2 secs
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
      }, 25);
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
  };'''

cw = cw.replace(old_handle_send, new_handle_send)

# Disable send button when thinking
cw = cw.replace('disabled={!inputQuestion.trim() || isSending}', 'disabled={!inputQuestion.trim() || isSending}')

# Change "Thinking..." to {thinkingText}
cw = cw.replace('''<div className="w-full self-start text-neutral-400 text-[15px] animate-pulse flex items-center gap-2">
                 <Loader2 className="w-4 h-4 animate-spin text-orange-300" />
                 Thinking...
              </div>''',
'''<div className="w-full self-start text-neutral-400 text-[15px] animate-pulse flex items-center gap-2">
                 <Loader2 className="w-4 h-4 animate-spin text-orange-300" />
                 {thinkingText}
              </div>''')

# Fix layout for input box (static at bottom instead of absolute)
cw = cw.replace('<div ref={messagesEndRef} className="h-24" />', '<div ref={messagesEndRef} className="h-6" />')

old_input_container = '''<div className="absolute bottom-6 left-0 right-0 px-4 sm:px-6 lg:px-24 xl:px-48 flex justify-center w-full">'''
new_input_container = '''<div className="p-4 sm:p-6 lg:px-24 xl:px-48 flex justify-center w-full shrink-0 bg-[#050505]">'''
cw = cw.replace(old_input_container, new_input_container)

with open('e:/Personal_Projects/devLink/client/src/components/ChatWorkspace.tsx', 'w', encoding='utf-8') as f:
    f.write(cw)
