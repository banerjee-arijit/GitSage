package devPilot.server.controller;
import devPilot.server.dto.GithubRepoDto;
import devPilot.server.entity.GithubRepo;
import devPilot.server.services.GithubService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
@RestController
@RequestMapping("/api/repos")
@CrossOrigin(origins = "*")
public class GithubRepoController {
    private  final GithubService githubService;
    public GithubRepoController(GithubService githubService) {
        this.githubService = githubService;
    }
    @GetMapping("/github/{userId}")
    public ResponseEntity<List<GithubRepoDto>> fetchGithubRepos(@PathVariable UUID userId) {
        return ResponseEntity.ok(githubService.fetchAllReposFromGithub(userId));
    }
    @PostMapping("/save/{userId}")
    public ResponseEntity<GithubRepo> saveRepo(@PathVariable UUID userId, @RequestBody GithubRepoDto repoDto) {
        return ResponseEntity.ok(githubService.saveRepository(userId, repoDto));
    }
    @GetMapping("/saved/{userId}")
    public ResponseEntity<List<GithubRepo>> getSavedRepos(@PathVariable UUID userId) {
        return ResponseEntity.ok(githubService.getSavedRepositories(userId));
    }
}

