package devPilot.server.entity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity
@Table(name = "repositories")
public class GithubRepo {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "github_repo_id", unique = true, nullable = false)
    private Long githubRepoId;
    @Column(name = "name", nullable = false)
    private String name;
    @Column(name = "full_name", nullable = false)
    private String fullName;
    @Column(name = "description", length = 1000)
    private String description;
    @Column(name = "html_url")
    private String htmlUrl;
    @Column(name = "language")
    private String language;
    @Column(name = "is_private")
    private boolean isPrivate;
    @Column(name = "is_analyzed")
    private boolean isAnalyzed = false;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(name = "created_at")
    private Instant createdAt;
    public GithubRepo() {
    }
    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
    public UUID getId() {
        return id;
    }
    public void setId(UUID id) {
        this.id = id;
    }
    public Long getGithubRepoId() {
        return githubRepoId;
    }
    public void setGithubRepoId(Long githubRepoId) {
        this.githubRepoId = githubRepoId;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getFullName() {
        return fullName;
    }
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public String getHtmlUrl() {
        return htmlUrl;
    }
    public void setHtmlUrl(String htmlUrl) {
        this.htmlUrl = htmlUrl;
    }
    public String getLanguage() {
        return language;
    }
    public void setLanguage(String language) {
        this.language = language;
    }
    public boolean isPrivate() {
        return isPrivate;
    }
    public void setPrivate(boolean aPrivate) {
        isPrivate = aPrivate;
    }
    public boolean isAnalyzed() {
        return isAnalyzed;
    }
    public void setAnalyzed(boolean analyzed) {
        isAnalyzed = analyzed;
    }
    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }
    public Instant getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
