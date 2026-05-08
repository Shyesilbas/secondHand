package com.serhat.secondhand.coupon.mapper;

import com.serhat.secondhand.coupon.dto.ActiveCouponDto;
import com.serhat.secondhand.coupon.dto.CouponDto;
import com.serhat.secondhand.coupon.dto.CreateCouponRequest;
import com.serhat.secondhand.coupon.dto.UpdateCouponRequest;
import com.serhat.secondhand.coupon.entity.Coupon;
import com.serhat.secondhand.coupon.entity.CouponAudience;
import com.serhat.secondhand.coupon.repository.CouponRedemptionRepository;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class CouponMapper {

    private final CouponRedemptionRepository couponRedemptionRepository;

    public Coupon fromCreateRequest(CreateCouponRequest request) {
        boolean forAllLegacy = request.getForAllUsers() == null || Boolean.TRUE.equals(request.getForAllUsers());
        CouponAudience audience = resolveAudience(request.getAudience(), forAllLegacy);
        boolean forAllUsersFlag = audience == CouponAudience.ALL_USERS;

        LinkedHashSet<Long> eligible = buildEligibleIdsForAudience(audience, request.getEligibleUserIds());

        return Coupon.builder()
                .code(request.getCode())
                .title(request.getTitle())
                .description(request.getDescription())
                .audience(audience)
                .forAllUsers(forAllUsersFlag)
                .eligibleUserIds(eligible)
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

    private LinkedHashSet<Long> buildEligibleIdsForAudience(CouponAudience audience, Set<Long> requestIds) {
        if (audience != CouponAudience.USER_ID_LIST) {
            return new LinkedHashSet<>();
        }
        if (requestIds == null || requestIds.isEmpty()) {
            return new LinkedHashSet<>();
        }
        return new LinkedHashSet<>(requestIds);
    }

    private CouponAudience resolveAudience(CouponAudience explicit, boolean forAllLegacy) {
        if (explicit != null) {
            return explicit;
        }
        return forAllLegacy ? CouponAudience.ALL_USERS : CouponAudience.USER_ID_LIST;
    }

    /** Mutates coupon.audience when request carries audience or legacy forAllUsers. */
    private void syncLegacyFlagsFromAudience(Coupon coupon, UpdateCouponRequest request) {
        if (request.getAudience() != null) {
            coupon.setAudience(request.getAudience());
        } else if (request.getForAllUsers() != null) {
            coupon.setAudience(Boolean.TRUE.equals(request.getForAllUsers())
                    ? CouponAudience.ALL_USERS
                    : CouponAudience.USER_ID_LIST);
        }
    }

    public void applyUpdate(Coupon coupon, UpdateCouponRequest request) {
        syncLegacyFlagsFromAudience(coupon, request);
        if (request.getTitle() != null) {
            coupon.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            coupon.setDescription(request.getDescription());
        }
        if (request.getForAllUsers() != null) {
            coupon.setForAllUsers(request.getForAllUsers());
        }
        if (request.getEligibleUserIds() != null) {
            coupon.setEligibleUserIds(new LinkedHashSet<>(request.getEligibleUserIds()));
        }
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

    private Integer computeUsageRemainingGlobal(Coupon coupon) {
        if (coupon.getUsageLimitGlobal() == null) {
            return null;
        }
        long used = couponRedemptionRepository.countByCoupon(coupon);
        return Math.max(0, coupon.getUsageLimitGlobal() - (int) used);
    }

    public CouponDto toDto(Coupon coupon) {
        return CouponDto.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .title(coupon.getTitle())
                .description(coupon.getDescription())
                .audience(coupon.getAudience() != null ? coupon.getAudience() : CouponAudience.ALL_USERS)
                .forAllUsers(coupon.isForAllUsers())
                .eligibleUserIds(coupon.getEligibleUserIds() == null ? Collections.emptySet() : new LinkedHashSet<>(coupon.getEligibleUserIds()))
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
                .usageRemainingGlobal(computeUsageRemainingGlobal(coupon))
                .build();
    }

    public ActiveCouponDto toActiveDto(Coupon coupon, User user) {
        Integer usageRemainingGlobal = computeUsageRemainingGlobal(coupon);

        Integer usageRemainingPerUser = null;
        if (coupon.getUsageLimitPerUser() != null) {
            long used = couponRedemptionRepository.countByCouponAndUser(coupon, user);
            usageRemainingPerUser = Math.max(0, coupon.getUsageLimitPerUser() - (int) used);
        }

        return ActiveCouponDto.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .title(coupon.getTitle())
                .description(coupon.getDescription())
                .audience(coupon.getAudience() != null ? coupon.getAudience() : CouponAudience.ALL_USERS)
                .forAllUsers(coupon.isForAllUsers())
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
