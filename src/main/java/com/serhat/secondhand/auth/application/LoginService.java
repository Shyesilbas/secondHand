package com.serhat.secondhand.auth.application;

import com.serhat.secondhand.agreements.application.AgreementUpdateNotificationService;
import com.serhat.secondhand.auth.domain.dto.request.LoginRequest;
import com.serhat.secondhand.auth.domain.dto.response.AuthMessageResponse;
import com.serhat.secondhand.auth.domain.dto.response.LoginResponse;
import com.serhat.secondhand.auth.domain.entity.Token;
import com.serhat.secondhand.auth.domain.entity.enums.TokenType;
import com.serhat.secondhand.auth.domain.exception.AccountNotActiveException;
import com.serhat.secondhand.auth.domain.exception.InvalidRefreshTokenException;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.jwt.JwtUtils;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import com.serhat.secondhand.user.domain.exception.UserAlreadyLoggedOutException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoginService {

    private final AuthenticationManager authenticationManager;
    private final IUserService userService;
    private final TokenService tokenService;
    private final JwtUtils jwtUtils;
    private final AgreementUpdateNotificationService agreementUpdateNotificationService;
    private final LoginAttemptService loginAttemptService;

    public record TokenRotationResult(String accessToken, String refreshToken) {}

    public TokenRotationResult issueTokens(User user, boolean rememberMe, Token oldRefreshToken) {
        if (oldRefreshToken != null) {
            tokenService.revokeToken(oldRefreshToken.getToken());
        }

        String accessToken = jwtUtils.generateAccessToken(user);
        String refreshToken = jwtUtils.generateRefreshToken(user, rememberMe);

        long refreshExpirationMs = rememberMe ? jwtUtils.getRememberMeExpiration() : jwtUtils.getRefreshTokenExpiration();
        tokenService.saveToken(
                refreshToken,
                TokenType.REFRESH_TOKEN,
                user,
                LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000),
                oldRefreshToken,
                rememberMe
        );
        return new TokenRotationResult(accessToken, refreshToken);
    }

    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt: {}", request.email());

        if (loginAttemptService.isBlocked(request.email())) {
            throw new BusinessException("Too many login attempts. Please try again later.", HttpStatus.TOO_MANY_REQUESTS, "ACCOUNT_LOCKED");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (BadCredentialsException e) {
            loginAttemptService.loginFailed(request.email());
            throw new BadCredentialsException("Invalid username or password.");
        }

        User user = userService.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password."));

        if (!user.getAccountStatus().equals(AccountStatus.ACTIVE)) {
            throw AccountNotActiveException.withStatus(user.getAccountStatus());
        }

        loginAttemptService.loginSucceeded(request.email());

        user.setLastLoginDate(LocalDateTime.now());
        userService.update(user);

        TokenRotationResult tokens = issueTokens(user, request.rememberMe(), null);

        agreementUpdateNotificationService.notifyOutdatedRequiredAgreements(user.getId());

        log.info("User logged in successfully: {}", user.getEmail());
        return new LoginResponse("Login success", user.getId(), user.getEmail(), tokens.accessToken(), tokens.refreshToken(), request.rememberMe());
    }

    public String logoutToken(String username, String refreshToken) {
        log.info("Logout request: {}", username);

        User user = userService.findByEmail(username)
                .orElseThrow(UserAlreadyLoggedOutException::defaultMessage);

        if (refreshToken != null) {
            tokenService.revokeToken(refreshToken);
        }

        log.info("User logged out successfully: {}", user.getEmail());
        return "Logout successful";
    }

    public LoginResponse refreshToken(String refreshTokenValue) {
        log.info("Token refresh request");

        if (refreshTokenValue == null || refreshTokenValue.trim().isEmpty()) {
            throw InvalidRefreshTokenException.notFound();
        }

        String username = jwtUtils.extractUsername(refreshTokenValue);
        User user = userService.findByEmail(username)
                .orElseThrow(InvalidRefreshTokenException::invalid);

        if (!jwtUtils.isTokenValid(refreshTokenValue, user)) {
            throw InvalidRefreshTokenException.invalid();
        }

        if (!tokenService.isTokenValid(refreshTokenValue)) {
            tokenService.findByToken(refreshTokenValue).ifPresent(token -> {
                if (token.getFamilyId() != null) {
                    log.warn("Security Alert: Token reuse detected for user {}. Revoking token family.", username);
                    tokenService.revokeTokenFamily(token.getFamilyId());
                }
            });
            throw InvalidRefreshTokenException.revoked();
        }

        Token oldRefreshToken = tokenService.findByToken(refreshTokenValue)
                .orElseThrow(InvalidRefreshTokenException::invalid);

        TokenRotationResult tokens = issueTokens(user, oldRefreshToken.isRememberMe(), oldRefreshToken);

        log.info("Tokens rotated successfully for user: {}", username);
        return new LoginResponse("Refresh successful", user.getId(), user.getEmail(), tokens.accessToken(), tokens.refreshToken(), oldRefreshToken.isRememberMe());
    }

    public Map<String, Object> validateToken(Authentication authentication) {
        return Map.of(
            "valid", true,
            "username", authentication.getName(),
            "authorities", authentication.getAuthorities(),
            "message", "Token is valid"
        );
    }

    private String extractTokenFromHeader(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        return null;
    }

    public AuthMessageResponse logout(Authentication authentication, String refreshToken) {
        String username = null;
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            username = ((UserDetails) authentication.getPrincipal()).getUsername();
        } else if (authentication != null && authentication.getPrincipal() instanceof String) {
            username = (String) authentication.getPrincipal();
        }

        if (username != null) {
            log.info("Processing logout for user: {}", username);

            logoutToken(username, refreshToken);
            log.info("Logout successful for user: {}", username);
            return AuthMessageResponse.of("Successfully logged out");
        }

        throw new BusinessException("User information not found", HttpStatus.BAD_REQUEST, "USER_NOT_FOUND");
    }

    public AuthMessageResponse revokeAllSessions(Authentication authentication, HttpServletRequest request) {
        String username = null;
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            username = ((UserDetails) authentication.getPrincipal()).getUsername();
        } else if (authentication != null && authentication.getPrincipal() instanceof String) {
            username = (String) authentication.getPrincipal();
        }

        if (username != null) {
            log.info("Revoking all sessions for user: {}", username);

            User user = userService.findByEmail(username)
                    .orElseThrow(() -> new BusinessException("User finding failed", HttpStatus.BAD_REQUEST, "USER_NOT_FOUND"));

            tokenService.revokeAllUserTokens(user);

            log.info("All sessions revoked for user: {}", username);
            return AuthMessageResponse.of("All sessions have been revoked. Please log in again.");
        }

        throw new BusinessException("User information not found", HttpStatus.BAD_REQUEST, "USER_NOT_FOUND");
    }
}
