package devPilot.server.entity;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import jakarta.persistence.*;
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "github_id", unique = true, nullable = false)
    private Long githubId;
    @Column(name = "github_username", unique = true, nullable = false)
    private String githubUsername;
    @Column(name = "display_name", nullable = false)
    private String displayName;
    @Column(name = "avatar_url")
    private String avatarUrl;
    @Column(name = "access_token")
    private String accessToken;
    @Column(name = "token_scopes")
    private String tokenScopes;
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GithubRepo> repositories = new ArrayList<>();
    @Column(name = "created_at")
    private Instant createdAt;
    public User() {
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
    public Long getGithubId() {
        return githubId;
    }
    public void setGithubId(Long githubId) {
        this.githubId = githubId;
    }
    public String getGithubUsername() {
        return githubUsername;
    }
    public void setGithubUsername(String githubUsername) {
        this.githubUsername = githubUsername;
    }
    public String getDisplayName() {
        return displayName;
    }
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
    public String getAvatarUrl() {
        return avatarUrl;
    }
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
    public String getAccessToken() {
        return accessToken;
    }
    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
    public String getTokenScopes() {
        return tokenScopes;
    }
    public void setTokenScopes(String tokenScopes) {
        this.tokenScopes = tokenScopes;
    }
    public List<GithubRepo> getRepositories() {
        return repositories;
    }
    public void setRepositories(List<GithubRepo> repositories) {
        this.repositories = repositories;
    }
    public Instant getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
