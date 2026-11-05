package com.serhat.secondhand.auth.application;

import com.serhat.secondhand.core.jwt.JwtUtils;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Date;

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

    /** True when the token was issued at or before the user's last access revocation. */
    public boolean isRevoked(Long userId, Date issuedAt) {
        String revokedAt = redisTemplate.opsForValue().get(KEY_PREFIX + userId);
        if (revokedAt == null) {
            return false;
        }
        // JWT iat has second precision, so compare whole seconds.
        long revokedAtSeconds = Long.parseLong(revokedAt) / 1000;
        return issuedAt == null || issuedAt.getTime() / 1000 <= revokedAtSeconds;
    }
}
