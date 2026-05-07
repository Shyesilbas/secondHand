package com.serhat.secondhand.auth.application;

import com.serhat.secondhand.agreements.application.AgreementRequirementService;
import com.serhat.secondhand.agreements.application.AgreementUpdateNotificationService;
import com.serhat.secondhand.agreements.application.UserAgreementService;
import com.serhat.secondhand.agreements.dto.request.AcceptAgreementRequest;
import com.serhat.secondhand.agreements.entity.Agreement;
import com.serhat.secondhand.auth.domain.dto.request.LoginRequest;
import com.serhat.secondhand.auth.domain.dto.request.OAuthCompleteRequest;
import com.serhat.secondhand.auth.domain.dto.request.RegisterRequest;
import com.serhat.secondhand.auth.domain.dto.response.AuthMessageResponse;
import com.serhat.secondhand.auth.domain.dto.response.LoginResponse;
import com.serhat.secondhand.auth.domain.dto.response.RegisterResponse;
import com.serhat.secondhand.auth.domain.entity.Token;
import com.serhat.secondhand.auth.domain.entity.enums.TokenType;
import com.serhat.secondhand.auth.domain.exception.AccountNotActiveException;
import com.serhat.secondhand.auth.domain.exception.InvalidRefreshTokenException;
import com.serhat.secondhand.auth.util.AuthErrorCodes;
import com.serhat.secondhand.core.audit.service.AuditLogService;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.jwt.JwtUtils;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.application.event.UserRegisteredEvent;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import com.serhat.secondhand.user.domain.entity.enums.UserRole;
import com.serhat.secondhand.user.domain.exception.UserAlreadyLoggedOutException;
import com.serhat.secondhand.user.domain.mapper.UserMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
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
public class AuthService implements IAuthService {

    private final IUserService userService;
    private final UserMapper userMapper;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final UserAgreementService userAgreementService;
    private final AgreementUpdateNotificationService agreementUpdateNotificationService;
    private final AuditLogService auditLogService;
    private final AgreementRequirementService agreementRequirementService;
    private final ApplicationEventPublisher eventPublisher;

    public Result<RegisterResponse> register(RegisterRequest request) {
        log.info("User registration attempt: {}", request.getEmail());

        Result<Void> validationResult = userService.validateUniqueUser(request.getEmail(), request.getPhoneNumber());
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        if (!request.getAgreementsAccepted()) {
            return Result.error(AuthErrorCodes.AGREEMENTS_NOT_ACCEPTED);
        }

        var requiredAgreements = agreementRequirementService.getRequiredAgreements("REGISTER");
        Set<UUID> requiredIds = requiredAgreements.stream().map(Agreement::getAgreementId).collect(Collectors.toSet());
        Set<UUID> acceptedIds = new HashSet<>(request.getAcceptedAgreementIds());
        if (!acceptedIds.containsAll(requiredIds)) {
            return Result.error(AuthErrorCodes.AGREEMENTS_NOT_ACCEPTED);
        }

        User user = userMapper.toEntity(request, passwordEncoder);
        Result<Void> saveResult = userService.save(user);
        if (saveResult.isError()) {
            return Result.error(saveResult.getMessage(), saveResult.getErrorCode());
        }

        for (UUID agreementId : acceptedIds) {
            userAgreementService.acceptAgreement(user.getId(),AcceptAgreementRequest.builder()
                .agreementId(agreementId)
                .isAcceptedTheLastVersion(true)
                .build());
        }

        log.info("User registered successfully: {}", user.getEmail());

        eventPublisher.publishEvent(new UserRegisteredEvent(user));

        return Result.success(new RegisterResponse(
                "Registration Successful.",
                "Account verification is a must for publish listing. Your account status is "+ user.getAccountStatus(),
                "Your built in email account also created.",
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getSurname()));
    }

    private record TokenRotationResult(String accessToken, String refreshToken) {}

    private TokenRotationResult issueTokens(User user, boolean rememberMe) {
        Token oldRefreshToken = tokenService.findActiveRefreshTokenByUser(user).orElse(null);
        tokenService.revokeUserRefreshTokens(user);

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

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userService.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password."));

        if (!user.getAccountStatus().equals(AccountStatus.ACTIVE)) {
            throw AccountNotActiveException.withStatus(user.getAccountStatus());
        }

        user.setLastLoginDate(LocalDateTime.now());
        userService.update(user);

        TokenRotationResult tokens = issueTokens(user, request.rememberMe());

        agreementUpdateNotificationService.notifyOutdatedRequiredAgreements(user.getId());

        log.info("User logged in successfully: {}", user.getEmail());
        return new LoginResponse("Login success", user.getId(), user.getEmail(), tokens.accessToken(), tokens.refreshToken(), request.rememberMe());
    }


    public String logout(String username, String accessToken) {
        log.info("Logout request: {}", username);

        User user = userService.findByEmail(username)
                .orElseThrow(UserAlreadyLoggedOutException::defaultMessage);

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
        User user = userService.findByEmail(username)
                .orElseThrow(InvalidRefreshTokenException::invalid);

        if (!jwtUtils.isTokenValid(refreshTokenValue, user)) {
            throw InvalidRefreshTokenException.invalid();
        }

        if (!tokenService.isTokenValid(refreshTokenValue)) {
            throw InvalidRefreshTokenException.revoked();
        }

        Token oldRefreshToken = tokenService.findByToken(refreshTokenValue)
                .orElseThrow(InvalidRefreshTokenException::invalid);

        TokenRotationResult tokens = issueTokens(user, oldRefreshToken.isRememberMe());

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

    public LoginResponse completeOAuthRegistration(OAuthCompleteRequest request, HttpServletRequest httpRequest) {
        // Güvenlik kuralı: kullanıcı kimliği yalnızca sunucu tarafından üretilmiş imzalı registrationToken'dan
        // okunur. İstemci tarafından gönderilen email alanı bağlayıcı değildir; token claim ile çapraz doğrulanır.
        io.jsonwebtoken.Claims claims;
        try {
            claims = jwtUtils.parseOAuthRegistrationToken(request.getRegistrationToken());
        } catch (Exception e) {
            log.warn("OAuth completion rejected: invalid or expired registration token");
            throw new BusinessException(
                    "Invalid or expired registration token. Please start the OAuth flow again.",
                    HttpStatus.UNAUTHORIZED,
                    AuthErrorCodes.INVALID_OAUTH_REGISTRATION_TOKEN.getCode());
        }

        String tokenEmail = claims.get("email", String.class);
        if (tokenEmail == null || tokenEmail.isBlank()) {
            log.warn("OAuth completion rejected: registration token missing email claim");
            throw new BusinessException(
                    "Invalid registration token payload.",
                    HttpStatus.UNAUTHORIZED,
                    AuthErrorCodes.INVALID_OAUTH_REGISTRATION_TOKEN.getCode());
        }

        if (!tokenEmail.equalsIgnoreCase(request.getEmail())) {
            log.warn("OAuth completion rejected: email mismatch between token and request");
            throw new BusinessException(
                    "Email mismatch. Please start the OAuth flow again.",
                    HttpStatus.UNAUTHORIZED,
                    AuthErrorCodes.INVALID_OAUTH_REGISTRATION_TOKEN.getCode());
        }

        // Aynı email ile zaten kullanıcı varsa OAuth handshake'i bu yolu kullanmamalı; success handler
        // mevcut kullanıcı için doğrudan login yapar. Burada gelmesi anormaldir, dolayısıyla 409.
        if (userService.findOptionalByEmail(tokenEmail).isPresent()) {
            throw new BusinessException(
                    "An account with this email already exists. Please log in.",
                    HttpStatus.CONFLICT,
                    AuthErrorCodes.OAUTH_ACCOUNT_ALREADY_EXISTS.getCode());
        }

        User user = User.builder()
                .name(request.getName())
                .surname(request.getSurname())
                .email(tokenEmail)
                .phoneNumber(request.getPhoneNumber())
                .gender(request.getGender())
                .birthdate(request.getBirthdate())
                .provider(com.serhat.secondhand.user.domain.entity.enums.Provider.GOOGLE)
                .accountStatus(AccountStatus.ACTIVE)
                .role(UserRole.USER)
                .accountVerified(true)
                .accountCreationDate(LocalDate.now())
                .lastLoginDate(LocalDateTime.now())
                .build();

        Result<Void> saveResult = userService.save(user);
        if (saveResult.isError()) {
            throw new BadCredentialsException(saveResult.getMessage());
        }
        eventPublisher.publishEvent(new UserRegisteredEvent(user));

        TokenRotationResult tokens = issueTokens(user, false);

        auditOAuthGoogleLogin(user, httpRequest);

        return new LoginResponse("OAuth registration completed", user.getId(), user.getEmail(), tokens.accessToken(), tokens.refreshToken());
    }

    private void auditOAuthGoogleLogin(User user, HttpServletRequest httpRequest) {
        if (httpRequest == null || user == null) {
            return;
        }
        auditLogService.logLoginViaGoogle(
                user.getEmail(),
                user.getId(),
                auditLogService.getClientIpAddress(httpRequest),
                auditLogService.getClientUserAgent(httpRequest));
    }

    public AuthMessageResponse logout(Authentication authentication, HttpServletRequest request) {
        String username = null;
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            username = ((UserDetails) authentication.getPrincipal()).getUsername();
        } else if (authentication != null && authentication.getPrincipal() instanceof String) {
            username = (String) authentication.getPrincipal();
        }

        if (username != null) {
            log.info("Processing logout for user: {}", username);

            String accessToken = extractTokenFromHeader(request);

            logout(username, accessToken);
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
