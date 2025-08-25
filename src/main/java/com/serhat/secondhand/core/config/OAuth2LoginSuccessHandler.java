package com.serhat.secondhand.core.config;

import com.serhat.secondhand.auth.application.TokenService;
import com.serhat.secondhand.auth.domain.dto.response.LoginResponse;
import com.serhat.secondhand.auth.domain.entity.Token;
import com.serhat.secondhand.auth.domain.entity.enums.TokenType;
import com.serhat.secondhand.core.jwt.JwtUtils;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.Provider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserService userService;
    private final TokenService tokenService;
    private final JwtUtils jwtUtils;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2AuthenticationToken oAuth2Token = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oAuth2Token.getPrincipal();

        try {
            String email = oAuth2User.getAttribute("email");
            String name = oAuth2User.getAttribute("given_name");
            String surname = oAuth2User.getAttribute("family_name");
            String picture = oAuth2User.getAttribute("picture");

            log.info("OAuth2 login attempt for email: {}", email);

            Optional<User> existingUserOpt = userService.findOptionalByEmail(email);

            if (existingUserOpt.isPresent()) {
                User user = existingUserOpt.get();
                user.setLastLoginDate(LocalDateTime.now());
                user.setProvider(Provider.GOOGLE);
                userService.update(user);

                Optional<Token> oldRefreshToken = tokenService.findByUserAndType(user, TokenType.REFRESH_TOKEN);

                String accessToken = jwtUtils.generateAccessToken(user);
                String refreshToken = jwtUtils.generateRefreshToken(user);

                tokenService.revokeAllUserTokens(user);

                tokenService.saveToken(accessToken, TokenType.ACCESS_TOKEN, user,
                        LocalDateTime.now().plusSeconds(jwtUtils.getAccessTokenExpiration() / 1000), null);

                tokenService.saveToken(refreshToken, TokenType.REFRESH_TOKEN, user,
                        LocalDateTime.now().plusSeconds(jwtUtils.getRefreshTokenExpiration() / 1000),
                        oldRefreshToken.orElse(null));

                LoginResponse loginResponse = new LoginResponse(
                        "OAuth2 login successful",
                        user.getId(),
                        user.getEmail(),
                        accessToken,
                        refreshToken
                );

                handleSuccessResponse(response, loginResponse);
            } else {
                // New user: do NOT create yet. Redirect to frontend to complete required fields.
                String redirectUrl = String.format(
                        "http://localhost:5173/auth/complete?email=%s&name=%s&surname=%s&picture=%s",
                        urlEncode(email), urlEncode(name), urlEncode(surname), urlEncode(picture)
                );
                response.sendRedirect(redirectUrl);
            }

        } catch (Exception e) {
            log.error("OAuth2 authentication error", e);
            handleErrorResponse(response, "Authentication failed");
        }
    }


    private String urlEncode(String value) {
        try {
            return value == null ? "" : java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            return "";
        }
    }

    private void handleSuccessResponse(HttpServletResponse response, LoginResponse loginResponse) throws IOException {
        String redirectUrl = String.format("http://localhost:5173/auth/callback?token=%s&refresh=%s",
                loginResponse.getAccessToken(), loginResponse.getRefreshToken());
        response.sendRedirect(redirectUrl);


    }

    private void handleErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.sendRedirect("http://localhost:5173/auth/error?message=" + message);
    }
}