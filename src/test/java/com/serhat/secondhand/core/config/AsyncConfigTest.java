package com.serhat.secondhand.core.config;

import org.junit.jupiter.api.Test;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class AsyncConfigTest {

    @Test
    void taskExecutorRunsRejectedTaskOnCallerThreadInsteadOfDroppingIt() throws InterruptedException {
        AsyncConfigProperties props = new AsyncConfigProperties();
        props.setCorePoolSize(1);
        props.setMaxPoolSize(1);
        props.setQueueCapacity(1);
        props.setThreadNamePrefix("test-task-");

        AsyncConfig config = new AsyncConfig(props);
        ThreadPoolTaskExecutor executor = config.taskExecutor();

        CountDownLatch blocker = new CountDownLatch(1);
        CountDownLatch workerStarted = new CountDownLatch(1);
        AtomicInteger completed = new AtomicInteger();
        AtomicReference<String> overflowThreadName = new AtomicReference<>();
        String callerThreadName = Thread.currentThread().getName();

        try {
            // Task 1 occupies the single worker thread.
            executor.execute(() -> {
                workerStarted.countDown();
                try {
                    blocker.await(5, TimeUnit.SECONDS);
                } catch (InterruptedException ignored) {
                    Thread.currentThread().interrupt();
                }
                completed.incrementAndGet();
            });
            assertThat(workerStarted.await(5, TimeUnit.SECONDS)).isTrue();

            // Task 2 fills the single queue slot.
            executor.execute(completed::incrementAndGet);

            // Task 3 overflows pool+queue and MUST execute synchronously on caller thread via CallerRunsPolicy.
            executor.execute(() -> {
                overflowThreadName.set(Thread.currentThread().getName());
                completed.incrementAndGet();
            });

            assertThat(overflowThreadName.get()).isEqualTo(callerThreadName);
        } finally {
            blocker.countDown();
            executor.shutdown();
        }

        assertThat(completed.get()).isEqualTo(3);
    }

    @Test
    void notificationExecutorUsesCallerRunsPolicyWhenQueueSaturates() {
        AsyncConfig config = new AsyncConfig(new AsyncConfigProperties());
        ThreadPoolTaskExecutor executor = config.notificationExecutor();
        try {
            assertThat(executor.getThreadPoolExecutor().getRejectedExecutionHandler()).isNotNull();
            // Submitting directly still executes cleanly; handler wraps CallerRunsPolicy.
            AtomicInteger executed = new AtomicInteger();
            executor.getThreadPoolExecutor().getRejectedExecutionHandler()
                    .rejectedExecution(executed::incrementAndGet, executor.getThreadPoolExecutor());
            assertThat(executed.get()).isEqualTo(1);
        } finally {
            executor.shutdown();
        }
    }
}
