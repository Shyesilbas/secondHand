package com.serhat.secondhand.core.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@Slf4j
@RequiredArgsConstructor
public class OAuth2LoginFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    private final AppConfigProperties appConfigProperties;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                         AuthenticationException exception) throws IOException {

        log.error("OAuth2 authentication failed", exception);

        // The exception text can carry provider internals; the details stay in the log.
        String errorMessage = URLEncoder.encode("Sign-in with the provider failed. Please try again.", StandardCharsets.UTF_8);
        response.sendRedirect(appConfigProperties.getFrontendUrl() + "/auth/error?message=" + errorMessage);
    }
}
