package com.serhat.secondhand.pricing.service;

import com.serhat.secondhand.campaign.entity.Campaign;
import com.serhat.secondhand.campaign.service.CampaignService;
import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.coupon.entity.Coupon;
import com.serhat.secondhand.coupon.repository.CouponRepository;
import com.serhat.secondhand.coupon.validator.CouponValidator;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
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
public class PricingService {

    private final CampaignService campaignService;
    private final CouponRepository couponRepository;
    private final CouponValidator couponValidator;
    private final PriceCalculationEngine priceCalculationEngine;
    private final PricingMapper pricingMapper;

    public PricingResultDto priceCart(User buyer, List<Cart> cartItems, String couponCode) {
        return priceCartInternal(buyer, cartItems, couponCode, null);
    }

    public PricingResultDto priceCart(User buyer, List<Cart> cartItems, String couponCode, UUID offerListingId, Integer offerQuantity, BigDecimal offerTotalPrice) {
        OfferPriceHandler.OfferOverride override = null;
        if (offerListingId != null) {
            override = OfferPriceHandler.OfferOverride.builder()
                    .listingId(offerListingId)
                    .quantity(offerQuantity)
                    .totalPrice(offerTotalPrice)
                    .build();
        }
        return priceCartInternal(buyer, cartItems, couponCode, override);
    }

    private PricingResultDto priceCartInternal(User buyer, List<Cart> cartItems, String couponCode, OfferPriceHandler.OfferOverride offerOverride) {
        if (cartItems == null || cartItems.isEmpty()) {
            return pricingMapper.toEmptyResult();
        }

        List<Long> sellerIds = cartItems.stream()
                .map(ci -> ci.getListing().getSeller().getId())
                .distinct()
                .toList();

        List<Campaign> activeCampaigns = campaignService.loadActiveCampaignsForSellers(sellerIds);
        Map<Long, List<Campaign>> campaignsBySeller = priceCalculationEngine.groupCampaignsBySeller(activeCampaigns);

        Coupon coupon = null;
        String normalizedCouponCode = pricingMapper.normalizeCouponCode(couponCode);

        if (normalizedCouponCode != null) {
            coupon = couponRepository.findByCodeIgnoreCase(normalizedCouponCode).orElse(null);
            if (coupon != null) {
                Set<ListingType> cartTypes = priceCalculationEngine.extractCartTypes(cartItems);
                BigDecimal preliminarySubtotal = calculatePreliminarySubtotal(cartItems);
                
                Result<Void> validationResult = couponValidator.validateCouponForCart(
                        coupon, buyer, cartTypes, preliminarySubtotal);
                
                if (validationResult.isError()) {
                    coupon = null;
                }
            }
        }

        return priceCalculationEngine.calculateCartPricing(cartItems, campaignsBySeller, coupon, offerOverride);
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