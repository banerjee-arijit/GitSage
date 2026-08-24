package devPilot.server.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
public class GithubRepoDto {
    private Long id;
    private String name;
    @JsonProperty("full_name")
    private String fullName;
    private String description;
    @JsonProperty("html_url")
    private String htmlUrl;
    private String language;
    @JsonProperty("private")
    private boolean isPrivate;
    @JsonProperty("updated_at")
    private String updatedAt;
    public GithubRepoDto() {
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
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
    public String getUpdatedAt() {
        return updatedAt;
    }
    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
