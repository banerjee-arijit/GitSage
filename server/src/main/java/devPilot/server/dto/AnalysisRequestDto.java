package devPilot.server.dto;
public class AnalysisRequestDto {
    private String repoName;
    private String ownerName;
    private String defualtBranch;
    public AnalysisRequestDto() {
    }
    public AnalysisRequestDto(String repoName, String ownerName, String defualtBranch) {
        this.repoName = repoName;
        this.ownerName = ownerName;
        this.defualtBranch = defualtBranch;
    }
    public String getRepoName() {
        return repoName;
    }
    public void setRepoName(String repoName) {
        this.repoName = repoName;
    }
    public String getOwnerName() {
        return ownerName;
    }
    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }
    public String getDefualtBranch() {
        return defualtBranch;
    }
    public void setDefualtBranch(String defualtBranch) {
        this.defualtBranch = defualtBranch;
    }
}

