package com.serhat.secondhand.coupon;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.coupon.entity.Coupon;
import com.serhat.secondhand.coupon.entity.CouponAudience;
import com.serhat.secondhand.coupon.entity.CouponDiscountKind;
import com.serhat.secondhand.coupon.repository.CouponRedemptionRepository;
import com.serhat.secondhand.coupon.util.CouponErrorCodes;
import com.serhat.secondhand.coupon.validator.CouponValidator;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CouponValidatorTest {

    @Mock
    private CouponRedemptionRepository couponRedemptionRepository;

    @Mock
    private OrderRepository orderRepository;

    private CouponValidator validator;
    private User buyer;

    @BeforeEach
    void setUp() {
        validator = new CouponValidator(couponRedemptionRepository, orderRepository);
        buyer = User.builder().id(11L).build();
    }

    @Test
    void validateForCreateOrUpdate_rejectsNonDiscountableTypesAndBadDateRange() {
        Coupon vehicleCoupon = baseCoupon()
                .eligibleTypes(Set.of(ListingType.VEHICLE))
                .build();
        assertThat(validator.validateForCreateOrUpdate(vehicleCoupon).getErrorCode())
                .isEqualTo(CouponErrorCodes.COUPON_NOT_APPLICABLE.getCode());

        Coupon invertedDates = baseCoupon()
                .startsAt(LocalDateTime.now().plusDays(5))
                .endsAt(LocalDateTime.now().plusDays(1))
                .build();
        assertThat(validator.validateForCreateOrUpdate(invertedDates).getErrorCode())
                .isEqualTo(CouponErrorCodes.COUPON_NOT_APPLICABLE.getCode());
    }

    @Test
    void validateForCreateOrUpdate_enforcesStrictFirstOrderCouponRules() {
        Coupon validFirstOrder = Coupon.builder()
                .code("WELCOME300")
                .audience(CouponAudience.NEVER_ORDERED_FIRST_ORDER)
                .forAllUsers(false)
                .discountKind(CouponDiscountKind.ORDER_FIXED)
                .value(new BigDecimal("300"))
                .usageLimitPerUser(1)
                .build();
        assertThat(validator.validateForCreateOrUpdate(validFirstOrder).isSuccess()).isTrue();

        Coupon wrongAmount = Coupon.builder()
                .code("WELCOME200")
                .audience(CouponAudience.NEVER_ORDERED_FIRST_ORDER)
                .forAllUsers(false)
                .discountKind(CouponDiscountKind.ORDER_FIXED)
                .value(new BigDecimal("200"))
                .usageLimitPerUser(1)
                .build();
        assertThat(validator.validateForCreateOrUpdate(wrongAmount).getErrorCode())
                .isEqualTo(CouponErrorCodes.COUPON_NOT_APPLICABLE.getCode());

        Coupon withGlobalLimit = Coupon.builder()
                .code("WELCOME300")
                .audience(CouponAudience.NEVER_ORDERED_FIRST_ORDER)
                .forAllUsers(false)
                .discountKind(CouponDiscountKind.ORDER_FIXED)
                .value(new BigDecimal("300"))
                .usageLimitPerUser(1)
                .usageLimitGlobal(50)
                .build();
        assertThat(validator.validateForCreateOrUpdate(withGlobalLimit).getErrorCode())
                .isEqualTo(CouponErrorCodes.COUPON_NOT_APPLICABLE.getCode());
    }

    @Test
    void validateUserEligible_checksTargetedListAndFirstOrderHistory() {
        Coupon listCoupon = baseCoupon()
                .audience(CouponAudience.USER_ID_LIST)
                .forAllUsers(false)
                .eligibleUserIds(Set.of(99L))
                .build();
        assertThat(validator.validateUserEligible(listCoupon, buyer).isError()).isTrue();

        listCoupon.setEligibleUserIds(Set.of(11L));
        assertThat(validator.validateUserEligible(listCoupon, buyer).isSuccess()).isTrue();

        Coupon firstOrder = baseCoupon()
                .audience(CouponAudience.NEVER_ORDERED_FIRST_ORDER)
                .forAllUsers(false)
                .build();
        when(orderRepository.countByUser_IdAndPaymentStatus(11L, PaymentStatus.COMPLETED)).thenReturn(0L);
        assertThat(validator.validateUserEligible(firstOrder, buyer).isSuccess()).isTrue();

        when(orderRepository.countByUser_IdAndPaymentStatus(11L, PaymentStatus.COMPLETED)).thenReturn(2L);
        assertThat(validator.validateUserEligible(firstOrder, buyer).getErrorCode())
                .isEqualTo(CouponErrorCodes.COUPON_NOT_APPLICABLE.getCode());
    }

    @Test
    void validateUsable_enforcesActiveDatesAndRedemptionLimits() {
        Coupon inactive = baseCoupon().active(false).build();
        assertThat(validator.validateUsable(inactive, buyer).getErrorCode())
                .isEqualTo(CouponErrorCodes.COUPON_INACTIVE.getCode());

        Coupon expired = baseCoupon().endsAt(LocalDateTime.now().minusMinutes(1)).build();
        assertThat(validator.validateUsable(expired, buyer).getErrorCode())
                .isEqualTo(CouponErrorCodes.COUPON_EXPIRED.getCode());

        Coupon capped = baseCoupon().usageLimitGlobal(5).usageLimitPerUser(1).build();
        when(couponRedemptionRepository.countByCoupon(capped)).thenReturn(5L);
        assertThat(validator.validateUsable(capped, buyer).getErrorCode())
                .isEqualTo(CouponErrorCodes.COUPON_USAGE_LIMIT_REACHED.getCode());

        when(couponRedemptionRepository.countByCoupon(capped)).thenReturn(2L);
        when(couponRedemptionRepository.countByCouponAndUser(capped, buyer)).thenReturn(1L);
        assertThat(validator.validateUsable(capped, buyer).getErrorCode())
                .isEqualTo(CouponErrorCodes.COUPON_USAGE_LIMIT_REACHED.getCode());
    }

    @Test
    void validateCouponForCart_checksEligibleTypesAndMinSubtotal() {
        Coupon coupon = baseCoupon()
                .eligibleTypes(Set.of(ListingType.BOOKS))
                .minSubtotal(new BigDecimal("150.00"))
                .build();

        Result<Void> wrongType = validator.validateCouponForCart(
                coupon, buyer, Set.of(ListingType.SPORTS), new BigDecimal("200.00"));
        assertThat(wrongType.getErrorCode()).isEqualTo(CouponErrorCodes.COUPON_NOT_APPLICABLE.getCode());

        Result<Void> belowMin = validator.validateCouponForCart(
                coupon, buyer, Set.of(ListingType.BOOKS), new BigDecimal("120.00"));
        assertThat(belowMin.getErrorCode()).isEqualTo(CouponErrorCodes.COUPON_NOT_APPLICABLE.getCode());

        Result<Void> ok = validator.validateCouponForCart(
                coupon, buyer, Set.of(ListingType.BOOKS), new BigDecimal("150.00"));
        assertThat(ok.isSuccess()).isTrue();
    }

    private Coupon.CouponBuilder baseCoupon() {
        return Coupon.builder()
                .code("SAVE10")
                .active(true)
                .audience(CouponAudience.ALL_USERS)
                .forAllUsers(true)
                .discountKind(CouponDiscountKind.ORDER_PERCENT)
                .value(new BigDecimal("10"));
    }
}
