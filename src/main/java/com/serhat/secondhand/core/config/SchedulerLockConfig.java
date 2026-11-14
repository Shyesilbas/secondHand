package com.serhat.secondhand.core.config;

import net.javacrumbs.shedlock.core.LockProvider;
import net.javacrumbs.shedlock.provider.redis.spring.RedisLockProvider;
import net.javacrumbs.shedlock.spring.annotation.EnableSchedulerLock;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.data.redis.connection.RedisConnectionFactory;

/**
 * Distributed lock configuration for scheduled jobs using Redis-backed ShedLock.
 * Runs at {@link Ordered#HIGHEST_PRECEDENCE} so lock acquisition happens before {@code @Transactional}
 * checks out a database connection.
 */
@Configuration
@EnableSchedulerLock(
        defaultLockAtMostFor = "PT10M",
        order = Ordered.HIGHEST_PRECEDENCE
)
public class SchedulerLockConfig {

    public static final String LOCK_KEY_PREFIX = "v4:lock:scheduler";

    @Bean
    public LockProvider lockProvider(
            RedisConnectionFactory redisConnectionFactory,
            @Value("${spring.profiles.active:default}") String environment) {
        return new RedisLockProvider.Builder(redisConnectionFactory)
                .environment(environment)
                .keyPrefix(LOCK_KEY_PREFIX)
                .build();
    }
}
