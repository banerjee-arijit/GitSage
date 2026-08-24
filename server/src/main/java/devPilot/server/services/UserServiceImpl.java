package devPilot.server.services;
import devPilot.server.entity.User;
import devPilot.server.exception.UserNotFoundException;
import devPilot.server.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.core.user.OAuth2User;
import devPilot.server.dto.UserDto;
import devPilot.server.repository.UserRepo;
import org.springframework.stereotype.Service;
import java.util.UUID;
@Service
public class UserServiceImpl implements UserService {
    private final UserRepo userRepository;
    private final UserMapper userMapper;
    @Autowired
    public UserServiceImpl(UserRepo userRepository, UserMapper userMapper) {
        this.userMapper = userMapper;
        this.userRepository = userRepository;
    }
    @Override
    public UserDto getUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id " + userId));
        return userMapper.toDto(user);
    }
    @Override
    public UserDto getUserByGithubId(Long githubId) {
        User existedUser = userRepository.findByGithubId(githubId);
        if (existedUser == null) {
            throw new UserNotFoundException("User not found with the githubId " + githubId);
        }
        return userMapper.toDto(existedUser);
    }
    @Override
    public UserDto getUserByGithubUsername(String githubUsername) {
        User existedUser = userRepository.findByGithubUsername(githubUsername);
        if (existedUser == null) {
            throw new UserNotFoundException("User not found with the githubUsername " + githubUsername);
        }
        return userMapper.toDto(existedUser);
    }
    @Override
    public UserDto processOAuthPostLogin(OAuth2User oAuth2User, String accessToken) {
        Object idAttr = oAuth2User.getAttribute("id");
        Long githubId = idAttr != null ? Long.valueOf(idAttr.toString()) : null;
        String githubUsername = oAuth2User.getAttribute("login");
        String displayName = oAuth2User.getAttribute("name");
        String avatarUrl = oAuth2User.getAttribute("avatar_url");
        if (githubId == null || githubUsername == null) {
            throw new IllegalArgumentException("GitHub user ID or username missing from OAuth response");
        }
        User user = userRepository.findByGithubId(githubId);
        if (user == null) {
            user = new User();
            user.setGithubId(githubId);
        }
        user.setGithubUsername(githubUsername);
        user.setDisplayName(displayName != null ? displayName : githubUsername);
        user.setAvatarUrl(avatarUrl);
        user.setAccessToken(accessToken);
        user.setTokenScopes("read:user,repo");
        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }
}

