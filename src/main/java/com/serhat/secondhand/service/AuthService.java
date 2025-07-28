package com.serhat.secondhand.service;

import com.serhat.secondhand.dto.request.LoginRequest;
import com.serhat.secondhand.dto.request.RegisterRequest;
import com.serhat.secondhand.dto.response.LoginResponse;
import com.serhat.secondhand.dto.response.RegisterResponse;
import com.serhat.secondhand.entity.User;
import com.serhat.secondhand.entity.enums.TokenType;
import com.serhat.secondhand.exception.User.UserAlreadyLoggedOutException;
import com.serhat.secondhand.exception.auth.InvalidRefreshTokenException;
import com.serhat.secondhand.jwt.JwtUtils;
import com.serhat.secondhand.mapper.UserMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AuthService {

    private final IUserService userService;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final UserMapper userMapper;

    public RegisterResponse register(RegisterRequest request) {
        log.info("User registration attempt: {}", request.getEmail());

        userService.validateUniqueUser(request.getEmail(), request.getPhoneNumber());
        User user = userMapper.toEntity(request);
        userService.save(user);

        log.info("User registered successfully: {}", user.getEmail());
        return new RegisterResponse("Registration Successful", user.getId(), user.getEmail(), user.getName(), user.getSurname());
    }

    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt: {}", request.email());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userService.findByEmail(request.email());

        user.setLastLoginDate(LocalDateTime.now());
        userService.update(user);

        // Generate linked tokens with JTI
        String accessTokenJti = UUID.randomUUID().toString();
        String refreshTokenJti = UUID.randomUUID().toString();

        String accessToken = jwtUtils.generateAccessTokenWithJti(user, accessTokenJti);
        String refreshToken = jwtUtils.generateRefreshTokenWithJti(user, refreshTokenJti);

        // Save both tokens with bidirectional linking
        tokenService.saveTokenWithBidirectionalJti(accessToken, accessTokenJti, TokenType.ACCESS_TOKEN, user,
                LocalDateTime.now().plusSeconds(jwtUtils.getAccessTokenExpiration() / 1000), null, refreshTokenJti);
                
        tokenService.saveTokenWithBidirectionalJti(refreshToken, refreshTokenJti, TokenType.REFRESH_TOKEN, user,
                LocalDateTime.now().plusSeconds(jwtUtils.getRefreshTokenExpiration() / 1000), accessTokenJti, null);

        log.info("User logged in successfully with linked tokens - AccessJTI: {}, RefreshJTI: {}, User: {}", 
                 accessTokenJti, refreshTokenJti, user.getEmail());
        return new LoginResponse("Login success", user.getId(), user.getEmail(), accessToken, refreshToken);
    }

    public String logout(String username, String accessToken) {
        log.info("Logout request: {}", username);

        User user = userService.findByEmail(username);

        if (tokenService.findActiveTokensByUser(user).isEmpty()) {
            throw UserAlreadyLoggedOutException.defaultMessage();
        }

        // Revoke current access token if provided
        if (accessToken != null) {
            String accessTokenJti = jwtUtils.extractJti(accessToken);
            tokenService.revokeTokenByJtiWithLinked(accessTokenJti, true); // This will revoke both access and linked refresh token
            log.info("Current access token and linked refresh token revoked during logout: {}", accessTokenJti);
        }

        // Revoke any remaining tokens for the user
        tokenService.revokeAllUserTokens(user);

        log.info("User logged out successfully: {}", user.getEmail());
        return "Logout successful";
    }

    public LoginResponse refreshToken(String refreshToken) {
        log.info("Token refresh request");

        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            throw InvalidRefreshTokenException.notFound();
        }

        String username = jwtUtils.extractUsername(refreshToken);
        User user = userService.findByEmail(username);

        if (!jwtUtils.isTokenValid(refreshToken, user)) {
            throw InvalidRefreshTokenException.invalid();
        }

        if (!tokenService.isTokenValid(refreshToken)) {
            throw InvalidRefreshTokenException.revoked();
        }

        // Get old access token JTI from refresh token
        String oldRefreshTokenJti = jwtUtils.extractJti(refreshToken);
        String oldAccessTokenJti = getAccessTokenJtiFromRefreshToken(oldRefreshTokenJti);

        // Generate new linked tokens
        String newAccessTokenJti = UUID.randomUUID().toString();
        String newRefreshTokenJti = UUID.randomUUID().toString();

        String newAccessToken = jwtUtils.generateAccessTokenWithJti(user, newAccessTokenJti);
        String newRefreshToken = jwtUtils.generateRefreshTokenWithJti(user, newRefreshTokenJti);

        // Revoke old token pair
        tokenService.revokeTokenPair(oldAccessTokenJti, oldRefreshTokenJti);

        // Save new tokens with bidirectional linking
        tokenService.saveTokenWithBidirectionalJti(newAccessToken, newAccessTokenJti, TokenType.ACCESS_TOKEN, user,
                LocalDateTime.now().plusSeconds(jwtUtils.getAccessTokenExpiration() / 1000), null, newRefreshTokenJti);
                
        tokenService.saveTokenWithBidirectionalJti(newRefreshToken, newRefreshTokenJti, TokenType.REFRESH_TOKEN, user,
                LocalDateTime.now().plusSeconds(jwtUtils.getRefreshTokenExpiration() / 1000), newAccessTokenJti, null);

        log.info("Tokens refreshed successfully with linking - OldAccessJTI: {}, NewAccessJTI: {}, NewRefreshJTI: {}, User: {}", 
                 oldAccessTokenJti, newAccessTokenJti, newRefreshTokenJti, username);
        return new LoginResponse("Refresh successful", user.getId(), user.getEmail(), newAccessToken, newRefreshToken);
    }

    private String getAccessTokenJtiFromRefreshToken(String refreshTokenJti) {
        // This method gets the linked access token JTI from the refresh token record
        return tokenService.findByJti(refreshTokenJti)
                .map(token -> token.getAccessTokenJti())
                .orElse(null);
    }

    public LoginResponse getAuthenticatedUser(String username) {
        User user = userService.findByEmail(username);
        return new LoginResponse("Authenticated user", user.getId(), user.getEmail(), null, null);
    }

    public String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }
}
