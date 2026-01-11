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
        executor.setRejectedExecutionHandler((r, e) -> 
            log.warn("Task rejected from async executor. Queue full. Task: {}", r.toString()));
        executor.initialize();
        
        log.info("Async executor initialized - Core: {}, Max: {}, Queue: {}", 
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
        executor.setRejectedExecutionHandler((r, e) -> 
            log.warn("Notification task rejected. Queue full. Task: {}", r.toString()));
        executor.initialize();
        
        log.info("Notification executor initialized - Core: 2, Max: 5, Queue: 200");
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

