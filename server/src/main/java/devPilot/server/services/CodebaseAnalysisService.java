package devPilot.server.services;
import devPilot.server.dto.ChatResponseDto;
import devPilot.server.entity.ChatThread;
import devPilot.server.entity.ChatMessage;
import java.util.List;
import java.util.UUID;
public interface CodebaseAnalysisService {
    void analyzeRepository(UUID userId, String owner, String repoName, String defaultBranch);
    ChatThread createThread(UUID userId, String repoName, String title);
    List<ChatThread> getThreads(UUID userId, String repoName);
    void deleteThread(UUID threadId);
    List<ChatMessage> getMessages(UUID threadId);
    ChatResponseDto chatWithCodebase(UUID userId, UUID threadId, String repoName, String question, String customApiKey);
}

