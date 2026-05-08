package com.serhat.secondhand.coupon.dto;

import com.serhat.secondhand.coupon.entity.CouponAudience;
import com.serhat.secondhand.coupon.entity.CouponDiscountKind;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponDto {
    private UUID id;
    private String code;
    private String title;
    private String description;
    private CouponAudience audience;
    private boolean forAllUsers;
    private Set<Long> eligibleUserIds;
    private boolean active;
    private LocalDateTime startsAt;
    private LocalDateTime endsAt;
    private CouponDiscountKind discountKind;
    private BigDecimal value;
    private BigDecimal minSubtotal;
    private BigDecimal maxDiscount;
    private Set<ListingType> eligibleTypes;
    private Integer usageLimitGlobal;
    private Integer usageLimitPerUser;
    /** Remaining uses site-wide before {@link #usageLimitGlobal} caps (null when unlimited). */
    private Integer usageRemainingGlobal;
}


