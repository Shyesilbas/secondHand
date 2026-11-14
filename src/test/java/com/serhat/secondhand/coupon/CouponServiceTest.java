package com.serhat.secondhand.coupon;

import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.coupon.application.CouponRedisLimiterService;
import com.serhat.secondhand.coupon.application.CouponService;
import com.serhat.secondhand.coupon.dto.ActiveCouponDto;
import com.serhat.secondhand.coupon.dto.CouponAudienceStatsDto;
import com.serhat.secondhand.coupon.dto.CouponDto;
import com.serhat.secondhand.coupon.dto.CreateCouponRequest;
import com.serhat.secondhand.coupon.entity.Coupon;
import com.serhat.secondhand.coupon.entity.CouponAudience;
import com.serhat.secondhand.coupon.entity.CouponDiscountKind;
import com.serhat.secondhand.coupon.entity.CouponRedemption;
import com.serhat.secondhand.coupon.mapper.CouponMapper;
import com.serhat.secondhand.coupon.repository.CouponRedemptionRepository;
import com.serhat.secondhand.coupon.repository.CouponRepository;
import com.serhat.secondhand.coupon.util.CouponErrorCodes;
import com.serhat.secondhand.coupon.validator.CouponValidator;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.offer.application.IOfferService;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.pricing.application.IPricingService;
import com.serhat.secondhand.pricing.util.DiscountEligibility;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock private CouponRepository couponRepository;
    @Mock private CouponRedemptionRepository couponRedemptionRepository;
    @Mock private CouponMapper couponMapper;
    @Mock private CouponValidator couponValidator;
    @Mock private CartRepository cartRepository;
    @Mock private IOfferService offerService;
    @Mock private IPricingService pricingService;
    @Mock private IUserService userService;
    @Mock private UserRepository userRepository;
    @Mock private CouponRedisLimiterService couponRedisLimiterService;

    private CouponService couponService;
    private User user;

    @BeforeEach
    void setUp() {
        couponService = new CouponService(
                couponRepository,
                couponRedemptionRepository,
                couponMapper,
                couponValidator,
                cartRepository,
                offerService,
                pricingService,
                userService,
                userRepository,
                couponRedisLimiterService
        );
        user = User.builder().id(7L).build();
    }

    @Test
    void create_normalizesCodeAndDefaultsEligibleTypes() {
        CreateCouponRequest request = CreateCouponRequest.builder()
                .code(" save20 ")
                .active(true)
                .discountKind(CouponDiscountKind.ORDER_PERCENT)
                .value(new BigDecimal("20"))
                .build();
        Coupon mapped = Coupon.builder()
                .code(" save20 ")
                .audience(CouponAudience.ALL_USERS)
                .active(true)
                .build();
        CouponDto expectedDto = CouponDto.builder().code("SAVE20").build();

        when(couponMapper.fromCreateRequest(request)).thenReturn(mapped);
        when(couponValidator.validateForCreateOrUpdate(mapped)).thenReturn(Result.success());
        when(couponRepository.save(mapped)).thenReturn(mapped);
        when(couponMapper.toDto(mapped)).thenReturn(expectedDto);

        Result<CouponDto> result = couponService.create(request);

        assertThat(result.isSuccess()).isTrue();
        assertThat(mapped.getCode()).isEqualTo("SAVE20");
        assertThat(mapped.getEligibleTypes()).isEqualTo(DiscountEligibility.discountableTypes());
        assertThat(result.getData()).isEqualTo(expectedDto);
    }

    @Test
    void create_rejectsNonDiscountableTypesBeforeSaving() {
        CreateCouponRequest request = CreateCouponRequest.builder().code("CAR10").build();
        Coupon mapped = Coupon.builder()
                .code("CAR10")
                .audience(CouponAudience.ALL_USERS)
                .eligibleTypes(Set.of(ListingType.VEHICLE))
                .build();
        when(couponMapper.fromCreateRequest(request)).thenReturn(mapped);

        Result<CouponDto> result = couponService.create(request);

        assertThat(result.isError()).isTrue();
        assertThat(result.getErrorCode()).isEqualTo(CouponErrorCodes.COUPON_NOT_APPLICABLE.getCode());
        verify(couponRepository, never()).save(any());
    }

    @Test
    void redeem_blankCode_succeedsWithoutTouchingRepositories() {
        Result<Void> result = couponService.redeem("   ", 7L, Order.builder().id(1L).build());

        assertThat(result.isSuccess()).isTrue();
        verifyNoInteractions(couponRepository, couponRedisLimiterService, couponRedemptionRepository);
    }

    @Test
    void redeem_returnsLimitErrorWhenRedisLimiterRejects() {
        Coupon coupon = Coupon.builder().id(UUID.randomUUID()).code("SAVE20").usageLimitGlobal(5).usageLimitPerUser(1).build();
        when(userService.findById(7L)).thenReturn(Result.success(user));
        when(couponRepository.findByCodeIgnoreCaseForUpdate("SAVE20")).thenReturn(Optional.of(coupon));
        when(couponRedisLimiterService.acquireCouponUsage(eq("SAVE20"), eq(7L), eq(5), eq(1), anyLong()))
                .thenReturn(-2);

        Result<Void> result = couponService.redeem("save20", 7L, Order.builder().id(1L).build());

        assertThat(result.isError()).isTrue();
        assertThat(result.getErrorCode()).isEqualTo(CouponErrorCodes.COUPON_USAGE_LIMIT_REACHED.getCode());
        verify(couponRedemptionRepository, never()).save(any());
    }

    @Test
    void redeem_rollsBackRedisUsageWhenValidationFailsAfterAcquireAndTransactionRollsBack() {
        Coupon coupon = Coupon.builder().id(UUID.randomUUID()).code("SAVE20").usageLimitGlobal(5).usageLimitPerUser(1).build();
        when(userService.findById(7L)).thenReturn(Result.success(user));
        when(couponRepository.findByCodeIgnoreCaseForUpdate("SAVE20")).thenReturn(Optional.of(coupon));
        when(couponRedisLimiterService.acquireCouponUsage(eq("SAVE20"), eq(7L), eq(5), eq(1), anyLong()))
                .thenReturn(1);
        when(couponValidator.validateUsable(coupon, user)).thenReturn(Result.error(CouponErrorCodes.COUPON_EXPIRED));

        TransactionSynchronizationManager.initSynchronization();
        try {
            Result<Void> result = couponService.redeem("SAVE20", 7L, Order.builder().id(1L).build());
            assertThat(result.isError()).isTrue();
            assertThat(result.getErrorCode()).isEqualTo(CouponErrorCodes.COUPON_EXPIRED.getCode());

            for (TransactionSynchronization sync : TransactionSynchronizationManager.getSynchronizations()) {
                sync.afterCompletion(TransactionSynchronization.STATUS_ROLLED_BACK);
            }
            verify(couponRedisLimiterService).releaseCouponUsage("SAVE20", 7L);
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void redeem_persistsRedemptionAndKeepsUsageWhenCommitted() {
        Coupon coupon = Coupon.builder().id(UUID.randomUUID()).code("SAVE20").usageLimitGlobal(5).usageLimitPerUser(1).build();
        Order order = Order.builder().id(55L).build();
        when(userService.findById(7L)).thenReturn(Result.success(user));
        when(couponRepository.findByCodeIgnoreCaseForUpdate("SAVE20")).thenReturn(Optional.of(coupon));
        when(couponRedisLimiterService.acquireCouponUsage(eq("SAVE20"), eq(7L), eq(5), eq(1), anyLong()))
                .thenReturn(1);
        when(couponValidator.validateUsable(coupon, user)).thenReturn(Result.success());

        TransactionSynchronizationManager.initSynchronization();
        try {
            Result<Void> result = couponService.redeem("SAVE20", 7L, order);
            assertThat(result.isSuccess()).isTrue();
            verify(couponRedemptionRepository).save(any(CouponRedemption.class));

            for (TransactionSynchronization sync : TransactionSynchronizationManager.getSynchronizations()) {
                sync.afterCompletion(TransactionSynchronization.STATUS_COMMITTED);
            }
            verify(couponRedisLimiterService, never()).releaseCouponUsage(any(), any());
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void listActiveForUser_filtersOutIneligibleAndAlreadyParticipatedCoupons() {
        UUID participatedId = UUID.randomUUID();
        UUID eligibleId = UUID.randomUUID();
        Coupon participated = Coupon.builder().id(participatedId).code("USED").build();
        Coupon eligible = Coupon.builder().id(eligibleId).code("FRESH").build();

        when(userService.findById(7L)).thenReturn(Result.success(user));
        when(couponRedemptionRepository.findDistinctCouponIdsByUser_Id(7L)).thenReturn(List.of(participatedId));
        when(couponRepository.findActiveNow(any())).thenReturn(List.of(participated, eligible));
        when(couponValidator.validateUserEligible(participated, user)).thenReturn(Result.success());
        when(couponValidator.validateUserEligible(eligible, user)).thenReturn(Result.success());
        when(couponMapper.toActiveDto(participated, user))
                .thenReturn(ActiveCouponDto.builder().id(participatedId).code("USED").build());
        when(couponMapper.toActiveDto(eligible, user))
                .thenReturn(ActiveCouponDto.builder().id(eligibleId).code("FRESH").build());

        List<ActiveCouponDto> result = couponService.listActiveForUser(7L);

        assertThat(result).extracting(ActiveCouponDto::getCode).containsExactly("FRESH");
    }

    @Test
    void audienceStats_returnsFirstOrderEligibleUserCount() {
        when(userRepository.countUsersNeverCompletedPaidOrder(PaymentStatus.COMPLETED)).thenReturn(42L);

        Result<CouponAudienceStatsDto> result = couponService.audienceStats(CouponAudience.NEVER_ORDERED_FIRST_ORDER);

        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData().getEligibleUserCount()).isEqualTo(42L);
    }
}
