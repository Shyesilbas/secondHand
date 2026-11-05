package com.serhat.secondhand.auth;

import com.serhat.secondhand.auth.application.AccessRevocationService;
import com.serhat.secondhand.auth.application.TokenService;
import com.serhat.secondhand.core.jwt.JwtUtils;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.Arrays;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AccessRevocationServiceTest {

    @SuppressWarnings("unchecked")
    private final ValueOperations<String, String> ops = mock(ValueOperations.class);
    private final StringRedisTemplate redis = mock(StringRedisTemplate.class);
    private final JwtUtils jwtUtils = mock(JwtUtils.class);
    private final AccessRevocationService service;

    AccessRevocationServiceTest() {
        when(redis.opsForValue()).thenReturn(ops);
        service = new AccessRevocationService(redis, mock(TokenService.class), jwtUtils);
    }

    @Test
    void logout_revokesThatTokenUntilItWouldExpire() {
        Claims claims = mock(Claims.class);
        when(claims.getId()).thenReturn("jti-9");
        when(claims.getExpiration()).thenReturn(new Date(System.currentTimeMillis() + 60_000));
        when(jwtUtils.parseClaims("access")).thenReturn(claims);

        service.revokeAccessToken("access");

        verify(ops).set(eq("auth:access-token-revoked:jti-9"), eq("1"),
                argThat((Duration ttl) -> ttl.toMillis() > 0 && ttl.toMillis() <= 60_000));
    }

    @Test
    void unparseableToken_isIgnored() {
        when(jwtUtils.parseClaims("bad")).thenThrow(new IllegalArgumentException());

        service.revokeAccessToken("bad");

        verifyNoInteractions(ops);
    }

    @Test
    void isRevoked_trueForRevokedTokenId_falseForOtherTokens() {
        when(ops.multiGet(anyList())).thenAnswer(inv -> {
            java.util.List<String> keys = inv.getArgument(0);
            return Arrays.asList(null, keys.get(1).endsWith("jti-9") ? "1" : null);
        });

        assertThat(service.isRevoked(1L, new Date(), "jti-9")).isTrue();
        assertThat(service.isRevoked(1L, new Date(), "jti-other")).isFalse();
    }

    @Test
    void isRevoked_tokenIssuedBeforeUserRevocation() {
        long revokedAt = System.currentTimeMillis();
        when(ops.multiGet(anyList())).thenReturn(Arrays.asList(Long.toString(revokedAt), null));

        assertThat(service.isRevoked(1L, new Date(revokedAt - 5_000), "jti")).isTrue();
        assertThat(service.isRevoked(1L, new Date(revokedAt + 5_000), "jti")).isFalse();
    }
}
