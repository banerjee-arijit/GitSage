package devPilot.server.repository;
import devPilot.server.entity.GithubRepo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
public interface GithubRepoRepository extends JpaRepository<GithubRepo, UUID> {
    List<GithubRepo> findByUserId(UUID userId);
    Optional<GithubRepo> findByGithubRepoId(Long githubRepoId);
}

