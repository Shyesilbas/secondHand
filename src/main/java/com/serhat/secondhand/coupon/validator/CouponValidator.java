package com.serhat.secondhand.coupon.validator;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.coupon.entity.Coupon;
import com.serhat.secondhand.coupon.repository.CouponRedemptionRepository;
import com.serhat.secondhand.coupon.util.CouponErrorCodes;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class CouponValidator {
    private final CouponRedemptionRepository couponRedemptionRepository;

    public Result<Void> validateForCreateOrUpdate(Coupon coupon) {
        if (coupon.getCode() == null || coupon.getCode().isBlank()) {
            return Result.error(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }
        if (coupon.getDiscountKind() == null || coupon.getValue() == null) {
            return Result.error(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }
        if (coupon.getStartsAt() != null && coupon.getEndsAt() != null
                && coupon.getStartsAt().isAfter(coupon.getEndsAt())) {
            return Result.error(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }
        if (coupon.getEligibleTypes() != null
                && (coupon.getEligibleTypes().contains(ListingType.REAL_ESTATE)
                || coupon.getEligibleTypes().contains(ListingType.VEHICLE))) {
            return Result.error(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }
        return Result.success();
    }

    public Result<Void> validateUsable(Coupon coupon, User user) {
        if (!coupon.isActive()) {
            return Result.error(CouponErrorCodes.COUPON_INACTIVE);
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartsAt() != null && now.isBefore(coupon.getStartsAt())) {
            return Result.error(CouponErrorCodes.COUPON_EXPIRED);
        }
        if (coupon.getEndsAt() != null && now.isAfter(coupon.getEndsAt())) {
            return Result.error(CouponErrorCodes.COUPON_EXPIRED);
        }

        if (coupon.getUsageLimitGlobal() != null) {
            if (couponRedemptionRepository.countByCoupon(coupon) >= coupon.getUsageLimitGlobal()) {
                return Result.error(CouponErrorCodes.COUPON_USAGE_LIMIT_REACHED);
            }
        }

        if (coupon.getUsageLimitPerUser() != null) {
            if (couponRedemptionRepository.countByCouponAndUser(coupon, user)
                    >= coupon.getUsageLimitPerUser()) {
                return Result.error(CouponErrorCodes.COUPON_USAGE_LIMIT_REACHED);
            }
        }
        return Result.success();
    }

    /**
     * Validates coupon applicability for cart context.
     * This method is used by PricingService to validate coupons without depending on CouponService.
     */
    public Result<Void> validateCouponForCart(Coupon coupon, User buyer, Set<ListingType> cartTypes, BigDecimal eligibleSubtotal) {
        if (coupon == null) {
            return Result.error(CouponErrorCodes.COUPON_NOT_FOUND);
        }

        Result<Void> usableResult = validateUsable(coupon, buyer);
        if (usableResult.isError()) {
            return usableResult;
        }

        Set<ListingType> effectiveEligibleTypes = (coupon.getEligibleTypes() == null || coupon.getEligibleTypes().isEmpty())
                ? defaultEligibleTypes() : coupon.getEligibleTypes();

        if (cartTypes == null || cartTypes.stream().noneMatch(effectiveEligibleTypes::contains)) {
            return Result.error(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }

        if (coupon.getMinSubtotal() != null && eligibleSubtotal != null && eligibleSubtotal.compareTo(coupon.getMinSubtotal()) < 0) {
            return Result.error(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }

        return Result.success();
    }

    private Set<ListingType> defaultEligibleTypes() {
        EnumSet<ListingType> all = EnumSet.allOf(ListingType.class);
        all.remove(ListingType.REAL_ESTATE);
        all.remove(ListingType.VEHICLE);
        return all;
    }
}
