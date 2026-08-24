package devPilot.server.services;
import devPilot.server.dto.GithubRepoDto;
import devPilot.server.entity.GithubRepo;
import java.util.List;
import java.util.UUID;
public interface GithubService {
    List<GithubRepoDto>fetchAllReposFromGithub(UUID userUuid);
    GithubRepo saveRepository(UUID userUuid,GithubRepoDto githubRepoDto);
    List<GithubRepo>getSavedRepositories(UUID userUuid);
}

