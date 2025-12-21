package com.serhat.secondhand.coupon.dto;

import com.serhat.secondhand.coupon.entity.CouponDiscountKind;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
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


