package devPilot.server.config;
import devPilot.server.dto.UserDto;
import devPilot.server.services.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import java.io.IOException;
@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final UserService userService;
    private final OAuth2AuthorizedClientService  oAuth2AuthorizedClientService;
    @Autowired
    public OAuth2SuccessHandler(UserService userService, OAuth2AuthorizedClientService oAuth2AuthorizedClientService) {
        this.userService = userService;
        this.oAuth2AuthorizedClientService = oAuth2AuthorizedClientService;
    }
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken oauthToken=(OAuth2AuthenticationToken)authentication;
        OAuth2User oAuthUser=oauthToken.getPrincipal();
        OAuth2AuthorizedClient client = oAuth2AuthorizedClientService.loadAuthorizedClient(
                oauthToken.getAuthorizedClientRegistrationId(), oauthToken.getName());
        String accessToken = client.getAccessToken().getTokenValue();
        UserDto userDto = userService.processOAuthPostLogin(oAuthUser, accessToken);
        getRedirectStrategy().sendRedirect(request, response, "http://localhost:5173/?userId=" + userDto.getId());
    }
}

