package devPilot.server.services;
import devPilot.server.dto.GithubRepoDto;
import devPilot.server.entity.GithubRepo;
import devPilot.server.entity.User;
import devPilot.server.exception.UserNotFoundException;
import devPilot.server.repository.GithubRepoRepository;
import devPilot.server.repository.UserRepo;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.List;
import java.util.UUID;
@Service
public class GithubServiceImpl implements GithubService {
    private final UserRepo userRepo;
    private final GithubRepoRepository githubRepoRepository;
    private final RestClient restClient;
    public GithubServiceImpl(UserRepo userRepo, GithubRepoRepository githubRepoRepository) {
        this.userRepo = userRepo;
        this.githubRepoRepository = githubRepoRepository;
        this.restClient = RestClient.builder().baseUrl("https://api.github.com").build();
    }
    @Override
    public List<GithubRepoDto> fetchAllReposFromGithub(UUID userUuid) {
        User user = userRepo.findById(userUuid).orElseThrow(() -> new UserNotFoundException("User not found"));
        return restClient.get()
                .uri("/user/repos?visibility=all&sort=updated&per_page=100")
                .header("Authorization", "Bearer " + user.getAccessToken())
                .header("User-Agent", "devLink-App")
                .header("Accept", "application/vnd.github.v3+json")
                .retrieve()
                .body(new ParameterizedTypeReference<List<GithubRepoDto>>() {});
    }
    @Override
    public GithubRepo saveRepository(UUID userUuid, GithubRepoDto githubRepoDto) {
        User user = userRepo.findById(userUuid)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userUuid));
        Long repoId = githubRepoDto.getId() != null ? githubRepoDto.getId() : (long) Math.abs(githubRepoDto.getFullName() != null ? githubRepoDto.getFullName().hashCode() : System.currentTimeMillis());
        return githubRepoRepository.findByGithubRepoId(repoId)
                .orElseGet(() -> {
                    GithubRepo repo = new GithubRepo();
                    repo.setGithubRepoId(repoId);
                    String fullName = githubRepoDto.getFullName() != null ? githubRepoDto.getFullName() : githubRepoDto.getName();
                    String name = githubRepoDto.getName() != null ? githubRepoDto.getName() : fullName;
                    if (fullName == null) fullName = "unknown/repository";
                    if (name == null) name = "repository";
                    repo.setName(name);
                    repo.setFullName(fullName);
                    repo.setDescription(githubRepoDto.getDescription());
                    repo.setHtmlUrl(githubRepoDto.getHtmlUrl());
                    repo.setLanguage(githubRepoDto.getLanguage());
                    repo.setPrivate(githubRepoDto.isPrivate());
                    repo.setUser(user);
                    return githubRepoRepository.save(repo);
                });
    }
    @Override
    public List<GithubRepo> getSavedRepositories(UUID userUuid) {
        return githubRepoRepository.findByUserId(userUuid);
    }
}

