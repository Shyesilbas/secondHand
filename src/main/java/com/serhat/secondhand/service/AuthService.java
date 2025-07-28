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

        String accessToken = jwtUtils.generateAccessToken(user);
        String refreshToken = jwtUtils.generateRefreshToken(user);

        tokenService.saveToken(refreshToken, TokenType.REFRESH_TOKEN, user,
                LocalDateTime.now().plusSeconds(jwtUtils.getRefreshTokenExpiration() / 1000));

        log.info("User logged in successfully: {}", user.getEmail());
        return new LoginResponse("Login success", user.getId(), user.getEmail(), accessToken, refreshToken);
    }

    public String logout(String username) {
        log.info("Logout request: {}", username);

        User user = userService.findByEmail(username);

        if (tokenService.findActiveTokensByUser(user).isEmpty()) {
            throw UserAlreadyLoggedOutException.defaultMessage();
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

        tokenService.revokeToken(refreshToken);

        tokenService.saveToken(newRefreshToken, TokenType.REFRESH_TOKEN, user,
                LocalDateTime.now().plusSeconds(jwtUtils.getRefreshTokenExpiration() / 1000));

        log.info("Tokens refreshed successfully for user: {}", username);
        return new LoginResponse("Refresh successful", user.getId(), user.getEmail(), newAccessToken, newRefreshToken);
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
