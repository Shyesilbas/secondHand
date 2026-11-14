package com.serhat.secondhand.complaint.queue;

import com.serhat.secondhand.complaint.ComplaintStatus;

import com.serhat.secondhand.complaint.config.ComplaintModerationProperties;
import com.serhat.secondhand.complaint.queue.ComplaintRateLimiter;
import com.serhat.secondhand.complaint.util.ComplaintErrorCodes;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class ComplaintRateLimiterTest {

    private final StringRedisTemplate redis = mock(StringRedisTemplate.class);
    private final ComplaintRateLimiter limiter = new ComplaintRateLimiter(redis, new ComplaintModerationProperties());

    @SuppressWarnings("unchecked")
    private void counterReturns(Object value) {
        when(redis.execute(any(RedisScript.class), eq(List.of("v4:rate_limit:complaint:user:7")), eq("86400000")))
                .thenReturn(value);
    }

    @Test
    void fifthComplaintOfTheDayIsAllowed() {
        counterReturns(5L);
        assertThat(limiter.consume(7L).isSuccess()).isTrue();
    }

    @Test
    void sixthComplaintOfTheDayIsRejected() {
        counterReturns(6L);
        assertThat(limiter.consume(7L).getErrorCode())
                .isEqualTo(ComplaintErrorCodes.COMPLAINT_DAILY_LIMIT_REACHED.getCode());
    }

    @Test
    @SuppressWarnings("unchecked")
    void redisOutageRejectsInsteadOfLettingComplaintsThrough() {
        when(redis.execute(any(RedisScript.class), any(List.class), any(Object[].class)))
                .thenThrow(new RedisConnectionFailureException("down"));
        assertThat(limiter.consume(7L).getErrorCode())
                .isEqualTo(ComplaintErrorCodes.COMPLAINT_RATE_LIMIT_UNAVAILABLE.getCode());
    }
}
