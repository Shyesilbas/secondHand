package com.serhat.secondhand.coupon.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.coupon.dto.CouponDto;
import com.serhat.secondhand.coupon.dto.CreateCouponRequest;
import com.serhat.secondhand.coupon.dto.ActiveCouponDto;
import com.serhat.secondhand.coupon.dto.UpdateCouponRequest;
import com.serhat.secondhand.coupon.entity.Coupon;
import com.serhat.secondhand.coupon.entity.CouponRedemption;
import com.serhat.secondhand.coupon.repository.CouponRedemptionRepository;
import com.serhat.secondhand.coupon.repository.CouponRepository;
import com.serhat.secondhand.coupon.util.CouponErrorCodes;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponRedemptionRepository couponRedemptionRepository;

    public CouponDto create(CreateCouponRequest request) {
        Coupon coupon = Coupon.builder()
                .code(normalizeCode(request.getCode()))
                .active(request.isActive())
                .startsAt(request.getStartsAt())
                .endsAt(request.getEndsAt())
                .discountKind(request.getDiscountKind())
                .value(request.getValue())
                .minSubtotal(request.getMinSubtotal())
                .maxDiscount(request.getMaxDiscount())
                .eligibleTypes(normalizeEligibleTypes(request.getEligibleTypes()))
                .usageLimitGlobal(request.getUsageLimitGlobal())
                .usageLimitPerUser(request.getUsageLimitPerUser())
                .build();

        validateCoupon(coupon);
        coupon = couponRepository.save(coupon);
        return toDto(coupon);
    }

    public CouponDto update(UUID id, UpdateCouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new BusinessException(CouponErrorCodes.COUPON_NOT_FOUND));

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
            coupon.setEligibleTypes(normalizeEligibleTypes(request.getEligibleTypes()));
        }
        if (request.getUsageLimitGlobal() != null) {
            coupon.setUsageLimitGlobal(request.getUsageLimitGlobal());
        }
        if (request.getUsageLimitPerUser() != null) {
            coupon.setUsageLimitPerUser(request.getUsageLimitPerUser());
        }

        validateCoupon(coupon);
        coupon = couponRepository.save(coupon);
        return toDto(coupon);
    }

    public void redeem(String code, User user, Order order) {
        if (code == null || code.isBlank() || user == null) {
            return;
        }
        Coupon coupon = couponRepository.findByCodeIgnoreCase(normalizeCode(code))
                .orElseThrow(() -> new BusinessException(CouponErrorCodes.COUPON_NOT_FOUND));
        CouponRedemption redemption = CouponRedemption.builder()
                .coupon(coupon)
                .user(user)
                .order(order)
                .build();
        couponRedemptionRepository.save(redemption);
    }

    @Transactional(readOnly = true)
    public List<CouponDto> listAll() {
        return couponRepository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<ActiveCouponDto> listActiveForUser(User user) {
        return couponRepository.findActiveNow(LocalDateTime.now()).stream()
                .map(c -> toActiveDto(c, user))
                .toList();
    }

    @Transactional(readOnly = true)
    public Coupon getValidCouponOrThrow(String code, User user, Set<ListingType> cartTypes, java.math.BigDecimal eligibleSubtotal) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(normalizeCode(code))
                .orElseThrow(() -> new BusinessException(CouponErrorCodes.COUPON_NOT_FOUND));

        validateCouponIsUsable(coupon);
        validateUsageLimits(coupon, user);

        Set<ListingType> effectiveEligibleTypes = coupon.getEligibleTypes() == null || coupon.getEligibleTypes().isEmpty()
                ? defaultEligibleTypes()
                : coupon.getEligibleTypes();

        boolean intersects = cartTypes != null && cartTypes.stream().anyMatch(effectiveEligibleTypes::contains);
        if (!intersects) {
            throw new BusinessException(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }

        if (coupon.getMinSubtotal() != null && eligibleSubtotal != null && eligibleSubtotal.compareTo(coupon.getMinSubtotal()) < 0) {
            throw new BusinessException(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }

        return coupon;
    }

    private void validateCouponIsUsable(Coupon coupon) {
        if (!coupon.isActive()) {
            throw new BusinessException(CouponErrorCodes.COUPON_INACTIVE);
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartsAt() != null && now.isBefore(coupon.getStartsAt())) {
            throw new BusinessException(CouponErrorCodes.COUPON_EXPIRED);
        }
        if (coupon.getEndsAt() != null && now.isAfter(coupon.getEndsAt())) {
            throw new BusinessException(CouponErrorCodes.COUPON_EXPIRED);
        }
    }

    private void validateUsageLimits(Coupon coupon, User user) {
        if (coupon.getUsageLimitGlobal() != null) {
            long globalCount = couponRedemptionRepository.countByCoupon(coupon);
            if (globalCount >= coupon.getUsageLimitGlobal()) {
                throw new BusinessException(CouponErrorCodes.COUPON_USAGE_LIMIT_REACHED);
            }
        }

        if (coupon.getUsageLimitPerUser() != null) {
            long userCount = couponRedemptionRepository.countByCouponAndUser(coupon, user);
            if (userCount >= coupon.getUsageLimitPerUser()) {
                throw new BusinessException(CouponErrorCodes.COUPON_USAGE_LIMIT_REACHED);
            }
        }
    }

    private void validateCoupon(Coupon coupon) {
        if (coupon.getCode() == null || coupon.getCode().isBlank()) {
            throw new BusinessException(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }
        if (coupon.getDiscountKind() == null || coupon.getValue() == null) {
            throw new BusinessException(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }
        if (coupon.getStartsAt() != null && coupon.getEndsAt() != null && coupon.getStartsAt().isAfter(coupon.getEndsAt())) {
            throw new BusinessException(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }
        if (coupon.getEligibleTypes() != null && (coupon.getEligibleTypes().contains(ListingType.REAL_ESTATE) || coupon.getEligibleTypes().contains(ListingType.VEHICLE))) {
            throw new BusinessException(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }
    }

    private CouponDto toDto(Coupon coupon) {
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

    private ActiveCouponDto toActiveDto(Coupon coupon, User user) {
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

    private String normalizeCode(String code) {
        return code == null ? null : code.trim().toUpperCase();
    }

    private Set<ListingType> normalizeEligibleTypes(Set<ListingType> types) {
        if (types == null || types.isEmpty()) {
            return defaultEligibleTypes();
        }
        if (types.contains(ListingType.REAL_ESTATE) || types.contains(ListingType.VEHICLE)) {
            throw new BusinessException(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }
        return types;
    }

    private Set<ListingType> defaultEligibleTypes() {
        EnumSet<ListingType> all = EnumSet.allOf(ListingType.class);
        all.remove(ListingType.REAL_ESTATE);
        all.remove(ListingType.VEHICLE);
        return all;
    }
}

