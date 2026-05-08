package com.serhat.secondhand.coupon.validator;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.coupon.entity.Coupon;
import com.serhat.secondhand.coupon.entity.CouponAudience;
import com.serhat.secondhand.coupon.entity.CouponDiscountKind;
import com.serhat.secondhand.coupon.repository.CouponRedemptionRepository;
import com.serhat.secondhand.coupon.util.CouponErrorCodes;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.payment.entity.PaymentStatus;
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

    private static final BigDecimal FIRST_ORDER_FIXED_TL = new BigDecimal("300");

    private final CouponRedemptionRepository couponRedemptionRepository;
    private final OrderRepository orderRepository;

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

        CouponAudience audience = effectiveAudience(coupon);

        if (audience == CouponAudience.NEVER_ORDERED_FIRST_ORDER) {
            Set<Long> ids = coupon.getEligibleUserIds();
            if (ids != null && !ids.isEmpty()) {
                return Result.error(CouponErrorCodes.COUPON_NOT_APPLICABLE);
            }
            if (coupon.getDiscountKind() != CouponDiscountKind.ORDER_FIXED
                    || coupon.getValue().compareTo(FIRST_ORDER_FIXED_TL) != 0) {
                return Result.error(CouponErrorCodes.COUPON_NOT_APPLICABLE);
            }
            if (coupon.getUsageLimitPerUser() == null || coupon.getUsageLimitPerUser() != 1) {
                return Result.error(CouponErrorCodes.COUPON_NOT_APPLICABLE);
            }
            if (coupon.getUsageLimitGlobal() != null) {
                return Result.error(CouponErrorCodes.COUPON_NOT_APPLICABLE);
            }
            if (coupon.getStartsAt() != null || coupon.getEndsAt() != null) {
                return Result.error(CouponErrorCodes.COUPON_NOT_APPLICABLE);
            }
            if (coupon.getMinSubtotal() != null || coupon.getMaxDiscount() != null) {
                return Result.error(CouponErrorCodes.COUPON_NOT_APPLICABLE);
            }
        } else if (audience == CouponAudience.USER_ID_LIST) {
            if (coupon.getEligibleUserIds() == null || coupon.getEligibleUserIds().isEmpty()) {
                return Result.error(CouponErrorCodes.COUPON_NOT_APPLICABLE);
            }
        }

        return Result.success();
    }

    private CouponAudience effectiveAudience(Coupon coupon) {
        if (coupon.getAudience() != null) {
            return coupon.getAudience();
        }
        return coupon.isForAllUsers() ? CouponAudience.ALL_USERS : CouponAudience.USER_ID_LIST;
    }

    public Result<Void> validateUserEligible(Coupon coupon, User user) {
        if (coupon == null || user == null || user.getId() == null) {
            return Result.error(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }
        CouponAudience audience = coupon.getAudience() != null
                ? coupon.getAudience()
                : (coupon.isForAllUsers() ? CouponAudience.ALL_USERS : CouponAudience.USER_ID_LIST);

        return switch (audience) {
            case ALL_USERS -> Result.success();
            case USER_ID_LIST -> userInEligibleList(coupon, user.getId());
            case NEVER_ORDERED_FIRST_ORDER -> neverCompletedPaidOrder(user.getId())
                    ? Result.success()
                    : Result.error(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        };
    }

    private Result<Void> userInEligibleList(Coupon coupon, Long userId) {
        Set<Long> ids = coupon.getEligibleUserIds();
        if (ids == null || !ids.contains(userId)) {
            return Result.error(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }
        return Result.success();
    }

    private boolean neverCompletedPaidOrder(Long userId) {
        return orderRepository.countByUser_IdAndPaymentStatus(userId, PaymentStatus.COMPLETED) == 0;
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

        Result<Void> eligible = validateUserEligible(coupon, user);
        if (eligible.isError()) {
            return eligible;
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
