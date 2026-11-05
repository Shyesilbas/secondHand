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

    /** Redis was unavailable, so nothing was counted and nothing must be released. */
    public static final int NOT_COUNTED = 0;

    private final StringRedisTemplate redisTemplate;
    private DefaultRedisScript<Long> applyCouponScript;
    private DefaultRedisScript<Long> releaseCouponScript;

    @PostConstruct
    public void init() {
        applyCouponScript = new DefaultRedisScript<>();
        applyCouponScript.setScriptSource(new ResourceScriptSource(new ClassPathResource("scripts/apply_coupon_with_limit.lua")));
        applyCouponScript.setResultType(Long.class);
        releaseCouponScript = new DefaultRedisScript<>();
        releaseCouponScript.setScriptSource(new ResourceScriptSource(new ClassPathResource("scripts/release_coupon_usage.lua")));
        releaseCouponScript.setResultType(Long.class);
    }

    /**
     * Returns a positive count when the usage was counted in Redis, -1/-2 when a limit is reached and
     * {@link #NOT_COUNTED} when Redis was unavailable (the database checks under the coupon row lock decide).
     */

    public int acquireCouponUsage(String couponCode, Long userId, Integer globalLimit, Integer userLimit, long ttlSeconds) {
        String globalKey = globalKey(couponCode);
        String userKey = userKey(couponCode, userId);

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
            return NOT_COUNTED;
        }
    }

    /** Undoes one {@link #acquireCouponUsage} that was counted but whose redemption did not commit. */
    public void releaseCouponUsage(String couponCode, Long userId) {
        try {
            redisTemplate.execute(releaseCouponScript, List.of(globalKey(couponCode), userKey(couponCode, userId)));
        } catch (Exception e) {
            // The counters are only a pre-check; the database limits still apply.
            log.error("Failed to release Redis coupon usage for coupon: {}, user: {}", couponCode, userId, e);
        }
    }

    private static String globalKey(String couponCode) {
        return "v4:coupon:usage:global:" + couponCode.toUpperCase();
    }

    private static String userKey(String couponCode, Long userId) {
        return "v4:coupon:usage:user:" + couponCode.toUpperCase() + ":" + userId;
    }
}
