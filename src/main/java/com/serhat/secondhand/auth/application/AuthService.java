package com.serhat.secondhand.auth.application;

import com.serhat.secondhand.auth.domain.dto.request.LoginRequest;
import com.serhat.secondhand.auth.domain.dto.request.RegisterRequest;
import com.serhat.secondhand.auth.domain.dto.response.LoginResponse;
import com.serhat.secondhand.auth.domain.dto.response.RegisterResponse;
import com.serhat.secondhand.auth.domain.exception.AccountNotActiveException;
import com.serhat.secondhand.auth.domain.exception.InvalidRefreshTokenException;
import com.serhat.secondhand.core.jwt.AuthenticationFilter;
import com.serhat.secondhand.core.jwt.JwtUtils;
import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import com.serhat.secondhand.auth.domain.entity.enums.TokenType;
import com.serhat.secondhand.user.domain.exception.UserAlreadyExistsException;
import com.serhat.secondhand.user.domain.exception.UserAlreadyLoggedOutException;
import com.serhat.secondhand.user.domain.mapper.UserMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AuthService {

    private final UserService userService;
    private final UserMapper userMapper;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public RegisterResponse register(RegisterRequest request) {
        log.info("User registration attempt: {}", request.getEmail());

        userService.validateUniqueUser(request.getEmail(), request.getPhoneNumber());
        User user = userMapper.toEntity(request, passwordEncoder);
        userService.save(user);

        log.info("User registered successfully: {}", user.getEmail());

        emailService.sendWelcomeEmail(user);

        return new RegisterResponse(
                "Registration Successful.",
                "Account verification is a must for publish listing. Your account status is "+ user.getAccountStatus(),
                "Your built in email account also created.",
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getSurname());
    }

    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt: {}", request.email());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userService.findByEmail(request.email());

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password.");
        }

        if (!user.getAccountStatus().equals(AccountStatus.ACTIVE)) {
            throw AccountNotActiveException.withStatus(user.getAccountStatus());
        }

        user.setLastLoginDate(LocalDateTime.now());
        userService.update(user);

        String accessToken = jwtUtils.generateAccessToken(user);
        String refreshToken = jwtUtils.generateRefreshToken(user);

        tokenService.revokeAllUserTokens(user);
        tokenService.saveToken(accessToken, TokenType.ACCESS_TOKEN, user, LocalDateTime.now().plusSeconds(jwtUtils.getAccessTokenExpiration() / 1000));
        tokenService.saveToken(refreshToken, TokenType.REFRESH_TOKEN, user, LocalDateTime.now().plusSeconds(jwtUtils.getRefreshTokenExpiration() / 1000));


        log.info("User logged in successfully: {}", user.getEmail());
        return new LoginResponse("Login success", user.getId(), user.getEmail(), accessToken, refreshToken);
    }

    public String logout(String username, String accessToken) {
        log.info("Logout request: {}", username);

        User user = userService.findByEmail(username);

        if (tokenService.findActiveTokensByUser(user).isEmpty()) {
            throw UserAlreadyLoggedOutException.defaultMessage();
        }

        if (accessToken != null) {
            tokenService.revokeToken(accessToken);
            log.info("Access token revoked during logout.");
        }

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

        String newAccessToken = jwtUtils.generateAccessToken(user);
        String newRefreshToken = jwtUtils.generateRefreshToken(user);

        // Revoke the old refresh token
        tokenService.revokeToken(refreshToken);

        // Persist new tokens
        tokenService.saveToken(newAccessToken, TokenType.ACCESS_TOKEN, user,
                LocalDateTime.now().plusSeconds(jwtUtils.getAccessTokenExpiration() / 1000));
        tokenService.saveToken(newRefreshToken, TokenType.REFRESH_TOKEN, user,
                LocalDateTime.now().plusSeconds(jwtUtils.getRefreshTokenExpiration() / 1000));

        log.info("Tokens rotated successfully for user: {}", username);
        return new LoginResponse("Refresh successful", user.getId(), user.getEmail(), newAccessToken, newRefreshToken);
    }

    public LoginResponse getAuthenticatedUser(String username) {
        User user = userService.findByEmail(username);
        return new LoginResponse("Authenticated user", user.getId(), user.getEmail(), null, null);
    }

    public Map<String, String> logout(Authentication authentication, HttpServletRequest request) {
        String username = authentication.getName();
        String accessToken = extractTokenFromHeader(request);
        String message = logout(username, accessToken);
        
        return Map.of(
            "message", message,
            "status", "success"
        );
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
}