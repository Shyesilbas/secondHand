package com.serhat.secondhand.core.security;

import com.serhat.secondhand.core.config.CookieConfig;
import com.serhat.secondhand.core.config.JwtConfig;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Optional;

@Component
@Slf4j
@RequiredArgsConstructor
public class CookieUtils {

    private final CookieConfig cookieConfig;
    private final JwtConfig jwtConfig;

    public static final String ACCESS_TOKEN_COOKIE = "sh_at";
    public static final String REFRESH_TOKEN_COOKIE = "sh_rt";

    public void setAccessTokenCookie(HttpServletResponse response, String token) {
        int accessTokenMaxAge = (int) (jwtConfig.getAccessToken().getExpiration() / 1000);
        Cookie cookie = createSecureCookie(ACCESS_TOKEN_COOKIE, token, accessTokenMaxAge, "/");
        response.addCookie(cookie);
        addSameSiteAttribute(response, ACCESS_TOKEN_COOKIE, cookieConfig.getSameSite());
        log.debug("Access token cookie set with SameSite={}, maxAge={}s", cookieConfig.getSameSite(), accessTokenMaxAge);
    }

    public void setRefreshTokenCookie(HttpServletResponse response, String token) {
        setRefreshTokenCookie(response, token, false);
    }

    public void setRefreshTokenCookie(HttpServletResponse response, String token, boolean rememberMe) {
        long expirationMs = rememberMe ? jwtConfig.getRefreshToken().getRememberMeExpiration() : jwtConfig.getRefreshToken().getExpiration();
        int refreshTokenMaxAge = (int) (expirationMs / 1000);
        Cookie cookie = createSecureCookie(REFRESH_TOKEN_COOKIE, token, refreshTokenMaxAge, "/");
        response.addCookie(cookie);
        addSameSiteAttribute(response, REFRESH_TOKEN_COOKIE, cookieConfig.getSameSite());
        log.debug("Refresh token cookie set with SameSite={}, maxAge={}s, rememberMe={}", cookieConfig.getSameSite(), refreshTokenMaxAge, rememberMe);
    }

    public Optional<String> getAccessTokenFromCookies(HttpServletRequest request) {
        return getCookieValue(request, ACCESS_TOKEN_COOKIE);
    }

    public Optional<String> getRefreshTokenFromCookies(HttpServletRequest request) {
        return getCookieValue(request, REFRESH_TOKEN_COOKIE);
    }

        public void clearAuthCookies(HttpServletResponse response) {
        clearCookie(response, ACCESS_TOKEN_COOKIE, "/");
        clearCookie(response, REFRESH_TOKEN_COOKIE, "/");
        log.debug("Authentication cookies cleared");
    }

        private Cookie createSecureCookie(String name, String value, int maxAge, String path) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);         cookie.setSecure(cookieConfig.isSecure());         cookie.setMaxAge(maxAge);
        cookie.setPath(path);
        

        if (!cookieConfig.getDomain().equals("localhost") && !cookieConfig.getDomain().equals("127.0.0.1")) {
            cookie.setDomain(cookieConfig.getDomain());
            log.debug("Cookie domain set to: {}", cookieConfig.getDomain());
        } else {
            log.debug("Cookie domain not set for localhost/127.0.0.1");
        }

        
        return cookie;
    }

        private Optional<String> getCookieValue(HttpServletRequest request, String cookieName) {
        if (request.getCookies() == null) {
            log.debug("No cookies found in request for cookie: {}", cookieName);
            return Optional.empty();
        }

        log.debug("Looking for cookie '{}' among {} cookies", cookieName, request.getCookies().length);
        
                if (log.isDebugEnabled()) {
            String allCookieNames = Arrays.stream(request.getCookies())
                    .map(Cookie::getName)
                    .collect(java.util.stream.Collectors.joining(", "));
            log.debug("Available cookies: [{}]", allCookieNames);
        }

        Optional<String> result = Arrays.stream(request.getCookies())
                .filter(cookie -> cookieName.equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(value -> value != null && !value.trim().isEmpty())
                .findFirst();
                
        if (result.isPresent()) {
            log.debug("Found cookie '{}' with value length: {}", cookieName, result.get().length());
        } else {
            log.debug("Cookie '{}' not found or empty", cookieName);
        }
        
        return result;
    }

        private void clearCookie(HttpServletResponse response, String cookieName, String path) {
        Cookie cookie = new Cookie(cookieName, "");
        cookie.setMaxAge(0);
        cookie.setPath(path);
        cookie.setHttpOnly(true);
        cookie.setSecure(cookieConfig.isSecure());
        
                if (!cookieConfig.getDomain().equals("localhost") && !cookieConfig.getDomain().equals("127.0.0.1")) {
            cookie.setDomain(cookieConfig.getDomain());
        }
        
        response.addCookie(cookie);
        log.debug("Cookie '{}' cleared with path '{}'", cookieName, path);
    }

    public void addSameSiteAttribute(HttpServletResponse response, String cookieName, String sameSite) {
        java.util.Collection<String> cookieHeaders = response.getHeaders("Set-Cookie");
        
        if (cookieHeaders != null && !cookieHeaders.isEmpty()) {
            response.setHeader("Set-Cookie", null);
            
            for (String cookieHeader : cookieHeaders) {
                if (cookieHeader.contains(cookieName + "=") && !cookieHeader.contains("SameSite=")) {
                    cookieHeader = cookieHeader + "; SameSite=" + sameSite;
                }
                response.addHeader("Set-Cookie", cookieHeader);
            }
        }
    }
}
