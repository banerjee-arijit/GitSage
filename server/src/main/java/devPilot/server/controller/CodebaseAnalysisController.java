package devPilot.server.controller;
import devPilot.server.dto.AnalysisRequestDto;
import devPilot.server.dto.ChatRequestDto;
import devPilot.server.dto.ChatResponseDto;
import devPilot.server.entity.ChatMessage;
import devPilot.server.entity.ChatThread;
import devPilot.server.services.CodebaseAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;
@RestController
@RequestMapping("/api/analysis")
@CrossOrigin(origins = "http://localhost:5173")
public class CodebaseAnalysisController {
    private final CodebaseAnalysisService codebaseAnalysisService;
    @Autowired
    public CodebaseAnalysisController(CodebaseAnalysisService codebaseAnalysisService) {
        this.codebaseAnalysisService = codebaseAnalysisService;
    }
    @PostMapping("/ingest/{userId}")
    public ResponseEntity<Map<String, String>> analyzeRepository(
            @PathVariable UUID userId,
            @RequestBody AnalysisRequestDto requestDto
    ) {
        try {
            String repoFullName = requestDto.getRepoName();
            String owner = requestDto.getOwnerName();
            String repo = repoFullName;
            if (repoFullName != null && repoFullName.contains("/")) {
                String[] parts = repoFullName.split("/");
                if (owner == null || owner.isEmpty()) {
                    owner = parts[0];
                }
                repo = parts[1];
            }
            codebaseAnalysisService.analyzeRepository(
                    userId,
                    owner,
                    repo,
                    requestDto.getDefualtBranch() != null ? requestDto.getDefualtBranch() : "main"
            );
            return ResponseEntity.ok(Map.of("message", "Repository codebase indexed successfully into VectorStore"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Ingestion failed"));
        }
    }
    @PostMapping("/chat/{userId}")
    public ResponseEntity<ChatResponseDto> chatWithCodebase(
            @PathVariable UUID userId,
            @RequestBody ChatRequestDto requestDto,
            @RequestHeader(value = "X-Gemini-API-Key", required = false) String customApiKey
    ) {
        try {
            ChatResponseDto response = codebaseAnalysisService.chatWithCodebase(
                    userId,
                    requestDto.getThreadId(),
                    requestDto.getRepoName(),
                    requestDto.getQuestion(),
                    customApiKey
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            ChatResponseDto errResponse = new ChatResponseDto();
            errResponse.setAnswer("Error communicating with Gemini AI: " + e.getMessage());
            errResponse.setSource(List.of());
            return ResponseEntity.ok(errResponse);
        }
    }
    @PostMapping("/thread/{userId}/{repoName}")
    public ResponseEntity<ChatThread> createThread(
            @PathVariable UUID userId,
            @PathVariable String repoName,
            @RequestBody Map<String, String> body
    ) {
        String title = body.getOrDefault("title", "New Chat");
        ChatThread thread = codebaseAnalysisService.createThread(userId, repoName, title);
        return ResponseEntity.ok(thread);
    }
    @GetMapping("/threads/{userId}/{repoName}")
    public ResponseEntity<List<ChatThread>> getThreads(
            @PathVariable UUID userId,
            @PathVariable String repoName
    ) {
        List<ChatThread> threads = codebaseAnalysisService.getThreads(userId, repoName);
        return ResponseEntity.ok(threads);
    }
    @GetMapping("/thread/{threadId}/messages")
    public ResponseEntity<List<ChatMessage>> getMessages(@PathVariable UUID threadId) {
        List<ChatMessage> messages = codebaseAnalysisService.getMessages(threadId);
        return ResponseEntity.ok(messages);
    }
    @DeleteMapping("/thread/{threadId}")
    public ResponseEntity<Void> deleteThread(@PathVariable UUID threadId) {
        codebaseAnalysisService.deleteThread(threadId);
        return ResponseEntity.ok().build();
    }
}

