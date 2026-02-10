package com.serhat.secondhand.core.jwt;

import com.serhat.secondhand.core.config.JwtConfig;
import com.serhat.secondhand.user.domain.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
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
        }
        if (!extraClaims.containsKey("roles")) {
            extraClaims = new HashMap<>(extraClaims);
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());
            extraClaims.put("roles", roles);
        }
        return buildToken(extraClaims, userDetails, getAccessTokenExpiration());
    }

    public Long extractUserId(String token) {
        Object userId = extractClaim(token, claims -> claims.get("userId"));
        if (userId == null) return null;
        if (userId instanceof Number n) return n.longValue();
        if (userId instanceof String s) return Long.parseLong(s);
        return null;
    }

    public List<String> extractRoles(String token) {
        Object roles = extractClaim(token, claims -> claims.get("roles"));
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
        return buildToken(new HashMap<>(), userDetails, expiration);
    }

    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .id(UUID.randomUUID().toString())                 .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
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
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtConfig.getSecretKey());
        return Keys.hmacShaKeyFor(keyBytes);
    }


}
