import os

with open('e:/Personal_Projects/devLink/client/src/components/ChatWorkspace.tsx', 'r', encoding='utf-8') as f:
    cw = f.read()

# Let's find the indices of the start and end of handleSendMessage
start_idx = cw.find('const handleSendMessage = async (questionText?: string) => {')
if start_idx != -1:
    end_str = 'setIsSending(false);\n    }\n  };'
    end_idx = cw.find(end_str, start_idx)
    
    if end_idx != -1:
        end_idx += len(end_str)
        
        new_handle_send = '''const handleSendMessage = async (questionText?: string) => {
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
  };'''

        cw = cw[:start_idx] + new_handle_send + cw[end_idx:]
        
        with open('e:/Personal_Projects/devLink/client/src/components/ChatWorkspace.tsx', 'w', encoding='utf-8') as f:
            f.write(cw)
        print("Successfully replaced block")
    else:
        print("End string not found!")
else:
    print("Start string not found!")
