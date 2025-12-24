package com.serhat.secondhand.coupon.mapper;

import com.serhat.secondhand.coupon.dto.ActiveCouponDto;
import com.serhat.secondhand.coupon.dto.CouponDto;
import com.serhat.secondhand.coupon.dto.CreateCouponRequest;
import com.serhat.secondhand.coupon.dto.UpdateCouponRequest;
import com.serhat.secondhand.coupon.entity.Coupon;
import com.serhat.secondhand.coupon.repository.CouponRedemptionRepository;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CouponMapper {

    private final CouponRedemptionRepository couponRedemptionRepository;

    public Coupon fromCreateRequest(CreateCouponRequest request) {
        return Coupon.builder()
                .code(request.getCode())
                .active(request.isActive())
                .startsAt(request.getStartsAt())
                .endsAt(request.getEndsAt())
                .discountKind(request.getDiscountKind())
                .value(request.getValue())
                .minSubtotal(request.getMinSubtotal())
                .maxDiscount(request.getMaxDiscount())
                .eligibleTypes(request.getEligibleTypes())
                .usageLimitGlobal(request.getUsageLimitGlobal())
                .usageLimitPerUser(request.getUsageLimitPerUser())
                .build();
    }

    public void applyUpdate(Coupon coupon, UpdateCouponRequest request) {
        if (request.getActive() != null) {
            coupon.setActive(request.getActive());
        }
        if (request.getStartsAt() != null) {
            coupon.setStartsAt(request.getStartsAt());
        }
        if (request.getEndsAt() != null) {
            coupon.setEndsAt(request.getEndsAt());
        }
        if (request.getDiscountKind() != null) {
            coupon.setDiscountKind(request.getDiscountKind());
        }
        if (request.getValue() != null) {
            coupon.setValue(request.getValue());
        }
        if (request.getMinSubtotal() != null) {
            coupon.setMinSubtotal(request.getMinSubtotal());
        }
        if (request.getMaxDiscount() != null) {
            coupon.setMaxDiscount(request.getMaxDiscount());
        }
        if (request.getEligibleTypes() != null) {
            coupon.setEligibleTypes(request.getEligibleTypes());
        }
        if (request.getUsageLimitGlobal() != null) {
            coupon.setUsageLimitGlobal(request.getUsageLimitGlobal());
        }
        if (request.getUsageLimitPerUser() != null) {
            coupon.setUsageLimitPerUser(request.getUsageLimitPerUser());
        }
    }

    public CouponDto toDto(Coupon coupon) {
        return CouponDto.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .active(coupon.isActive())
                .startsAt(coupon.getStartsAt())
                .endsAt(coupon.getEndsAt())
                .discountKind(coupon.getDiscountKind())
                .value(coupon.getValue())
                .minSubtotal(coupon.getMinSubtotal())
                .maxDiscount(coupon.getMaxDiscount())
                .eligibleTypes(coupon.getEligibleTypes())
                .usageLimitGlobal(coupon.getUsageLimitGlobal())
                .usageLimitPerUser(coupon.getUsageLimitPerUser())
                .build();
    }

    public ActiveCouponDto toActiveDto(Coupon coupon, User user) {
        Integer usageRemainingGlobal = null;
        if (coupon.getUsageLimitGlobal() != null) {
            long used = couponRedemptionRepository.countByCoupon(coupon);
            usageRemainingGlobal = Math.max(0, coupon.getUsageLimitGlobal() - (int) used);
        }

        Integer usageRemainingPerUser = null;
        if (coupon.getUsageLimitPerUser() != null) {
            long used = couponRedemptionRepository.countByCouponAndUser(coupon, user);
            usageRemainingPerUser = Math.max(0, coupon.getUsageLimitPerUser() - (int) used);
        }

        return ActiveCouponDto.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .active(coupon.isActive())
                .startsAt(coupon.getStartsAt())
                .endsAt(coupon.getEndsAt())
                .discountKind(coupon.getDiscountKind())
                .value(coupon.getValue())
                .minSubtotal(coupon.getMinSubtotal())
                .maxDiscount(coupon.getMaxDiscount())
                .eligibleTypes(coupon.getEligibleTypes())
                .usageLimitGlobal(coupon.getUsageLimitGlobal())
                .usageLimitPerUser(coupon.getUsageLimitPerUser())
                .usageRemainingGlobal(usageRemainingGlobal)
                .usageRemainingPerUser(usageRemainingPerUser)
                .build();
    }
}
