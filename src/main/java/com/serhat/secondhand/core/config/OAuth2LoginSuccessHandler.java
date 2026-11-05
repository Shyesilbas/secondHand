package com.serhat.secondhand.core.config;

import com.serhat.secondhand.auth.application.TokenService;
import com.serhat.secondhand.core.audit.service.AuditLogService;
import com.serhat.secondhand.auth.domain.entity.enums.TokenType;
import com.serhat.secondhand.core.jwt.JwtUtils;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.core.security.CookieUtils;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
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

    private final IUserService userService;
    private final TokenService tokenService;
    private final JwtUtils jwtUtils;
    private final CookieUtils cookieUtils;
    private final AuditLogService auditLogService;
    private final AppConfigProperties appConfigProperties;

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

            // Google must vouch for the address before it is matched against an account.
            if (email == null || !isEmailVerified(oAuth2User)) {
                log.warn("OAuth2 login rejected: email missing or not verified by Google");
                handleErrorResponse(response, "Your Google email address is not verified.");
                return;
            }

            Optional<User> existingUserOpt = userService.findOptionalByEmail(email);

            if (existingUserOpt.isPresent()) {
                User user = existingUserOpt.get();
                if (user.getAccountStatus() != AccountStatus.ACTIVE) {
                    log.warn("OAuth2 login rejected for non-active account id {} (status: {})",
                            user.getId(), user.getAccountStatus());
                    handleErrorResponse(response, "Your account is not active.");
                    return;
                }
                // The account keeps its own provider: switching a LOCAL account to GOOGLE here would
                // change how it signs in without the owner asking for it.
                user.setLastLoginDate(LocalDateTime.now());
                userService.update(user);

                String accessToken = jwtUtils.generateAccessToken(user);
                String refreshToken = jwtUtils.generateRefreshToken(user, false);

                // New session with its own token family; sessions on other devices stay signed in,
                // the same as a password login.
                tokenService.saveToken(refreshToken, TokenType.REFRESH_TOKEN, user,
                        LocalDateTime.now().plusSeconds(jwtUtils.getRefreshTokenExpiration() / 1000),
                        null, false);

                auditLogService.logLoginViaGoogle(
                        user.getEmail(),
                        user.getId(),
                        auditLogService.getClientIpAddress(request),
                        auditLogService.getClientUserAgent(request));

                handleSuccessResponse(request, response, accessToken, refreshToken);
            } else {
                // Yeni kullanıcı: kayıt henüz oluşturulmaz. Frontend'in zorunlu alanları tamamlaması için
                // güvenilir taraftan üretilmiş imzalı kısa ömürlü registrationToken üretilir; istemci
                // backend'e geri döndüğünde sunucu kimliği yalnızca bu token'dan alır.
                String googleSub = oAuth2User.getAttribute("sub");
                String registrationToken = jwtUtils.generateOAuthRegistrationToken(
                        email, googleSub, name, surname, picture);
                String redirectUrl = String.format(
                        // URL fragment, not query: browsers never send it to a server or in Referer,
                        // so the token stays out of access logs and third-party requests.
                        "%s/auth/complete#registrationToken=%s",
                        appConfigProperties.getFrontendUrl(),
                        urlEncode(registrationToken)
                );
                response.sendRedirect(redirectUrl);
            }

        } catch (Exception e) {
            log.error("OAuth2 authentication error", e);
            handleErrorResponse(response, "Authentication failed");
        }
    }


    private static boolean isEmailVerified(OAuth2User oAuth2User) {
        Object verified = oAuth2User.getAttribute("email_verified");
        return Boolean.TRUE.equals(verified) || "true".equalsIgnoreCase(String.valueOf(verified));
    }

    private String urlEncode(String value) {
        try {
            return value == null ? "" : java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            return "";
        }
    }

    private void handleSuccessResponse(HttpServletRequest request, HttpServletResponse response, String accessToken, String refreshToken) throws IOException {
        cookieUtils.setAccessTokenCookie(response, accessToken);
        cookieUtils.setRefreshTokenCookie(response, refreshToken);
        response.sendRedirect(appConfigProperties.getFrontendUrl() + "/?oauth_success=true");
    }

    private void handleErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.sendRedirect(appConfigProperties.getFrontendUrl() + "/auth/error?message=" + urlEncode(message));
    }
}
