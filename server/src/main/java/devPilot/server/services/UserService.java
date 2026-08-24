package devPilot.server.services;
import java.util.UUID;
import org.springframework.security.oauth2.core.user.OAuth2User;
import devPilot.server.dto.UserDto;
public interface UserService {
    UserDto getUserById(UUID userId);
    UserDto getUserByGithubId(Long githubId);
    UserDto getUserByGithubUsername(String githubUsername);
    UserDto processOAuthPostLogin(OAuth2User oAuth2User, String accessToken);
}

