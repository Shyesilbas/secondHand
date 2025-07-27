package com.serhat.secondhand.jwt;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.http.ResponseCookie;

import java.util.Arrays;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CookieService {

    private final JwtUtils jwtUtils;

    @Value("${app.cookie.domain}")
    private String cookieDomain;

    @Value("${app.cookie.secure}")
    private boolean cookieSecure;

    @Value("${app.cookie.sameSite}")
    private String cookieSameSite;

    private static final String ACCESS_TOKEN_COOKIE = "access_token";
    private static final String REFRESH_TOKEN_COOKIE = "refresh_token";


    public void setAccessTokenCookie(HttpServletResponse response, String accessToken) {
        int maxAge = (int) (jwtUtils.getAccessTokenExpiration() / 1000);
        ResponseCookie cookie = createSecureResponseCookie(ACCESS_TOKEN_COOKIE, accessToken, maxAge);
        response.addHeader("Set-Cookie", cookie.toString());
    }


    public void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        int maxAge = (int) (jwtUtils.getRefreshTokenExpiration() / 1000);
        ResponseCookie cookie = createSecureResponseCookie(REFRESH_TOKEN_COOKIE, refreshToken, maxAge);
        response.addHeader("Set-Cookie", cookie.toString());
    }


    public Optional<String> getAccessTokenFromCookie(HttpServletRequest request) {
        return getCookieValue(request, ACCESS_TOKEN_COOKIE);
    }


    public Optional<String> getRefreshTokenFromCookie(HttpServletRequest request) {
        return getCookieValue(request, REFRESH_TOKEN_COOKIE);
    }


    public void clearAuthenticationCookies(HttpServletResponse response) {
        clearCookie(response, ACCESS_TOKEN_COOKIE);
        clearCookie(response, REFRESH_TOKEN_COOKIE);
    }


    public Optional<String> getTokenFromHeader(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return Optional.of(authHeader.substring(7));
        }
        return Optional.empty();
    }


    public Optional<String> getAccessToken(HttpServletRequest request) {
        Optional<String> cookieToken = getAccessTokenFromCookie(request);
        if (cookieToken.isPresent()) {
            return cookieToken;
        }

        return getTokenFromHeader(request);
    }


    private ResponseCookie createSecureResponseCookie(String name, String value, int maxAge) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(maxAge)
                .sameSite(cookieSameSite);
        
        if (!"localhost".equals(cookieDomain)) {
            builder.domain(cookieDomain);
        }
        
        return builder.build();
    }

    private Optional<String> getCookieValue(HttpServletRequest request, String cookieName) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }

        return Arrays.stream(request.getCookies())
                .filter(cookie -> cookieName.equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(value -> value != null && !value.isEmpty())
                .findFirst();
    }

    private void clearCookie(HttpServletResponse response, String cookieName) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0)
                .sameSite(cookieSameSite);
        
        if (!"localhost".equals(cookieDomain)) {
            builder.domain(cookieDomain);
        }
        
        ResponseCookie cookie = builder.build();
        response.addHeader("Set-Cookie", cookie.toString());
    }
}