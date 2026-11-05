package com.serhat.secondhand.auth;

import com.serhat.secondhand.auth.application.LoginAttemptService;
import com.serhat.secondhand.auth.domain.dto.response.AuthClientResponse;
import com.serhat.secondhand.auth.domain.dto.response.LoginResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class LoginAttemptServiceTest {

    private final Map<String, Long> store = new HashMap<>();
    private LoginAttemptService service;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        StringRedisTemplate redis = mock(StringRedisTemplate.class);
        ValueOperations<String, String> ops = mock(ValueOperations.class);
        when(redis.opsForValue()).thenReturn(ops);
        when(ops.setIfAbsent(anyString(), eq("0"), any(Duration.class)))
                .thenAnswer(inv -> store.putIfAbsent(inv.getArgument(0), 0L) == null);
        when(ops.increment(anyString())).thenAnswer(inv -> store.merge(inv.getArgument(0), 1L, Long::sum));
        when(ops.multiGet(anyList())).thenAnswer(inv -> ((List<String>) inv.getArgument(0)).stream()
                .map(k -> store.containsKey(k) ? store.get(k).toString() : null).toList());
        when(redis.delete(anyString())).thenAnswer(inv -> store.remove((String) inv.getArgument(0)) != null);
        service = new LoginAttemptService(redis);
    }

    private void fail(String email, String ip, int times) {
        for (int i = 0; i < times; i++) {
            service.loginFailed(email, ip);
        }
    }

    @Test
    void failuresFromAttackerIp_doNotLockOwnerOnOtherIp() {
        fail("victim@x.com", "6.6.6.6", 5);

        assertThat(service.isBlocked("victim@x.com", "6.6.6.6")).isTrue();
        assertThat(service.isBlocked("victim@x.com", "1.2.3.4")).isFalse();
    }

    @Test
    void emailVariants_shareOneCounter() {
        fail("User@X.com ", "1.1.1.1", 4);
        fail("user@x.com", "1.1.1.1", 1);

        assertThat(service.isBlocked("USER@x.com", "1.1.1.1")).isTrue();
    }

    @Test
    void oneIpTryingManyAccounts_isBlockedForAllAccounts() {
        for (int i = 0; i < 20; i++) {
            service.loginFailed("user" + i + "@x.com", "9.9.9.9");
        }

        assertThat(service.isBlocked("fresh@x.com", "9.9.9.9")).isTrue();
        assertThat(service.isBlocked("fresh@x.com", "8.8.8.8")).isFalse();
    }

    @Test
    void successfulLogin_clearsAccountCounterButNotIpCounter() {
        fail("a@x.com", "2.2.2.2", 4);
        for (int i = 0; i < 15; i++) {
            service.loginFailed("other" + i + "@x.com", "2.2.2.2");
        }
        service.loginSucceeded("a@x.com", "2.2.2.2");

        // 4 + 15 = 19 IP failures remain; one more reaches the IP limit even for a cleared account.
        assertThat(service.isBlocked("a@x.com", "2.2.2.2")).isFalse();
        service.loginFailed("a@x.com", "2.2.2.2");
        assertThat(service.isBlocked("a@x.com", "2.2.2.2")).isTrue();
    }

    @Test
    void clientResponse_neverCarriesTokens() {
        LoginResponse login = new LoginResponse("ok", 1L, "a@x.com", "access-jwt", "refresh-jwt", false);
        login.setPlan("PREMIUM");

        AuthClientResponse body = AuthClientResponse.from(login);

        assertThat(body.toString()).doesNotContain("access-jwt").doesNotContain("refresh-jwt");
        assertThat(body.plan()).isEqualTo("PREMIUM");
        assertThat(Arrays.stream(AuthClientResponse.class.getRecordComponents()).map(c -> c.getName()))
                .noneMatch(name -> name.toLowerCase().contains("token"));
    }
}
