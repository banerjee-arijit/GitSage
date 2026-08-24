package devPilot.server.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
@Entity
@Table(name = "chat_message")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false)
    private UUID threadId;
    @Column(nullable = false)
    private String sender; // "user" or "ai"
    @Column(columnDefinition = "TEXT", nullable = false)
    private String text;
    @Column(columnDefinition = "TEXT")
    private String sourceFiles; // Comma separated list of files
    private String latency;
    @Column(nullable = false)
    private LocalDateTime createdAt;
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    public UUID getId() {
        return id;
    }
    public void setId(UUID id) {
        this.id = id;
    }
    public UUID getThreadId() {
        return threadId;
    }
    public void setThreadId(UUID threadId) {
        this.threadId = threadId;
    }
    public String getSender() {
        return sender;
    }
    public void setSender(String sender) {
        this.sender = sender;
    }
    public String getText() {
        return text;
    }
    public void setText(String text) {
        this.text = text;
    }
    public String getSourceFiles() {
        return sourceFiles;
    }
    public void setSourceFiles(String sourceFiles) {
        this.sourceFiles = sourceFiles;
    }
    public String getLatency() {
        return latency;
    }
    public void setLatency(String latency) {
        this.latency = latency;
    }
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

