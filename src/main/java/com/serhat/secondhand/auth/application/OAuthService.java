package com.serhat.secondhand.auth.application;

import com.serhat.secondhand.auth.domain.dto.request.OAuthCompleteRequest;
import com.serhat.secondhand.auth.domain.dto.response.LoginResponse;
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
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuthService {

    private final JwtUtils jwtUtils;
    private final IUserService userService;
    private final AuditLogService auditLogService;
    private final ApplicationEventPublisher eventPublisher;
    private final LoginService loginService;

    @Transactional
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

        LoginService.TokenRotationResult tokens = loginService.issueTokens(user, false);

        auditOAuthGoogleLogin(user, httpRequest);

        return new LoginResponse("OAuth registration completed", user.getId(), user.getEmail(), tokens.accessToken(), tokens.refreshToken(), false);
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
}
