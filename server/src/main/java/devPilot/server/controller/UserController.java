package devPilot.server.controller;
import devPilot.server.dto.UserDto;
import devPilot.server.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    private final UserService userService;
    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }
    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> getUserById(@PathVariable UUID userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }
    @GetMapping("/search-by-id/{githubId}")
    public ResponseEntity<UserDto> getUserByGithubId(@PathVariable Long githubId) {
        return ResponseEntity.ok(userService.getUserByGithubId(githubId));
    }
    @GetMapping("/search-by-name/{githubUsername}")
    public ResponseEntity<UserDto> getUserByGithubUsername(@PathVariable String githubUsername) {
        return ResponseEntity.ok(userService.getUserByGithubUsername(githubUsername));
    }
}

