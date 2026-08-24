package devPilot.server.repository;
import devPilot.server.entity.ChatThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;
@Repository
public interface ChatThreadRepo extends JpaRepository<ChatThread, UUID> {
    List<ChatThread> findByUserIdAndRepoNameOrderByCreatedAtDesc(UUID userId, String repoName);
}

