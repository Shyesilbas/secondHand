package com.serhat.secondhand.core.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Optional;

/**
 * Utility class for secure cookie management
 * Handles creation, retrieval, and deletion of authentication cookies
 */
@Component
@Slf4j
public class CookieUtils {

    @Value("${app.auth.cookie.domain:localhost}")
    private String cookieDomain;

    @Value("${app.auth.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.auth.cookie.same-site:Strict}")
    private String cookieSameSite;

    // Get JWT token expiration times from properties (in milliseconds)
    @Value("${jwt.accessToken.expiration}")
    private long jwtAccessTokenExpiration;

    @Value("${jwt.refreshToken.expiration}")
    private long jwtRefreshTokenExpiration;

    // Obfuscated cookie names for security
    public static final String ACCESS_TOKEN_COOKIE = "sh_at"; // secondhand_access_token
    public static final String REFRESH_TOKEN_COOKIE = "sh_rt"; // secondhand_refresh_token

    // Encryption key for token encryption (must be 32 characters for AES-256)
    @Value("${app.auth.cookie.encryption.key:SecondHandApp2024CookieEncryption}")
    private String encryptionKey;

    // Processed encryption key (exactly 32 bytes for AES-256)
    private byte[] processedEncryptionKey;

    /**
     * Initialize and validate encryption key
     */
    @PostConstruct
    private void initializeEncryptionKey() {
        try {
            // Convert string to bytes and ensure it's exactly 32 bytes for AES-256
            byte[] keyBytes = encryptionKey.getBytes(StandardCharsets.UTF_8);
            
            if (keyBytes.length == 32) {
                // Perfect, use as is
                processedEncryptionKey = keyBytes;
            } else if (keyBytes.length < 32) {
                // Pad with zeros to reach 32 bytes
                processedEncryptionKey = new byte[32];
                System.arraycopy(keyBytes, 0, processedEncryptionKey, 0, keyBytes.length);
                log.warn("Encryption key was padded to 32 bytes. Consider using a 32-character key for better security.");
            } else {
                // Truncate to 32 bytes
                processedEncryptionKey = new byte[32];
                System.arraycopy(keyBytes, 0, processedEncryptionKey, 0, 32);
                log.warn("Encryption key was truncated to 32 bytes. Consider using exactly a 32-character key.");
            }
            
            log.info("Cookie encryption initialized successfully with {}-byte key", processedEncryptionKey.length);
            
        } catch (Exception e) {
            log.error("Failed to initialize encryption key: {}", e.getMessage());
            // Fallback: create a default key
            processedEncryptionKey = "secondhand_default_key_32_bytes".getBytes(StandardCharsets.UTF_8);
            log.warn("Using fallback encryption key. This is not secure for production!");
        }
    }

    /**
     * Creates and sets an access token cookie
     */
    public void setAccessTokenCookie(HttpServletResponse response, String token) {
        String encryptedToken = encryptToken(token);
        int accessTokenMaxAge = (int) (jwtAccessTokenExpiration / 1000); // Convert to seconds
        Cookie cookie = createSecureCookie(ACCESS_TOKEN_COOKIE, encryptedToken, accessTokenMaxAge, "/");
        response.addCookie(cookie);
        addSameSiteAttribute(response, ACCESS_TOKEN_COOKIE, cookieSameSite);
        log.debug("Encrypted access token cookie set with SameSite={}, maxAge={}s", cookieSameSite, accessTokenMaxAge);
    }

    /**
     * Creates and sets a refresh token cookie
     */
    public void setRefreshTokenCookie(HttpServletResponse response, String token) {
        String encryptedToken = encryptToken(token);
        int refreshTokenMaxAge = (int) (jwtRefreshTokenExpiration / 1000); // Convert to seconds
        Cookie cookie = createSecureCookie(REFRESH_TOKEN_COOKIE, encryptedToken, refreshTokenMaxAge, "/");
        response.addCookie(cookie);
        addSameSiteAttribute(response, REFRESH_TOKEN_COOKIE, cookieSameSite);
        log.debug("Encrypted refresh token cookie set with SameSite={}, maxAge={}s and path=/", cookieSameSite, refreshTokenMaxAge);
    }

    /**
     * Retrieves access token from cookies
     */
    public Optional<String> getAccessTokenFromCookies(HttpServletRequest request) {
        return getCookieValue(request, ACCESS_TOKEN_COOKIE)
                .map(this::decryptToken);
    }

    /**
     * Retrieves refresh token from cookies
     */
    public Optional<String> getRefreshTokenFromCookies(HttpServletRequest request) {
        return getCookieValue(request, REFRESH_TOKEN_COOKIE)
                .map(this::decryptToken);
    }

    /**
     * Clears all authentication cookies
     */
    public void clearAuthCookies(HttpServletResponse response) {
        clearCookie(response, ACCESS_TOKEN_COOKIE, "/");
        clearCookie(response, REFRESH_TOKEN_COOKIE, "/");
        log.debug("Authentication cookies cleared");
    }

    /**
     * Creates a secure cookie with security best practices
     */
    private Cookie createSecureCookie(String name, String value, int maxAge, String path) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true); // Prevents XSS attacks
        cookie.setSecure(cookieSecure); // HTTPS only (should be true in production)
        cookie.setMaxAge(maxAge);
        cookie.setPath(path);
        

        if (!cookieDomain.equals("localhost") && !cookieDomain.equals("127.0.0.1")) {
            cookie.setDomain(cookieDomain);
            log.debug("Cookie domain set to: {}", cookieDomain);
        } else {
            log.debug("Cookie domain not set for localhost/127.0.0.1");
        }

        
        return cookie;
    }

    /**
     * Retrieves cookie value by name
     */
    private Optional<String> getCookieValue(HttpServletRequest request, String cookieName) {
        if (request.getCookies() == null) {
            log.debug("No cookies found in request for cookie: {}", cookieName);
            return Optional.empty();
        }

        log.debug("Looking for cookie '{}' among {} cookies", cookieName, request.getCookies().length);
        
        // Debug: log all cookie names
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

    /**
     * Clears a specific cookie
     */
    private void clearCookie(HttpServletResponse response, String cookieName, String path) {
        Cookie cookie = new Cookie(cookieName, "");
        cookie.setMaxAge(0);
        cookie.setPath(path);
        cookie.setHttpOnly(true);
        cookie.setSecure(cookieSecure);
        
        // Same domain logic as createSecureCookie
        if (!cookieDomain.equals("localhost") && !cookieDomain.equals("127.0.0.1")) {
            cookie.setDomain(cookieDomain);
        }
        
        response.addCookie(cookie);
        log.debug("Cookie '{}' cleared with path '{}'", cookieName, path);
    }

    /**
     * Adds SameSite attribute to cookie via response header
     * This is needed because Cookie class doesn't support SameSite directly
     */
    public void addSameSiteAttribute(HttpServletResponse response, String cookieName, String sameSite) {
        // Get all Set-Cookie headers
        java.util.Collection<String> cookieHeaders = response.getHeaders("Set-Cookie");
        
        if (cookieHeaders != null && !cookieHeaders.isEmpty()) {
            // Clear existing Set-Cookie headers
            response.setHeader("Set-Cookie", null);
            
            // Re-add all headers with SameSite attribute where needed
            for (String cookieHeader : cookieHeaders) {
                if (cookieHeader.contains(cookieName + "=") && !cookieHeader.contains("SameSite=")) {
                    cookieHeader = cookieHeader + "; SameSite=" + sameSite;
                }
                response.addHeader("Set-Cookie", cookieHeader);
            }
        }
    }

    /**
     * Encrypts token using AES encryption
     */
    private String encryptToken(String token) {
        try {
            javax.crypto.Cipher cipher = javax.crypto.Cipher.getInstance("AES/ECB/PKCS5Padding");
            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(
                    processedEncryptionKey, "AES");
            cipher.init(javax.crypto.Cipher.ENCRYPT_MODE, secretKey);
            
            byte[] encryptedBytes = cipher.doFinal(token.getBytes(StandardCharsets.UTF_8));
            return java.util.Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            log.error("Token encryption failed: {}", e.getMessage());
            // In case of encryption failure, return original token (fallback)
            return token;
        }
    }

    /**
     * Decrypts token using AES decryption
     */
    private String decryptToken(String encryptedToken) {
        try {
            javax.crypto.Cipher cipher = javax.crypto.Cipher.getInstance("AES/ECB/PKCS5Padding");
            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(
                    processedEncryptionKey, "AES");
            cipher.init(javax.crypto.Cipher.DECRYPT_MODE, secretKey);
            
            byte[] decryptedBytes = cipher.doFinal(java.util.Base64.getDecoder().decode(encryptedToken));
            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Token decryption failed: {}", e.getMessage());
            // In case of decryption failure, return encrypted token (might be plain text)
            return encryptedToken;
        }
    }
}
