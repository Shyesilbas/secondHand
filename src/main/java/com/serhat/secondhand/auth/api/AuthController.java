package com.serhat.secondhand.auth.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;

import com.serhat.secondhand.auth.application.LoginService;
import com.serhat.secondhand.auth.application.RegistrationService;
import com.serhat.secondhand.auth.application.OAuthService;
import com.serhat.secondhand.auth.domain.dto.request.LoginRequest;
import com.serhat.secondhand.auth.domain.dto.request.OAuthCompleteRequest;
import com.serhat.secondhand.auth.domain.dto.request.RegisterRequest;
import com.serhat.secondhand.auth.domain.dto.response.AuthClientResponse;
import com.serhat.secondhand.auth.domain.dto.response.AuthMessageResponse;
import com.serhat.secondhand.auth.domain.dto.response.LoginResponse;
import com.serhat.secondhand.auth.domain.exception.InvalidRefreshTokenException;
import com.serhat.secondhand.core.security.CookieUtils;
import com.serhat.secondhand.core.security.PublicEndpoint;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "User authentication and authorization operations")
public class AuthController {

    private final LoginService loginService;
    private final RegistrationService registrationService;
    private final OAuthService oauthService;
    private final CookieUtils cookieUtils;

    @PublicEndpoint
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration request for email: {}", request.getEmail());
        return ResultResponses.ok(registrationService.register(request));
    }

    @PublicEndpoint
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse httpResponse) {
        log.info("Login request for email: {}", request.email());
        LoginResponse response = loginService.login(request);

        setAuthCookies(httpResponse, response);

        log.info("Login successful for user: {}, tokens set in secure cookies", request.email());
        return ResultResponses.ok(Result.success(AuthClientResponse.from(response)));
    }

    private void setAuthCookies(HttpServletResponse httpResponse, LoginResponse response) {
        cookieUtils.setAccessTokenCookie(httpResponse, response.getAccessToken());
        cookieUtils.setRefreshTokenCookie(httpResponse, response.getRefreshToken(), response.isRememberMe());
    }

    @PublicEndpoint
    @GetMapping("/oauth2/google")
    public ResponseEntity<?> redirectToGoogle() {
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create("/oauth2/authorization/google"))
                .build();
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            Authentication authentication,
            HttpServletRequest request,
            HttpServletResponse httpResponse) {
        
        log.info("Logout request for user: {}", authentication.getName());
        
        String refreshToken = cookieUtils.getRefreshTokenFromCookies(request).orElse(null);
        AuthMessageResponse response = loginService.logout(authentication, refreshToken);

        cookieUtils.clearAuthCookies(httpResponse);

        log.info("Logout successful for user: {}, cookies cleared", authentication.getName());
        return ResultResponses.ok(Result.success(response));
    }

    @PublicEndpoint
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(
            HttpServletRequest request,
            HttpServletResponse httpResponse) {
        log.info("Token refresh request");

        String refreshToken = cookieUtils.getRefreshTokenFromCookies(request)
                .orElseThrow(InvalidRefreshTokenException::notFound);

        LoginResponse response = loginService.refreshToken(refreshToken);

        setAuthCookies(httpResponse, response);

        log.info("Token refresh successful, new tokens set in cookies");
        return ResultResponses.ok(Result.success(AuthClientResponse.from(response)));
    }


    @PublicEndpoint
    @PostMapping("/oauth2/complete")
    public ResponseEntity<?> completeOAuth(
            @Valid @RequestBody OAuthCompleteRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        log.info("Completing OAuth registration for email: {}", request.getEmail());
        LoginResponse response = oauthService.completeOAuthRegistration(request, httpRequest);
        
        setAuthCookies(httpResponse, response);

        log.info("OAuth completion successful for user: {}, tokens set in secure cookies", request.getEmail());
        return ResultResponses.ok(Result.success(AuthClientResponse.from(response)));
    }

    @PostMapping("/revoke-all-sessions")
    @Operation(summary = "Revoke all user sessions", description = "Invalidates all active sessions for the authenticated user")
    public ResponseEntity<?> revokeAllSessions(
            Authentication authentication,
            HttpServletRequest request,
            HttpServletResponse httpResponse) {
        
        log.info("Revoke all sessions request for user: {}", authentication.getName());
        AuthMessageResponse response = loginService.revokeAllSessions(authentication, request);

        cookieUtils.clearAuthCookies(httpResponse);

        log.info("All sessions revoked for user: {}, cookies cleared", authentication.getName());
        return ResultResponses.ok(Result.success(response));
    }
}