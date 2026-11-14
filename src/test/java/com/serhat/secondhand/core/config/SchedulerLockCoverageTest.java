package com.serhat.secondhand.core.config;

import net.javacrumbs.shedlock.core.LockProvider;
import net.javacrumbs.shedlock.provider.redis.spring.RedisLockProvider;
import net.javacrumbs.shedlock.spring.annotation.EnableSchedulerLock;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.Ordered;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.scheduling.annotation.Scheduled;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class SchedulerLockCoverageTest {

    /**
     * Workers that already enforce mutual exclusion across instances without ShedLock:
     * SKIP LOCKED outbox workers and Redis-locked complaint queue worker.
     */
    private static final Set<String> SELF_LOCKED_METHODS = Set.of(
            "com.serhat.secondhand.order.outbox.OrderOutboxWorker#processOutboxEvents",
            "com.serhat.secondhand.escrow.outbox.EscrowOutboxWorker#processPendingEvents",
            "com.serhat.secondhand.payment.outbox.PaymentOutboxWorker#processPendingEvents",
            "com.serhat.secondhand.complaint.queue.ComplaintReviewWorker#scheduleBatch"
    );

    @Test
    void everyScheduledMethodHasUniqueShedLockOrExplicitSelfLocking() throws Exception {
        ClassPathScanningCandidateComponentProvider scanner = new ClassPathScanningCandidateComponentProvider(true);
        var candidates = scanner.findCandidateComponents("com.serhat.secondhand");

        List<String> unlocked = new ArrayList<>();
        Set<String> lockNames = new HashSet<>();
        int scheduledCount = 0;

        for (var beanDef : candidates) {
            Class<?> clazz = Class.forName(beanDef.getBeanClassName());
            for (Method method : clazz.getDeclaredMethods()) {
                if (!method.isAnnotationPresent(Scheduled.class)) {
                    continue;
                }
                scheduledCount++;
                String fqMethod = clazz.getName() + "#" + method.getName();
                SchedulerLock lock = method.getAnnotation(SchedulerLock.class);
                if (lock == null) {
                    if (!SELF_LOCKED_METHODS.contains(fqMethod)) {
                        unlocked.add(fqMethod);
                    }
                    continue;
                }
                assertThat(lock.name()).as("Lock name for %s", fqMethod).isNotBlank();
                assertThat(lockNames.add(lock.name()))
                        .as("Duplicate ShedLock name '%s' on %s", lock.name(), fqMethod)
                        .isTrue();
            }
        }

        assertThat(scheduledCount).isGreaterThanOrEqualTo(16);
        assertThat(lockNames).hasSize(12);
        assertThat(unlocked).isEmpty();
    }

    @Test
    void schedulerLockConfigRunsLockAspectBeforeTransactionsAndCreatesRedisProvider() {
        EnableSchedulerLock annotation = SchedulerLockConfig.class.getAnnotation(EnableSchedulerLock.class);
        assertThat(annotation).isNotNull();
        assertThat(annotation.order()).isEqualTo(Ordered.HIGHEST_PRECEDENCE);

        SchedulerLockConfig config = new SchedulerLockConfig();
        LockProvider provider = config.lockProvider(mock(RedisConnectionFactory.class), "prod");
        assertThat(provider).isInstanceOf(RedisLockProvider.class);
    }
}
