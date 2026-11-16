package com.serhat.secondhand.core.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

/** GV-33: prod startup refuses test endpoints and a Redis without a password. */
class ProdSecurityGuardTest {

    private ProdSecurityGuard guard(MockEnvironment environment) {
        return new ProdSecurityGuard(mock(JwtConfig.class), mock(CookieConfig.class),
                mock(CorsConfigProperties.class), mock(RateLimitConfig.class), environment);
    }

    @Test
    void testEndpointsAndMissingRedisPasswordFailStartup() {
        MockEnvironment environment = new MockEnvironment().withProperty("app.test-endpoints.enabled", "true");

        assertThatThrownBy(() -> guard(environment).validate())
                .hasMessageContaining("app.test-endpoints.enabled must be false")
                .hasMessageContaining("spring.data.redis.password");
    }

    @Test
    void configuredRedisPasswordAndDisabledTestEndpointsAreNotReported() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("app.test-endpoints.enabled", "false")
                .withProperty("spring.data.redis.password", "s3cret");

        assertThatThrownBy(() -> guard(environment).validate())
                .isInstanceOf(IllegalStateException.class)
                .satisfies(e -> org.assertj.core.api.Assertions.assertThat(e.getMessage())
                        .doesNotContain("app.test-endpoints").doesNotContain("redis"));
    }
}
