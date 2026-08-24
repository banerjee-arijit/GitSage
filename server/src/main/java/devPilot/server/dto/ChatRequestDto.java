package devPilot.server.dto;
import java.util.UUID;
public class ChatRequestDto {
    private String repoName;
    private String question;
    private UUID threadId;
    public ChatRequestDto() {
    }
    public ChatRequestDto(String repoName, String question, UUID threadId) {
        this.repoName = repoName;
        this.question = question;
        this.threadId = threadId;
    }
    public String getRepoName() {
        return repoName;
    }
    public void setRepoName(String repoName) {
        this.repoName = repoName;
    }
    public String getQuestion() {
        return question;
    }
    public void setQuestion(String question) {
        this.question = question;
    }
    public UUID getThreadId() {
        return threadId;
    }
    public void setThreadId(UUID threadId) {
        this.threadId = threadId;
    }
}

