package com.serhat.secondhand.pricing.service;

import com.serhat.secondhand.campaign.service.CampaignService;
import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.coupon.entity.Coupon;
import com.serhat.secondhand.coupon.service.CouponService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.pricing.calculator.CampaignDiscountCalculator;
import com.serhat.secondhand.pricing.calculator.CouponDiscountCalculator;
import com.serhat.secondhand.pricing.dto.AppliedCampaignDto;
import com.serhat.secondhand.pricing.dto.PricedCartItemDto;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.pricing.handler.OfferPriceHandler;
import com.serhat.secondhand.pricing.mapper.PricingMapper;
import com.serhat.secondhand.pricing.util.PricingUtil;
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
    private final CouponService couponService;
    private final CampaignDiscountCalculator campaignDiscountCalculator;
    private final CouponDiscountCalculator couponDiscountCalculator;
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

        var activeCampaigns = campaignService.loadActiveCampaignsForSellers(sellerIds);
        Map<Long, List<com.serhat.secondhand.campaign.entity.Campaign>> campaignsBySeller =
                campaignDiscountCalculator.groupCampaignsBySeller(activeCampaigns);

        BigDecimal originalSubtotal = BigDecimal.ZERO;
        BigDecimal subtotalAfterCampaigns = BigDecimal.ZERO;
        BigDecimal campaignDiscountTotal = BigDecimal.ZERO;

        Map<Long, BigDecimal> sellerSubtotalsAfterCampaign = new HashMap<>();
        List<PricedCartItemDto> pricedItems = new ArrayList<>();
        Set<ListingType> cartTypes = new HashSet<>();

        for (Cart cartItem : cartItems) {
            Listing listing = cartItem.getListing();
            if (listing == null) continue;

            ListingType type = listing.getListingType();
            if (type != null && type != ListingType.REAL_ESTATE && type != ListingType.VEHICLE) {
                cartTypes.add(type);
            }

            boolean isOfferLine = OfferPriceHandler.isOfferLine(offerOverride, listing.getId());

            int defaultQuantity = cartItem.getQuantity() != null ? cartItem.getQuantity() : 1;
            BigDecimal defaultUnitPrice = PricingUtil.scale(listing.getPrice());

            OfferPriceHandler.OfferPriceResult offerResult = OfferPriceHandler.applyOfferOverride(
                    offerOverride, defaultQuantity, defaultUnitPrice);

            int quantity = offerResult.getQuantity();
            BigDecimal unitPrice = offerResult.getUnitPrice();
            BigDecimal lineOriginal = offerResult.getLineTotal();

            AppliedCampaignDto appliedCampaign = null;
            BigDecimal campaignUnitPrice = unitPrice;

            if (!isOfferLine && type != ListingType.REAL_ESTATE && type != ListingType.VEHICLE) {
                List<com.serhat.secondhand.campaign.entity.Campaign> sellerCampaigns =
                        campaignsBySeller.getOrDefault(listing.getSeller().getId(), List.of());

                AppliedCampaignDto best = campaignDiscountCalculator.findBestCampaignForListing(sellerCampaigns, listing);
                if (best != null && best.getDiscountAmount() != null && best.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                    appliedCampaign = best;
                    campaignUnitPrice = PricingUtil.scale(unitPrice.subtract(best.getDiscountAmount()));
                    campaignUnitPrice = campaignUnitPrice.max(BigDecimal.ZERO);
                }
            }

            BigDecimal lineAfterCampaign;
            if (isOfferLine && offerOverride != null && offerOverride.getTotalPrice() != null) {
                lineAfterCampaign = PricingUtil.scale(offerOverride.getTotalPrice());
            } else {
                lineAfterCampaign = PricingUtil.scale(campaignUnitPrice.multiply(BigDecimal.valueOf(quantity)));
            }

            BigDecimal lineCampaignDiscount = isOfferLine ? BigDecimal.ZERO : PricingUtil.scale(lineOriginal.subtract(lineAfterCampaign));

            originalSubtotal = originalSubtotal.add(lineOriginal);
            subtotalAfterCampaigns = subtotalAfterCampaigns.add(lineAfterCampaign);
            campaignDiscountTotal = campaignDiscountTotal.add(lineCampaignDiscount);

            Long sellerId = listing.getSeller().getId();
            sellerSubtotalsAfterCampaign.put(sellerId,
                    PricingUtil.scale(sellerSubtotalsAfterCampaign.getOrDefault(sellerId, BigDecimal.ZERO).add(lineAfterCampaign)));

            pricedItems.add(pricingMapper.toPricedCartItemDto(
                    listing, sellerId, type, quantity, unitPrice, campaignUnitPrice, lineAfterCampaign, appliedCampaign));
        }

        BigDecimal couponEligibleSubtotal = subtotalAfterCampaigns;
        Coupon coupon = null;
        String normalizedCouponCode = pricingMapper.normalizeCouponCode(couponCode);

        if (normalizedCouponCode != null) {
            var couponResult = couponService.getValidCoupon(normalizedCouponCode, buyer.getId(), cartTypes, couponEligibleSubtotal);
            if (couponResult.isSuccess()) {
                coupon = couponResult.getData();
            }
        }

        BigDecimal couponDiscount = coupon == null ? BigDecimal.ZERO :
                couponDiscountCalculator.computeCouponDiscount(coupon, pricedItems);

        BigDecimal total = PricingUtil.scale(subtotalAfterCampaigns.subtract(couponDiscount));
        BigDecimal discountTotal = PricingUtil.scale(campaignDiscountTotal.add(couponDiscount));

        Map<Long, BigDecimal> payableBySeller = couponDiscountCalculator.allocateCouponAcrossSellers(
                sellerSubtotalsAfterCampaign, couponDiscount);

        return pricingMapper.toResult(originalSubtotal, subtotalAfterCampaigns, campaignDiscountTotal,
                normalizedCouponCode, couponDiscount, discountTotal, total, payableBySeller, pricedItems);
    }
}