package devPilot.server.services;
import devPilot.server.dto.ChatResponseDto;
import devPilot.server.entity.ChatMessage;
import devPilot.server.entity.ChatThread;
import devPilot.server.entity.User;
import devPilot.server.repository.ChatMessageRepo;
import devPilot.server.repository.ChatThreadRepo;
import devPilot.server.repository.UserRepo;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
@Service
public class CodebaseAnalysisServiceImpl implements CodebaseAnalysisService {
    private final UserRepo userRepo;
    private final ChatThreadRepo threadRepo;
    private final ChatMessageRepo messageRepo;
    private final ChatClient chatClient;
    private final RestClient restClient;
    private final Map<String, List<Document>> repoDocumentStore = new ConcurrentHashMap<>();
    @Autowired
    public CodebaseAnalysisServiceImpl(
            UserRepo userRepo,
            ChatThreadRepo threadRepo,
            ChatMessageRepo messageRepo,
            ChatClient.Builder chatClientBuilder
    ) {
        this.userRepo = userRepo;
        this.threadRepo = threadRepo;
        this.messageRepo = messageRepo;
        this.chatClient = chatClientBuilder.build();
        this.restClient = RestClient.builder()
                .baseUrl("https://api.github.com")
                .defaultHeader("User-Agent", "devLink-App")
                .build();
    }
    @Override
    public void analyzeRepository(UUID userId, String owner, String repoName, String defaultBranch) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String branch = (defaultBranch != null && !defaultBranch.isEmpty()) ? defaultBranch : "main";
        Map<String, Object> response = restClient.get()
                .uri("/repos/{owner}/{repo}/git/trees/{branch}?recursive=1", owner, repoName, branch)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + user.getAccessToken())
                .retrieve()
                .body(Map.class);
        if (response == null || !response.containsKey("tree")) {
            return;
        }
        List<Map<String, Object>> tree = (List<Map<String, Object>>) response.get("tree");
        List<Document> documents = new ArrayList<>();
        for (Map<String, Object> item : tree) {
            String type = (String) item.get("type");
            String path = (String) item.get("path");
            if ("blob".equals(type) && isCodeFile(path)) {
                try {
                    String content = restClient.get()
                            .uri("/repos/{owner}/{repo}/contents/{path}?ref={branch}", owner, repoName, path, branch)
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + user.getAccessToken())
                            .header("Accept", "application/vnd.github.v3.raw")
                            .retrieve()
                            .body(String.class);
                    if (content != null && !content.trim().isEmpty()) {
                        Map<String, Object> metadata = new HashMap<>();
                        metadata.put("path", path);
                        metadata.put("repoName", repoName);
                        metadata.put("userId", userId.toString());
                        documents.add(new Document(content, metadata));
                    }
                } catch (Exception e) {
                    System.err.println("Skipping file " + path + ": " + e.getMessage());
                }
            }
        }
        String repoKey = userId.toString() + ":" + repoName;
        repoDocumentStore.put(repoKey, documents);
    }
    @Override
    public ChatThread createThread(UUID userId, String repoName, String title) {
        ChatThread thread = new ChatThread();
        thread.setUserId(userId);
        thread.setRepoName(repoName);
        thread.setTitle(title);
        return threadRepo.save(thread);
    }
    @Override
    public List<ChatThread> getThreads(UUID userId, String repoName) {
        return threadRepo.findByUserIdAndRepoNameOrderByCreatedAtDesc(userId, repoName);
    }
    @Override
    public void deleteThread(UUID threadId) {
        List<ChatMessage> messages = messageRepo.findByThreadIdOrderByCreatedAtAsc(threadId);
        messageRepo.deleteAll(messages);
        threadRepo.deleteById(threadId);
    }
    @Override
    public List<ChatMessage> getMessages(UUID threadId) {
        return messageRepo.findByThreadIdOrderByCreatedAtAsc(threadId);
    }
    @Override
    public ChatResponseDto chatWithCodebase(UUID userId, UUID threadId, String repoName, String question, String customApiKey) {
        String repoKey = userId.toString() + ":" + repoName;
        List<Document> docs = repoDocumentStore.getOrDefault(repoKey, Collections.emptyList());
        ChatMessage userMsg = new ChatMessage();
        userMsg.setThreadId(threadId);
        userMsg.setSender("user");
        userMsg.setText(question);
        messageRepo.save(userMsg);
        if (docs.isEmpty()) {
            docs = repoDocumentStore.entrySet().stream()
                    .filter(e -> e.getKey().startsWith(userId.toString()))
                    .flatMap(e -> e.getValue().stream())
                    .collect(Collectors.toList());
        }
        long startTime = System.currentTimeMillis();
        List<Document> relevantDocs = getRelevantDocs(docs, question, 10);
        String codeContext = relevantDocs.stream()
                .map(doc -> "File: " + doc.getMetadata().getOrDefault("path", "unknown") + "\n```\n" + doc.getText() + "\n```")
                .collect(Collectors.joining("\n\n"));
        List<String> citedFiles = relevantDocs.stream()
                .map(doc -> (String) doc.getMetadata().get("path"))
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        String prompt = "You are an expert, friendly AI assistant helping users understand the project '" + repoName + "'.\n\n"
                + "Below is the relevant code context from the repository:\n"
                + (codeContext.isEmpty() ? "No code context indexed yet." : codeContext) + "\n\n"
                + "User Question: " + question + "\n\n"
                + "Instructions:\n"
                + "1. Explain the answer in simple, clear, professional English so anyone can easily understand.\n"
                + "2. Format your response beautifully using Markdown: use bold titles for key concepts, numbered steps or bullet points, and code blocks for code snippets.\n"
                + "3. Mention relevant file names naturally in your explanation.";
        String aiAnswer;
        try {
            ChatClient activeClient = this.chatClient;
            if (customApiKey != null && !customApiKey.isEmpty()) {
                org.springframework.ai.openai.api.OpenAiApi openAiApi = 
                        new org.springframework.ai.openai.api.OpenAiApi("https://generativelanguage.googleapis.com/v1beta/openai", customApiKey);
                org.springframework.ai.openai.OpenAiChatOptions options = 
                        org.springframework.ai.openai.OpenAiChatOptions.builder().model("gemini-3.6-flash").build();
                org.springframework.ai.openai.OpenAiChatModel dynamicChatModel = 
                        new org.springframework.ai.openai.OpenAiChatModel(openAiApi, options);
                activeClient = ChatClient.builder(dynamicChatModel).build();
            }
            aiAnswer = activeClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
        } catch (Exception e) {
            System.err.println("Gemini AI API Error: " + e.getMessage());
            aiAnswer = "⚠️ **Gemini API Error**: Could not connect to Google Gemini API. "
                    + "Please verify that your API key is valid.\n\n"
                    + "*(Technical Error: " + e.getMessage() + ")*";
        }
        long endTime = System.currentTimeMillis();
        String latency = (endTime - startTime) + "ms";
        ChatMessage aiMsg = new ChatMessage();
        aiMsg.setThreadId(threadId);
        aiMsg.setSender("ai");
        aiMsg.setText(aiAnswer);
        aiMsg.setSourceFiles(String.join(",", citedFiles));
        aiMsg.setLatency(latency);
        messageRepo.save(aiMsg);
        ChatResponseDto response = new ChatResponseDto();
        response.setAnswer(aiAnswer);
        response.setSource(citedFiles);
        return response;
    }
    private List<Document> getRelevantDocs(List<Document> docs, String question, int topK) {
        if (docs.isEmpty()) return Collections.emptyList();
        if (docs.size() <= topK) return docs;
        String[] keywords = question.toLowerCase().split("\\W+");
        Map<Document, Integer> scoreMap = new HashMap<>();
        for (Document doc : docs) {
            String path = ((String) doc.getMetadata().getOrDefault("path", "")).toLowerCase();
            String text = (doc.getText() != null ? doc.getText() : "").toLowerCase();
            int score = 0;
            for (String kw : keywords) {
                if (kw.length() < 3) continue;
                if (path.contains(kw)) score += 5;
                if (text.contains(kw)) score += 1;
            }
            scoreMap.put(doc, score);
        }
        return docs.stream()
                .sorted((d1, d2) -> Integer.compare(scoreMap.getOrDefault(d2, 0), scoreMap.getOrDefault(d1, 0)))
                .limit(topK)
                .collect(Collectors.toList());
    }
    private boolean isCodeFile(String path) {
        if (path == null) return false;
        String lower = path.toLowerCase();
        if (lower.contains("node_modules/") || lower.contains(".git/") || lower.contains("target/") || lower.contains("dist/")) {
            return false;
        }
        return lower.endsWith(".java") || lower.endsWith(".js") || lower.endsWith(".ts")
                || lower.endsWith(".tsx") || lower.endsWith(".jsx") || lower.endsWith(".py")
                || lower.endsWith(".json") || lower.endsWith(".html") || lower.endsWith(".css")
                || lower.endsWith(".xml") || lower.endsWith(".properties") || lower.endsWith(".md");
    }
}


