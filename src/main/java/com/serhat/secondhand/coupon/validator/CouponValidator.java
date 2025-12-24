package com.serhat.secondhand.coupon.validator;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.coupon.entity.Coupon;
import com.serhat.secondhand.coupon.repository.CouponRedemptionRepository;
import com.serhat.secondhand.coupon.util.CouponErrorCodes;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class CouponValidator {
    private final CouponRedemptionRepository couponRedemptionRepository;

    public void validateForCreateOrUpdate(Coupon coupon) {
        if (coupon.getCode() == null || coupon.getCode().isBlank()) {
            throw new BusinessException(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }
        if (coupon.getDiscountKind() == null || coupon.getValue() == null) {
            throw new BusinessException(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }
        if (coupon.getStartsAt() != null && coupon.getEndsAt() != null
                && coupon.getStartsAt().isAfter(coupon.getEndsAt())) {
            throw new BusinessException(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }
        if (coupon.getEligibleTypes() != null
                && (coupon.getEligibleTypes().contains(ListingType.REAL_ESTATE)
                || coupon.getEligibleTypes().contains(ListingType.VEHICLE))) {
            throw new BusinessException(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }
    }

    public void validateUsable(Coupon coupon, User user) {
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

        if (coupon.getUsageLimitGlobal() != null) {
            if (couponRedemptionRepository.countByCoupon(coupon) >= coupon.getUsageLimitGlobal()) {
                throw new BusinessException(CouponErrorCodes.COUPON_USAGE_LIMIT_REACHED);
            }
        }

        if (coupon.getUsageLimitPerUser() != null) {
            if (couponRedemptionRepository.countByCouponAndUser(coupon, user)
                    >= coupon.getUsageLimitPerUser()) {
                throw new BusinessException(CouponErrorCodes.COUPON_USAGE_LIMIT_REACHED);
            }
        }
    }
}
