package com.serhat.secondhand.auth.application;

import com.serhat.secondhand.core.jwt.JwtUtils;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import java.time.Duration;
import java.util.Date;
import java.util.List;

/**
 * Cuts off a user's access immediately, without waiting for already issued access tokens to expire.
 *
 * <p>Access tokens are stateless, so revoking refresh tokens alone leaves every issued access token
 * usable for its full lifetime. {@link #revokeAllAccess} also stores the revocation time in Redis for
 * one access-token lifetime; {@code AuthenticationFilter} rejects any access token issued at or before
 * that time. Tokens issued after it (for example once an account is reactivated) are not affected.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AccessRevocationService {

    static final String KEY_PREFIX = "auth:access-revoked:";
    static final String TOKEN_KEY_PREFIX = "auth:access-token-revoked:";

    private final StringRedisTemplate redisTemplate;
    private final TokenService tokenService;
    private final JwtUtils jwtUtils;

    public void revokeAllAccess(User user) {
        tokenService.revokeAllUserTokens(user);
        redisTemplate.opsForValue().set(
                KEY_PREFIX + user.getId(),
                Long.toString(System.currentTimeMillis()),
                Duration.ofMillis(jwtUtils.getAccessTokenExpiration()));
        log.warn("All access revoked for user id {}", user.getId());
    }

    /**
     * Revokes one access token (logout). Other sessions of the user keep working. The entry lives only
     * until the token would have expired anyway. Unparseable or already expired tokens need no entry.
     */
    public void revokeAccessToken(String accessToken) {
        if (accessToken == null || accessToken.isBlank()) {
            return;
        }
        Claims claims;
        try {
            claims = jwtUtils.parseClaims(accessToken);
        } catch (Exception e) {
            return;
        }
        if (claims == null || claims.getId() == null || claims.getExpiration() == null) {
            return;
        }
        long ttlMillis = claims.getExpiration().getTime() - System.currentTimeMillis();
        if (ttlMillis > 0) {
            redisTemplate.opsForValue().set(TOKEN_KEY_PREFIX + claims.getId(), "1", Duration.ofMillis(ttlMillis));
        }
    }

    /**
     * True when the token was issued at or before the user's last access revocation, or this token
     * itself was revoked by logout. Both keys are read in one round trip.
     */
    public boolean isRevoked(Long userId, Date issuedAt, String tokenId) {
        List<String> values = redisTemplate.opsForValue().multiGet(List.of(
                KEY_PREFIX + userId,
                TOKEN_KEY_PREFIX + (tokenId != null ? tokenId : "")));
        String revokedAt = values != null ? values.get(0) : null;
        String tokenRevoked = values != null ? values.get(1) : null;
        if (tokenId != null && tokenRevoked != null) {
            return true;
        }
        if (revokedAt == null) {
            return false;
        }
        // JWT iat has second precision, so compare whole seconds.
        long revokedAtSeconds = Long.parseLong(revokedAt) / 1000;
        return issuedAt == null || issuedAt.getTime() / 1000 <= revokedAtSeconds;
    }
}
