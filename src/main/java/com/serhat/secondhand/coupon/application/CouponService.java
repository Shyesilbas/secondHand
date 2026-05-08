package com.serhat.secondhand.coupon.application;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.coupon.dto.*;
import com.serhat.secondhand.coupon.entity.Coupon;
import com.serhat.secondhand.coupon.entity.CouponAudience;
import com.serhat.secondhand.coupon.entity.CouponRedemption;
import com.serhat.secondhand.coupon.mapper.CouponMapper;
import com.serhat.secondhand.coupon.repository.CouponRedemptionRepository;
import com.serhat.secondhand.coupon.repository.CouponRepository;
import com.serhat.secondhand.coupon.util.CouponErrorCodes;
import com.serhat.secondhand.coupon.validator.CouponValidator;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.application.IOfferService;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.pricing.application.IPricingService;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
@Slf4j
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponRedemptionRepository couponRedemptionRepository;
    private final CouponMapper couponMapper;
    private final CouponValidator couponValidator;
    private final CartRepository cartRepository;
    private final IOfferService offerService;
    private final IPricingService pricingService;
    private final IUserService userService;
    private final UserRepository userRepository;

    public CouponService(
            CouponRepository couponRepository,
            CouponRedemptionRepository couponRedemptionRepository,
            CouponMapper couponMapper,
            CouponValidator couponValidator,
            CartRepository cartRepository,
            IOfferService offerService,
            IPricingService pricingService,
            IUserService userService,
            UserRepository userRepository) {
        this.couponRepository = couponRepository;
        this.couponRedemptionRepository = couponRedemptionRepository;
        this.couponMapper = couponMapper;
        this.couponValidator = couponValidator;
        this.cartRepository = cartRepository;
        this.offerService = offerService;
        this.pricingService = pricingService;
        this.userService = userService;
        this.userRepository = userRepository;
    }

    public Result<CouponDto> create(CreateCouponRequest request) {
        Coupon coupon = couponMapper.fromCreateRequest(request);
        coupon.setCode(normalizeCode(coupon.getCode()));
        normalizeCouponAudience(coupon);

        Result<Set<ListingType>> normalizeResult = normalizeEligibleTypes(coupon.getEligibleTypes());
        if (normalizeResult.isError()) {
            return Result.error(normalizeResult.getErrorCode(), normalizeResult.getMessage());
        }
        coupon.setEligibleTypes(normalizeResult.getData());

        Result<Void> validationResult = couponValidator.validateForCreateOrUpdate(coupon);
        if (validationResult.isError()) {
            return Result.error(validationResult.getErrorCode(), validationResult.getMessage());
        }

        return Result.success(couponMapper.toDto(couponRepository.save(coupon)));
    }

    public Result<CouponDto> update(UUID id, UpdateCouponRequest request) {
        return couponRepository.findById(id)
                .map(coupon -> performUpdate(coupon, request))
                .orElseGet(() -> Result.error(CouponErrorCodes.COUPON_NOT_FOUND));
    }
    
    private Result<CouponDto> performUpdate(Coupon coupon, UpdateCouponRequest request) {
        couponMapper.applyUpdate(coupon, request);
        normalizeCouponAudience(coupon);
        Result<Set<ListingType>> normalizeResult = normalizeEligibleTypes(coupon.getEligibleTypes());
        if (normalizeResult.isError()) {
            return Result.error(normalizeResult.getErrorCode(), normalizeResult.getMessage());
        }

        coupon.setEligibleTypes(normalizeResult.getData());
        Result<Void> validationResult = couponValidator.validateForCreateOrUpdate(coupon);
        if (validationResult.isError()) {
            return Result.error(validationResult.getErrorCode(), validationResult.getMessage());
        }

        return Result.success(couponMapper.toDto(couponRepository.save(coupon)));
    }

    public Result<Void> redeem(String code, Long userId, Order order) {
        if (code == null || code.isBlank()) return Result.success();

        var userResult = userService.findById(userId);
        if (userResult.isError()) return Result.error(userResult.getErrorCode(), userResult.getMessage());

        return couponRepository.findByCodeIgnoreCase(normalizeCode(code))
                .map(coupon -> {
                    CouponRedemption redemption = CouponRedemption.builder()
                            .coupon(coupon)
                            .user(userResult.getData())
                            .order(order)
                            .build();
                    couponRedemptionRepository.save(redemption);
                    return Result.<Void>success();
                })
                .orElseGet(() -> Result.error(CouponErrorCodes.COUPON_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public PricingResultDto previewPricing(Long userId, CouponPreviewRequest request) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) return null;

        User user = userResult.getData();
        var cartItems = cartRepository.findByUserId(userId);

        Offer acceptedOffer = null;
        List<Cart> effectiveCartItems = cartItems;

        if (request != null && request.getOfferId() != null) {
            var offerResult = offerService.getAcceptedOfferForCheckout(userId, request.getOfferId());
            if (offerResult.isSuccess()) {
                acceptedOffer = offerResult.getData();
                effectiveCartItems = buildEffectiveCartItems(cartItems, acceptedOffer, user);
            }
        }

        String couponCode = request != null ? request.getCouponCode() : null;

        if (acceptedOffer != null) {
            return pricingService.priceCart(
                    user,
                    effectiveCartItems,
                    couponCode,
                    acceptedOffer.getListing().getId(),
                    acceptedOffer.getQuantity(),
                    acceptedOffer.getTotalPrice()
            );
        } else {
            return pricingService.priceCart(user, effectiveCartItems, couponCode);
        }
    }

    private List<Cart> buildEffectiveCartItems(List<Cart> cartItems, Offer acceptedOffer, User user) {
        List<Cart> effectiveCartItems = new ArrayList<>();
        UUID offerListingId = acceptedOffer.getListing().getId();

        for (var cartItem : cartItems) {
            if (cartItem.getListing() != null && cartItem.getListing().getId().equals(offerListingId)) {
                continue;
            }
            effectiveCartItems.add(cartItem);
        }

        effectiveCartItems.add(Cart.builder()
                .user(user)
                .listing(acceptedOffer.getListing())
                .quantity(acceptedOffer.getQuantity())
                .build());

        return effectiveCartItems;
    }

    @Transactional(readOnly = true)
    public List<ActiveCouponDto> listActiveForUser(Long userId) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) return List.of();

        User user = userResult.getData();
        Set<UUID> participated = new HashSet<>(couponRedemptionRepository.findDistinctCouponIdsByUser_Id(userId));
        return couponRepository.findActiveNow(LocalDateTime.now())
                .stream()
                .filter(c -> couponValidator.validateUserEligible(c, user).isSuccess())
                .map(coupon -> couponMapper.toActiveDto(coupon, user))
                .filter(d -> !participated.contains(d.getId()))
                .toList();
    }

    /** Redemptions for this user with order link (may be null if order absent). */
    @Transactional(readOnly = true)
    public List<CouponParticipationDto> listParticipationsForUser(Long userId) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) return List.of();
        return couponRedemptionRepository.findByUser_IdWithCouponAndOrderOrderByRedeemedAtDesc(userId).stream()
                .map(this::toParticipationDto)
                .toList();
    }

    private CouponParticipationDto toParticipationDto(CouponRedemption r) {
        Coupon coupon = r.getCoupon();
        Order order = r.getOrder();
        return CouponParticipationDto.builder()
                .redemptionId(r.getId())
                .couponId(coupon.getId())
                .couponCode(coupon.getCode())
                .couponTitle(coupon.getTitle())
                .couponDescription(coupon.getDescription())
                .redeemedAt(r.getRedeemedAt())
                .orderId(order != null ? order.getId() : null)
                .orderNumber(order != null ? order.getOrderNumber() : null)
                .build();
    }

    @Transactional(readOnly = true)
    public Result<Coupon> getValidCoupon(String code, Long userId, Set<ListingType> cartTypes, java.math.BigDecimal eligibleSubtotal) {
        return couponRepository.findByCodeIgnoreCase(normalizeCode(code))
                .map(coupon -> validateCoupon(coupon, userId, cartTypes, eligibleSubtotal))
                .orElseGet(() -> Result.error(CouponErrorCodes.COUPON_NOT_FOUND));
    }
    
    private Result<Coupon> validateCoupon(Coupon coupon, Long userId, Set<ListingType> cartTypes, java.math.BigDecimal eligibleSubtotal) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) return Result.error(userResult.getErrorCode(), userResult.getMessage());

        Result<Void> usableResult = couponValidator.validateUsable(coupon, userResult.getData());
        if (usableResult.isError()) return Result.error(usableResult.getErrorCode(), usableResult.getMessage());

        Set<ListingType> effectiveEligibleTypes = (coupon.getEligibleTypes() == null || coupon.getEligibleTypes().isEmpty())
                ? defaultEligibleTypes() : coupon.getEligibleTypes();

        if (cartTypes == null || cartTypes.stream().noneMatch(effectiveEligibleTypes::contains)) {
            return Result.error(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }

        if (coupon.getMinSubtotal() != null && eligibleSubtotal != null && eligibleSubtotal.compareTo(coupon.getMinSubtotal()) < 0) {
            return Result.error(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }

        return Result.success(coupon);
    }

    @Transactional(readOnly = true)
    public List<CouponDto> listAll() {
        return couponRepository.findAll()
                .stream()
                .map(couponMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Result<CouponAudienceStatsDto> audienceStats(CouponAudience audience) {
        if (audience == null) {
            return Result.error(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }
        if (audience != CouponAudience.NEVER_ORDERED_FIRST_ORDER) {
            return Result.success(CouponAudienceStatsDto.builder()
                    .audience(audience)
                    .eligibleUserCount(0L)
                    .build());
        }
        long count = userRepository.countUsersNeverCompletedPaidOrder(PaymentStatus.COMPLETED);
        return Result.success(CouponAudienceStatsDto.builder()
                .audience(audience)
                .eligibleUserCount(count)
                .build());
    }

    private void normalizeCouponAudience(Coupon coupon) {
        if (coupon.getEligibleUserIds() == null) {
            coupon.setEligibleUserIds(new LinkedHashSet<>());
        }

        CouponAudience audience = coupon.getAudience();
        if (audience == null) {
            audience = coupon.isForAllUsers() ? CouponAudience.ALL_USERS : CouponAudience.USER_ID_LIST;
            coupon.setAudience(audience);
        }

        switch (audience) {
            case ALL_USERS -> {
                coupon.setForAllUsers(true);
                coupon.getEligibleUserIds().clear();
            }
            case USER_ID_LIST -> coupon.setForAllUsers(false);
            case NEVER_ORDERED_FIRST_ORDER -> {
                coupon.setForAllUsers(false);
                coupon.getEligibleUserIds().clear();
            }
        }
    }

    private String normalizeCode(String code) {
        return code == null ? null : code.trim().toUpperCase();
    }

    private Result<Set<ListingType>> normalizeEligibleTypes(Set<ListingType> types) {
        if (types == null || types.isEmpty()) {
            return Result.success(defaultEligibleTypes());
        }
        if (types.contains(ListingType.REAL_ESTATE) || types.contains(ListingType.VEHICLE)) {
            return Result.error(CouponErrorCodes.COUPON_NOT_APPLICABLE);
        }
        return Result.success(types);
    }

    private Set<ListingType> defaultEligibleTypes() {
        EnumSet<ListingType> all = EnumSet.allOf(ListingType.class);
        all.remove(ListingType.REAL_ESTATE);
        all.remove(ListingType.VEHICLE);
        return all;
    }
}