package devPilot.server.repository;
import java.util.Optional;
import java.util.UUID;
import devPilot.server.dto.UserDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import devPilot.server.entity.User;
@Repository
public interface UserRepo extends JpaRepository<User, UUID> {
    User findByGithubId(Long githubId);
    User findByGithubUsername(String githubUsername);
}

