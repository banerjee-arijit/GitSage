package devPilot.server.dto;
import java.util.UUID;
public class UserDto {
    private UUID id;
    private Long githubId;
    private String githubUsername;
    private String displayName;
    private String avatarUrl;
    public UserDto() {
    }
    public UserDto(UUID id, Long githubId, String githubUsername, String displayName, String avatarUrl) {
        this.id = id;
        this.githubId = githubId;
        this.githubUsername = githubUsername;
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
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
}

