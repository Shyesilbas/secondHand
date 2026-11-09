package com.serhat.secondhand.pricing.application;

import com.serhat.secondhand.campaign.entity.Campaign;
import com.serhat.secondhand.campaign.application.ICampaignService;
import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.coupon.entity.Coupon;
import com.serhat.secondhand.coupon.repository.CouponRepository;
import com.serhat.secondhand.coupon.util.CouponErrorCodes;
import com.serhat.secondhand.coupon.validator.CouponValidator;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.pricing.engine.PriceCalculationEngine;
import com.serhat.secondhand.pricing.handler.OfferPriceHandler;
import com.serhat.secondhand.pricing.mapper.PricingMapper;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PricingService implements IPricingService {

    private final ICampaignService campaignService;
    private final CouponRepository couponRepository;
    private final CouponValidator couponValidator;
    private final PriceCalculationEngine priceCalculationEngine;
    private final PricingMapper pricingMapper;

    public PricingResultDto priceCart(User buyer, List<Cart> cartItems, String couponCode) {
        return priceCartInternal(buyer, cartItems, couponCode, null);
    }

    public PricingResultDto priceCart(User buyer, List<Cart> cartItems, String couponCode, UUID offerListingId, Integer offerQuantity, BigDecimal offerTotalPrice) {
        return priceCartInternal(buyer, cartItems, couponCode, toOfferOverride(offerListingId, offerQuantity, offerTotalPrice));
    }

    /**
     * Checkout pricing: a coupon the buyer asked for must apply. Where {@link #priceCart} drops a
     * rejected coupon and returns the price without it (preview), this returns the coupon's error code,
     * so an order is never created at a price the buyer did not see.
     */
    @Override
    public Result<PricingResultDto> priceCartForCheckout(User buyer, List<Cart> cartItems, String couponCode,
                                                         UUID offerListingId, Integer offerQuantity, BigDecimal offerTotalPrice) {
        PricingOutcome outcome = price(buyer, cartItems, couponCode, toOfferOverride(offerListingId, offerQuantity, offerTotalPrice));
        if (outcome.couponRejection() != null) {
            return Result.error(outcome.couponRejection().getMessage(), outcome.couponRejection().getErrorCode());
        }
        return Result.success(outcome.pricing());
    }

    private OfferPriceHandler.OfferOverride toOfferOverride(UUID offerListingId, Integer offerQuantity, BigDecimal offerTotalPrice) {
        if (offerListingId == null) {
            return null;
        }
        return OfferPriceHandler.OfferOverride.builder()
                .listingId(offerListingId)
                .quantity(offerQuantity)
                .totalPrice(offerTotalPrice)
                .build();
    }

    private PricingResultDto priceCartInternal(User buyer, List<Cart> cartItems, String couponCode, OfferPriceHandler.OfferOverride offerOverride) {
        return price(buyer, cartItems, couponCode, offerOverride).pricing();
    }

    /** {@code couponRejection} is set when a coupon code was given but not applied. */
    private record PricingOutcome(PricingResultDto pricing, Result<Void> couponRejection) {
    }

    private PricingOutcome price(User buyer, List<Cart> cartItems, String couponCode, OfferPriceHandler.OfferOverride offerOverride) {
        if (cartItems == null || cartItems.isEmpty()) {
            return new PricingOutcome(pricingMapper.toEmptyResult(), null);
        }

        List<Long> sellerIds = cartItems.stream()
                .map(ci -> ci.getListing().getSeller().getId())
                .distinct()
                .toList();

        List<Campaign> activeCampaigns = campaignService.loadActiveCampaignsForSellers(sellerIds);
        Map<Long, List<Campaign>> campaignsBySeller = priceCalculationEngine.groupCampaignsBySeller(activeCampaigns);

        // 1. Calculate pricing without coupon first to get true subtotal after campaigns
        PricingResultDto campaignPricing = priceCalculationEngine.calculateCartPricing(cartItems, campaignsBySeller, null, offerOverride);

        String normalizedCouponCode = pricingMapper.normalizeCouponCode(couponCode);
        if (normalizedCouponCode == null) {
            return new PricingOutcome(campaignPricing, null);
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(normalizedCouponCode).orElse(null);
        if (coupon == null) {
            return new PricingOutcome(campaignPricing, Result.error(CouponErrorCodes.COUPON_NOT_FOUND));
        }

        Set<ListingType> cartTypes = priceCalculationEngine.extractCartTypes(cartItems);
        BigDecimal postCampaignSubtotal = campaignPricing.getSubtotalAfterCampaigns();
        Result<Void> validationResult = couponValidator.validateCouponForCart(
                coupon, buyer, cartTypes, postCampaignSubtotal);
        if (validationResult.isError()) {
            return new PricingOutcome(campaignPricing, validationResult);
        }

        PricingResultDto couponPricing = priceCalculationEngine.calculateCartPricing(cartItems, campaignsBySeller, coupon, offerOverride);
        boolean noDiscount = couponPricing.getCouponDiscount() == null || couponPricing.getCouponDiscount().signum() <= 0;
        return new PricingOutcome(couponPricing, noDiscount ? Result.error(CouponErrorCodes.COUPON_NOT_APPLICABLE) : null);
    }

    private BigDecimal calculatePreliminarySubtotal(List<Cart> cartItems) {
        BigDecimal subtotal = BigDecimal.ZERO;
        for (Cart item : cartItems) {
            if (item.getListing() != null) {
                int quantity = item.getQuantity() != null ? item.getQuantity() : 1;
                BigDecimal lineTotal = item.getListing().getPrice().multiply(BigDecimal.valueOf(quantity));
                subtotal = subtotal.add(lineTotal);
            }
        }
        return subtotal;
    }
}