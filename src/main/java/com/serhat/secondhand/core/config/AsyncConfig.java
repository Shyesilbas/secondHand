package com.serhat.secondhand.core.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.lang.reflect.Method;
import java.util.concurrent.Executor;
import java.util.concurrent.RejectedExecutionHandler;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
@EnableAsync
@Slf4j
@RequiredArgsConstructor
public class AsyncConfig implements AsyncConfigurer {

    private final AsyncConfigProperties asyncConfigProperties;

    @Bean(name = "taskExecutor")
    public ThreadPoolTaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(asyncConfigProperties.getCorePoolSize());
        executor.setMaxPoolSize(asyncConfigProperties.getMaxPoolSize());
        executor.setQueueCapacity(asyncConfigProperties.getQueueCapacity());
        executor.setThreadNamePrefix(asyncConfigProperties.getThreadNamePrefix());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.setRejectedExecutionHandler(callerRunsWithWarning("taskExecutor"));
        executor.initialize();

        log.info("Async executor initialized - Core: {}, Max: {}, Queue: {} with CallerRunsPolicy",
            asyncConfigProperties.getCorePoolSize(), asyncConfigProperties.getMaxPoolSize(), asyncConfigProperties.getQueueCapacity());
        return executor;
    }

    @Bean(name = "notificationExecutor")
    public ThreadPoolTaskExecutor notificationExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("notification-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.setRejectedExecutionHandler(callerRunsWithWarning("notificationExecutor"));
        executor.initialize();

        log.info("Notification executor initialized - Core: 2, Max: 5, Queue: 200 with CallerRunsPolicy");
        return executor;
    }

    private RejectedExecutionHandler callerRunsWithWarning(String executorName) {
        ThreadPoolExecutor.CallerRunsPolicy delegate = new ThreadPoolExecutor.CallerRunsPolicy();
        return (task, executor) -> {
            log.warn("Async executor '{}' queue saturated (active={}, pool={}, queue={}); running on caller thread",
                    executorName, executor.getActiveCount(), executor.getPoolSize(), executor.getQueue().size());
            delegate.rejectedExecution(task, executor);
        };
    }

    /**
     * Complaint moderation batches (Gemini calls, up to 15 s each) run here so they never hold the
     * shared scheduler thread. One thread: the worker lock allows one batch at a time anyway.
     */
    @Bean(name = "moderationExecutor")
    public ThreadPoolTaskExecutor moderationExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);
        executor.setMaxPoolSize(1);
        executor.setQueueCapacity(1);
        executor.setThreadNamePrefix("moderation-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.setRejectedExecutionHandler((r, e) ->
            log.warn("Moderation batch rejected, previous batch still running"));
        executor.initialize();
        return executor;
    }

    @Bean(name = "emailExecutor")
    public ThreadPoolTaskExecutor emailExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("email-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        
        log.info("Email executor initialized - Core: 5, Max: 20, Queue: 500 with CallerRunsPolicy");
        return executor;
    }

    @Bean(name = "viewTrackingExecutor")
    public ThreadPoolTaskExecutor viewTrackingExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("view-tracking-");
        executor.setWaitForTasksToCompleteOnShutdown(false);
        executor.setAwaitTerminationSeconds(10);
        executor.setRejectedExecutionHandler((r, e) -> 
            log.debug("View tracking task rejected. Queue full."));
        executor.initialize();
        
        log.info("View tracking executor initialized - Core: 2, Max: 4, Queue: 500");
        return executor;
    }

    @Override
    public Executor getAsyncExecutor() {
        return taskExecutor();
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new CustomAsyncExceptionHandler();
    }

    private static class CustomAsyncExceptionHandler implements AsyncUncaughtExceptionHandler {
        @Override
        public void handleUncaughtException(Throwable ex, Method method, Object... params) {
            log.error("Async method '{}' threw exception: {}", method.getName(), ex.getMessage(), ex);
        }
    }
}

