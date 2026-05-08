package com.serhat.secondhand.coupon.dto;

import com.serhat.secondhand.coupon.entity.CouponAudience;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponAudienceStatsDto {
    private CouponAudience audience;
    /** Users matching audience rules now (no snapshot). */
    private long eligibleUserCount;
}
