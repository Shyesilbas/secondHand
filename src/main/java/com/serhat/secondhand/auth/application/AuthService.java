package com.serhat.secondhand.auth.application;

import com.serhat.secondhand.agreements.dto.request.AcceptAgreementRequest;
import com.serhat.secondhand.agreements.entity.Agreement;
import com.serhat.secondhand.agreements.service.AgreementRequirementService;
import com.serhat.secondhand.agreements.service.AgreementUpdateNotificationService;
import com.serhat.secondhand.agreements.service.UserAgreementService;
import com.serhat.secondhand.auth.domain.dto.request.LoginRequest;
import com.serhat.secondhand.auth.domain.dto.request.OAuthCompleteRequest;
import com.serhat.secondhand.auth.domain.dto.request.RegisterRequest;
import com.serhat.secondhand.auth.domain.dto.response.LoginResponse;
import com.serhat.secondhand.auth.domain.dto.response.RegisterResponse;
import com.serhat.secondhand.auth.domain.entity.Token;
import com.serhat.secondhand.auth.domain.entity.enums.TokenType;
import com.serhat.secondhand.auth.domain.exception.AccountNotActiveException;
import com.serhat.secondhand.auth.domain.exception.InvalidRefreshTokenException;
import com.serhat.secondhand.auth.util.AuthErrorCodes;
import com.serhat.secondhand.core.audit.service.AuditLogService;
import com.serhat.secondhand.core.jwt.JwtUtils;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.user.application.UserNotificationService;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

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
    private final UserNotificationService userNotificationService;
    private final UserAgreementService userAgreementService;
    private final AgreementUpdateNotificationService agreementUpdateNotificationService;
    private final AuditLogService auditLogService;
    private final AgreementRequirementService agreementRequirementService;

    public Result<RegisterResponse> register(RegisterRequest request) {
        log.info("User registration attempt: {}", request.getEmail());

        Result<Void> validationResult = userService.validateUniqueUser(request.getEmail(), request.getPhoneNumber());
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        if (!request.getAgreementsAccepted()) {
            return Result.error(AuthErrorCodes.AGREEMENTS_NOT_ACCEPTED);
        }

        User user = userMapper.toEntity(request, passwordEncoder);
        Result<Void> saveResult = userService.save(user);
        if (saveResult.isError()) {
            return Result.error(saveResult.getMessage(), saveResult.getErrorCode());
        }

        var requiredAgreements = agreementRequirementService.getRequiredAgreements("REGISTER");

        Set<UUID> requiredIds = requiredAgreements.stream().map(Agreement::getAgreementId).collect(Collectors.toSet());
        Set<UUID> acceptedIds = new HashSet<>(request.getAcceptedAgreementIds());
        if (!acceptedIds.containsAll(requiredIds)) {
            return Result.error(AuthErrorCodes.AGREEMENTS_NOT_ACCEPTED);
        }

        for (UUID agreementId : acceptedIds) {
            userAgreementService.acceptAgreement(user.getId(),AcceptAgreementRequest.builder()
                .agreementId(agreementId)
                .isAcceptedTheLastVersion(true)
                .build());
        }

        log.info("User registered successfully: {}", user.getEmail());

        userNotificationService.sendWelcomeNotification(user);

        return Result.success(new RegisterResponse(
                "Registration Successful.",
                "Account verification is a must for publish listing. Your account status is "+ user.getAccountStatus(),
                "Your built in email account also created.",
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getSurname()));
    }

    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt: {}", request.email());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        Result<User> userResult = userService.findByEmail(request.email());
        if (userResult.isError()) {
            throw new BadCredentialsException("Invalid username or password.");
        }

        User user = userResult.getData();

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password.");
        }

        if (!user.getAccountStatus().equals(AccountStatus.ACTIVE)) {
            throw AccountNotActiveException.withStatus(user.getAccountStatus());
        }

        user.setLastLoginDate(LocalDateTime.now());
        userService.update(user);

        Token oldRefreshToken = tokenService.findActiveRefreshTokenByUser(user).orElse(null);

        tokenService.revokeUserRefreshTokens(user);

        boolean rememberMe = request.rememberMe();
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

        agreementUpdateNotificationService.notifyOutdatedRequiredAgreements(user.getId());

        log.info("User logged in successfully: {}", user.getEmail());
        return new LoginResponse("Login success", user.getId(), user.getEmail(), accessToken, refreshToken, rememberMe);
    }


    public String logout(String username, String accessToken) {
        log.info("Logout request: {}", username);

        Result<User> userResult = userService.findByEmail(username);
        if (userResult.isError()) {
            throw UserAlreadyLoggedOutException.defaultMessage();
        }

        User user = userResult.getData();

        if (tokenService.findActiveRefreshTokenByUser(user).isEmpty()) {
            throw UserAlreadyLoggedOutException.defaultMessage();
        }

        tokenService.revokeUserRefreshTokens(user);

        log.info("User logged out successfully: {}", user.getEmail());
        return "Logout successful";
    }

    public LoginResponse refreshToken(String refreshTokenValue) {
        log.info("Token refresh request");

        if (refreshTokenValue == null || refreshTokenValue.trim().isEmpty()) {
            throw InvalidRefreshTokenException.notFound();
        }

        String username = jwtUtils.extractUsername(refreshTokenValue);
        Result<User> userResult = userService.findByEmail(username);
        if (userResult.isError()) {
            throw InvalidRefreshTokenException.invalid();
        }

        User user = userResult.getData();

        if (!jwtUtils.isTokenValid(refreshTokenValue, user)) {
            throw InvalidRefreshTokenException.invalid();
        }

        if (!tokenService.isTokenValid(refreshTokenValue)) {
            throw InvalidRefreshTokenException.revoked();
        }

        Token oldRefreshToken = tokenService.findByToken(refreshTokenValue)
                .orElseThrow(InvalidRefreshTokenException::invalid);

        boolean rememberMe = oldRefreshToken.isRememberMe();
        String newAccessToken = jwtUtils.generateAccessToken(user);
        String newRefreshToken = jwtUtils.generateRefreshToken(user, rememberMe);

        tokenService.revokeToken(refreshTokenValue);

        long refreshExpirationMs = rememberMe ? jwtUtils.getRememberMeExpiration() : jwtUtils.getRefreshTokenExpiration();
        tokenService.saveToken(
                newRefreshToken,
                TokenType.REFRESH_TOKEN,
                user,
                LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000),
                oldRefreshToken,
                rememberMe
        );

        log.info("Tokens rotated successfully for user: {}", username);
        return new LoginResponse("Refresh successful", user.getId(), user.getEmail(), newAccessToken, newRefreshToken, rememberMe);
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

    public LoginResponse completeOAuthRegistration(OAuthCompleteRequest request) {
        User existing = userService.findOptionalByEmail(request.getEmail()).orElse(null);

        if (existing != null) {
            existing.setLastLoginDate(LocalDateTime.now());
            userService.update(existing);

            Token oldRefreshToken = tokenService.findActiveRefreshTokenByUser(existing).orElse(null);
            tokenService.revokeUserRefreshTokens(existing);

            String accessToken = jwtUtils.generateAccessToken(existing);
            String refreshToken = jwtUtils.generateRefreshToken(existing, false);

            tokenService.saveToken(
                    refreshToken,
                    TokenType.REFRESH_TOKEN,
                    existing,
                    LocalDateTime.now().plusSeconds(jwtUtils.getRefreshTokenExpiration() / 1000),
                    oldRefreshToken,
                    false
            );

            agreementUpdateNotificationService.notifyOutdatedRequiredAgreements(existing.getId());

            return new LoginResponse("Login success", existing.getId(), existing.getEmail(), accessToken, refreshToken);
        }

        User user = User.builder()
                .name(request.getName())
                .surname(request.getSurname())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .gender(request.getGender())
                .birthdate(request.getBirthdate())
                .provider(com.serhat.secondhand.user.domain.entity.enums.Provider.GOOGLE)
                .accountStatus(AccountStatus.ACTIVE)
                .accountVerified(true)
                .accountCreationDate(LocalDate.now())
                .lastLoginDate(LocalDateTime.now())
                .build();

        userService.save(user);
        userNotificationService.sendWelcomeNotification(user);

        String accessToken = jwtUtils.generateAccessToken(user);
        String refreshToken = jwtUtils.generateRefreshToken(user, false);

        tokenService.saveToken(
                refreshToken,
                TokenType.REFRESH_TOKEN,
                user,
                LocalDateTime.now().plusSeconds(jwtUtils.getRefreshTokenExpiration() / 1000),
                null,
                false
        );

        return new LoginResponse("OAuth registration completed", user.getId(), user.getEmail(), accessToken, refreshToken);
    }

    public Map<String, String> revokeAllSessions(Authentication authentication, HttpServletRequest request) {
        String username = authentication.getName();
        Result<User> userResult = userService.findByEmail(username);
        if (userResult.isError()) {
            return Map.of(
                "message", "User not found",
                "status", "error"
            );
        }
        
        User user = userResult.getData();
        
        log.info("Revoking all sessions for user: {}", username);
        
        // Only revoke refresh tokens - access tokens are stateless
        tokenService.revokeUserRefreshTokens(user);
        
        String ipAddress = getClientIpAddress(request);
        String userAgent = getClientUserAgent(request);
        auditLogService.logLogout(username, user.getId(), ipAddress, userAgent);
        
        log.info("All sessions revoked successfully for user: {}", username);
        
        return Map.of(
            "message", "All sessions have been revoked successfully",
            "status", "success",
            "revokedSessions", "all"
        );
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    private String getClientUserAgent(HttpServletRequest request) {
        return request.getHeader("User-Agent");
    }

}