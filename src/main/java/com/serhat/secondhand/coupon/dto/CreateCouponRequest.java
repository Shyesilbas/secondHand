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

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCouponRequest {
    private String code;
    /** Shown on coupon lists */
    private String title;
    private String description;
    /** Overrides legacy {@link #forAllUsers} when set. */
    private CouponAudience audience;
    /** null / true = all users; false = {@link #eligibleUserIds} only */
    private Boolean forAllUsers;
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
}


