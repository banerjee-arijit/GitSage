package devPilot.server.mapper;
import devPilot.server.dto.UserDto;
import devPilot.server.entity.User;
import org.springframework.stereotype.Component;
@Component
public class UserMapper {
    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setGithubId(user.getGithubId());
        dto.setGithubUsername(user.getGithubUsername());
        dto.setDisplayName(user.getDisplayName());
        dto.setAvatarUrl(user.getAvatarUrl());
        return dto;
    }
    public User toEntity(UserDto dto) {
        if (dto == null) {
            return null;
        }
        User user = new User();
        user.setId(dto.getId());
        user.setGithubId(dto.getGithubId());
        user.setGithubUsername(dto.getGithubUsername());
        user.setDisplayName(dto.getDisplayName());
        user.setAvatarUrl(dto.getAvatarUrl());
        return user;
    }
}

