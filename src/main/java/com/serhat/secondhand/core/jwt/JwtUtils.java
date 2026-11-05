package com.serhat.secondhand.core.jwt;

import com.serhat.secondhand.core.config.JwtConfig;
import com.serhat.secondhand.user.domain.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtUtils {

    private final JwtConfig jwtConfig;

    // Every token names this service as issuer and audience and says what it is for in "typ", so an
    // access, refresh or OAuth registration token is never accepted in place of another.
    static final String ISSUER = "secondhand";
    static final String AUDIENCE = "secondhand-web";
    static final String CLAIM_TYPE = "typ";
    static final String TYPE_ACCESS = "access";
    static final String TYPE_REFRESH = "refresh";
    static final String TYPE_OAUTH_REGISTRATION = "oauth_registration";

    // Decoded once: the secret does not change at runtime.
    private volatile SecretKey signingKey;
    private volatile SecretKey registrationSigningKey;
    private volatile JwtParser parser;
    private volatile JwtParser registrationParser;

    public long getAccessTokenExpiration() {
        return jwtConfig.getAccessToken().getExpiration();
    }

    public long getRefreshTokenExpiration() {
        return jwtConfig.getRefreshToken().getExpiration();
    }

    public long getRememberMeExpiration() {
        return jwtConfig.getRefreshToken().getRememberMeExpiration();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateAccessToken(UserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();
        if (userDetails instanceof User user) {
            extraClaims.put("userId", user.getId());
            extraClaims.put("plan", user.getEffectivePlan().name());
            extraClaims.put("planExpiry", user.getExpirationDate() != null ? user.getExpirationDate().toString() : null);
        }
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        extraClaims.put("roles", roles);
        return generateAccessToken(extraClaims, userDetails);
    }

    public String generateAccessToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        if (userDetails instanceof User user && !extraClaims.containsKey("userId")) {
            extraClaims = new HashMap<>(extraClaims);
            extraClaims.put("userId", user.getId());
            extraClaims.put("plan", user.getEffectivePlan().name());
            extraClaims.put("planExpiry", user.getExpirationDate() != null ? user.getExpirationDate().toString() : null);
        }
        if (!extraClaims.containsKey("roles")) {
            extraClaims = new HashMap<>(extraClaims);
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());
            extraClaims.put("roles", roles);
        }
        return buildToken(extraClaims, userDetails, getAccessTokenExpiration(), TYPE_ACCESS);
    }

    /**
     * Verifies signature, expiry, issuer, audience and that this is an access token, then returns all
     * claims; throws JwtException otherwise.
     */
    public Claims parseClaims(String token) {
        return requireType(extractAllClaims(token), TYPE_ACCESS);
    }

    /** Subject of a refresh token; throws JwtException for any other kind of token. */
    public String extractRefreshTokenSubject(String token) {
        return requireType(extractAllClaims(token), TYPE_REFRESH).getSubject();
    }

    private static Claims requireType(Claims claims, String expectedType) {
        if (!expectedType.equals(claims.get(CLAIM_TYPE, String.class))) {
            throw new JwtException("Token type mismatch: expected " + expectedType);
        }
        return claims;
    }

    public Long extractUserId(String token) {
        return userIdFrom(extractAllClaims(token));
    }

    public static Long userIdFrom(Claims claims) {
        Object userId = claims.get("userId");
        if (userId == null) return null;
        if (userId instanceof Number n) return n.longValue();
        if (userId instanceof String s) return Long.parseLong(s);
        return null;
    }

    public List<String> extractRoles(String token) {
        return rolesFrom(extractAllClaims(token));
    }

    public static List<String> rolesFrom(Claims claims) {
        Object roles = claims.get("roles");
        if (roles == null) return List.of("ROLE_USER");
        if (roles instanceof List<?> list) {
            return list.stream()
                    .filter(o -> o != null)
                    .map(Object::toString)
                    .collect(Collectors.toList());
        }
        return List.of("ROLE_USER");
    }

    public String generateRefreshToken(UserDetails userDetails, boolean rememberMe) {
        long expiration = rememberMe ? getRememberMeExpiration() : getRefreshTokenExpiration();
        return buildToken(new HashMap<>(), userDetails, expiration, TYPE_REFRESH);
    }

    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration, String type) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .claims(extraClaims)
                .claim(CLAIM_TYPE, type)
                .issuer(ISSUER)
                .audience().add(AUDIENCE).and()
                .subject(userDetails.getUsername())
                .id(UUID.randomUUID().toString())
                .issuedAt(new Date(now))
                .expiration(new Date(now + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public boolean isTokenValid(String token) {
        try {
            return !isTokenExpired(token);
        } catch (ExpiredJwtException e) {
            log.debug("JWT token is expired: {}", e.getMessage());
            return false;
        } catch (MalformedJwtException e) {
            log.warn("Malformed JWT token: {}", e.getMessage());
            return false;
        } catch (SignatureException e) {
            log.warn("Invalid JWT signature: {}", e.getMessage());
            return false;
        } catch (JwtException e) {
            log.error("JWT validation error: {}", e.getMessage(), e);
            return false;
        }
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        JwtParser current = parser;
        if (current == null) {
            current = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .requireIssuer(ISSUER)
                    .requireAudience(AUDIENCE)
                    .build();
            parser = current;
        }
        return current.parseSignedClaims(token).getPayload();
    }

    private SecretKey getSigningKey() {
        SecretKey current = signingKey;
        if (current == null) {
            current = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtConfig.getSecretKey()));
            signingKey = current;
        }
        return current;
    }

    // Registration tokens are signed with their own key derived from the secret (HMAC-SHA256 over a fixed
    // label), so a leaked or misrouted registration token can never verify as a session token.
    private SecretKey getRegistrationSigningKey() {
        SecretKey current = registrationSigningKey;
        if (current == null) {
            try {
                javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
                mac.init(getSigningKey());
                byte[] derived = mac.doFinal("secondhand:oauth-registration-token:v1".getBytes(java.nio.charset.StandardCharsets.UTF_8));
                current = Keys.hmacShaKeyFor(derived);
            } catch (java.security.GeneralSecurityException e) {
                throw new IllegalStateException("Cannot derive OAuth registration signing key", e);
            }
            registrationSigningKey = current;
        }
        return current;
    }

    // OAuth completion akışı için kısa ömürlü, tek amaçlı imzalı token.
    // Frontend, OAuth2 provider başarılı olduktan sonra bu token'ı sunucuya geri verir;
    // sunucu da email/sub bilgisini güvenilir biçimde token claim'lerinden alır.
    private static final Duration OAUTH_REG_TOKEN_TTL = Duration.ofMinutes(10);
    private static final String CLAIM_GOOGLE_SUB = "google_sub";
    private static final String CLAIM_EMAIL = "email";
    private static final String CLAIM_NAME = "name";
    private static final String CLAIM_SURNAME = "surname";
    private static final String CLAIM_PICTURE = "picture";

    public String generateOAuthRegistrationToken(String email, String googleSub, String name, String surname, String picture) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_TYPE, TYPE_OAUTH_REGISTRATION);
        if (googleSub != null) claims.put(CLAIM_GOOGLE_SUB, googleSub);
        if (email != null) claims.put(CLAIM_EMAIL, email);
        if (name != null) claims.put(CLAIM_NAME, name);
        if (surname != null) claims.put(CLAIM_SURNAME, surname);
        if (picture != null) claims.put(CLAIM_PICTURE, picture);

        long now = System.currentTimeMillis();
        return Jwts.builder()
                .claims(claims)
                .issuer(ISSUER)
                .audience().add(AUDIENCE).and()
                .subject(email != null ? email : "oauth-pending")
                .id(UUID.randomUUID().toString())
                .issuedAt(new Date(now))
                .expiration(new Date(now + OAUTH_REG_TOKEN_TTL.toMillis()))
                .signWith(getRegistrationSigningKey())
                .compact();
    }

    public Claims parseOAuthRegistrationToken(String token) {
        JwtParser current = registrationParser;
        if (current == null) {
            current = Jwts.parser()
                    .verifyWith(getRegistrationSigningKey())
                    .requireIssuer(ISSUER)
                    .requireAudience(AUDIENCE)
                    .build();
            registrationParser = current;
        }
        return requireType(current.parseSignedClaims(token).getPayload(), TYPE_OAUTH_REGISTRATION);
    }

}
