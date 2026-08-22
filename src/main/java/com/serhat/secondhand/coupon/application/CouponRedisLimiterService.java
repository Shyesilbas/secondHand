package com.serhat.secondhand.coupon.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.scripting.support.ResourceScriptSource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponRedisLimiterService {

    private final StringRedisTemplate redisTemplate;
    private DefaultRedisScript<Long> applyCouponScript;

    @PostConstruct
    public void init() {
        applyCouponScript = new DefaultRedisScript<>();
        applyCouponScript.setScriptSource(new ResourceScriptSource(new ClassPathResource("scripts/apply_coupon_with_limit.lua")));
        applyCouponScript.setResultType(Long.class);
    }

    public int acquireCouponUsage(String couponCode, Long userId, Integer globalLimit, Integer userLimit, long ttlSeconds) {
        String globalKey = "coupon:usage:global:" + couponCode.toUpperCase();
        String userKey = "coupon:usage:user:" + couponCode.toUpperCase() + ":" + userId;

        int gLimit = (globalLimit != null && globalLimit > 0) ? globalLimit : -1;
        int uLimit = (userLimit != null && userLimit > 0) ? userLimit : -1;

        try {
            Long result = redisTemplate.execute(
                    applyCouponScript,
                    List.of(globalKey, userKey),
                    String.valueOf(gLimit),
                    String.valueOf(uLimit),
                    String.valueOf(ttlSeconds)
            );

            if (result == null) return -1;
            return result.intValue();
        } catch (Exception e) {
            log.error("Redis coupon limit evaluation failed for coupon: {}, fallback to DB validation", couponCode, e);
            return 1; // Fallback to DB validation on Redis outage
        }
    }
}
