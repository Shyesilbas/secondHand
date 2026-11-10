package com.serhat.secondhand.core.security;

import com.serhat.secondhand.core.config.RateLimitConfig;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class RateLimitingFilterTest {

    private final RateLimitConfig config = new RateLimitConfig();
    private final StringRedisTemplate redis = mock(StringRedisTemplate.class);
    private ClientIpResolver ipResolver;
    private RateLimitingFilter filter;

    @BeforeEach
    void setUp() {
        ipResolver = new ClientIpResolver(config);
        ipResolver.init();
        filter = new RateLimitingFilter(config, ipResolver, redis);
        filter.init();
    }

    private MockHttpServletRequest request(String remoteAddr, String xff) {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/listings");
        request.setRemoteAddr(remoteAddr);
        if (xff != null) {
            request.addHeader("X-Forwarded-For", xff);
        }
        return request;
    }

    @Test
    void forwardedHeaderFromPublicPeerIsIgnored() {
        assertThat(ipResolver.resolve(request("203.0.113.9", "1.2.3.4"))).isEqualTo("203.0.113.9");
    }

    @Test
    void behindTrustedProxyTheRightmostUntrustedHopIsTheClient() {
        // The client prepended a fake hop; the proxy appended the real peer address.
        assertThat(ipResolver.resolve(request("10.0.0.5", "6.6.6.6, 198.51.100.7"))).isEqualTo("198.51.100.7");
        assertThat(ipResolver.resolve(request("10.0.0.5", "198.51.100.7, 10.0.0.9"))).isEqualTo("198.51.100.7");
    }

    @Test
    void malformedOrAllTrustedChainFallsBackToPeer() {
        assertThat(ipResolver.resolve(request("10.0.0.5", "evil.example.com"))).isEqualTo("10.0.0.5");
        assertThat(ipResolver.resolve(request("10.0.0.5", "10.0.0.8"))).isEqualTo("10.0.0.5");
    }

    @Test
    void forwardedHeadersAreIgnoredWhenTrustIsOff() {
        config.setTrustForwardedHeaders(false);
        assertThat(ipResolver.resolve(request("10.0.0.5", "198.51.100.7"))).isEqualTo("10.0.0.5");
    }

    @Test
    void onlyPaymentPathsUseThePaymentBucket() {
        assertThat(RateLimitingFilter.categorize("/api/v1/payments")).isEqualTo(RateLimitingFilter.Category.PAYMENT);
        assertThat(RateLimitingFilter.categorize("/api/v1/payments/transfer"))
                .isEqualTo(RateLimitingFilter.Category.PAYMENT);
        assertThat(RateLimitingFilter.categorize("/api/v1/listings/payment-guide"))
                .isEqualTo(RateLimitingFilter.Category.GENERAL);
        assertThat(RateLimitingFilter.categorize("/api/v1/paymentsX")).isEqualTo(RateLimitingFilter.Category.GENERAL);
        assertThat(RateLimitingFilter.categorize("/api/v1/auth/login")).isEqualTo(RateLimitingFilter.Category.AUTH);
    }

    @Test
    @SuppressWarnings("unchecked")
    void requestOverTheSharedLimitIsRejected() throws Exception {
        long limit = RateLimitingFilter.Category.GENERAL.resolveLimit(config);
        when(redis.execute(any(RedisScript.class), anyList(), anyString())).thenReturn(limit + 1);
        FilterChain chain = mock(FilterChain.class);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request("203.0.113.9", null), response, chain);

        assertThat(response.getStatus()).isEqualTo(429);
        assertThat(response.getHeader("Retry-After")).isNotNull();
        verifyNoInteractions(chain);
        verify(redis).execute(any(RedisScript.class),
                argThat((List<String> keys) -> keys.get(0).startsWith("ratelimit:general:203.0.113.9:")), anyString());
    }

    @Test
    @SuppressWarnings("unchecked")
    void requestWithinTheLimitPasses() throws Exception {
        when(redis.execute(any(RedisScript.class), anyList(), anyString())).thenReturn(1L);
        FilterChain chain = mock(FilterChain.class);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request("203.0.113.9", null), response, chain);

        verify(chain).doFilter(any(), any());
        long expectedRemaining = RateLimitingFilter.Category.GENERAL.resolveLimit(config) - 1;
        assertThat(response.getHeader("X-RateLimit-Remaining")).isEqualTo(String.valueOf(expectedRemaining));
    }

    @Test
    void defaultCategoryLimitsAreSensibleForECommerce() {
        assertThat(RateLimitingFilter.Category.PAYMENT.resolveLimit(config)).isEqualTo(10);
        assertThat(RateLimitingFilter.Category.AUTH.resolveLimit(config)).isEqualTo(20);
        assertThat(RateLimitingFilter.Category.AI.resolveLimit(config)).isEqualTo(15);
        assertThat(RateLimitingFilter.Category.GENERAL.resolveLimit(config)).isEqualTo(150);
    }

    @Test
    @SuppressWarnings("unchecked")
    void redisOutageRejectsInsteadOfLettingRequestsThroughUnlimited() throws Exception {
        when(redis.execute(any(RedisScript.class), anyList(), anyString()))
                .thenThrow(new RedisConnectionFailureException("down"));
        FilterChain chain = mock(FilterChain.class);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request("203.0.113.9", null), response, chain);

        assertThat(response.getStatus()).isEqualTo(503);
        verifyNoInteractions(chain);
    }
}
